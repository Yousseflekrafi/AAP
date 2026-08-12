from django.conf import settings
from django.contrib.auth import authenticate
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.models import SecurityEvent
from apps.audit.services import log_security_event

from . import bruteforce, otp
from .cookies import clear_refresh_cookie, set_refresh_cookie
from .mailer import send_password_reset_email, send_verification_email
from .models import User
from .permissions import IsAdmin
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResendVerificationSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)


def _issue_tokens_response(user, status_code=status.HTTP_200_OK):
    refresh = RefreshToken.for_user(user)
    response = Response(
        {"access": str(refresh.access_token), "user": UserSerializer(user).data},
        status=status_code,
    )
    set_refresh_cookie(response, refresh)
    return response


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-register"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        code = otp.issue_email_verification_code(user.id)
        send_verification_email(user, code)
        return Response(
            {"detail": "Account created. Check your email for a verification code."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-email-verify"

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not otp.check_email_verification_code(user.id, code):
            return Response({"detail": "Invalid or expired code."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])
        return _issue_tokens_response(user)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-email-verify"

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        user = User.objects.filter(email=email, is_email_verified=False).first()
        if user:
            code = otp.issue_email_verification_code(user.id)
            send_verification_email(user, code)
        # Same response whether or not the account exists, to avoid enumeration.
        return Response({"detail": "If the account exists, a verification code was sent."})


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        lockout_key = f"{email}:{request.META.get('REMOTE_ADDR', '')}"
        if bruteforce.is_locked_out(lockout_key):
            log_security_event(
                request,
                event_type="login_locked_out",
                severity=SecurityEvent.Severity.WARNING,
                description="Login blocked after repeated failures",
                metadata={"email": email},
            )
            return Response(
                {"detail": "Too many failed attempts. Try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        user = authenticate(request, username=email, password=password)
        if user is None:
            bruteforce.register_failed_attempt(lockout_key)
            log_security_event(
                request,
                event_type="login_failed",
                severity=SecurityEvent.Severity.WARNING,
                description="Invalid credentials",
                metadata={"email": email},
            )
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"detail": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        if not user.is_email_verified:
            return Response({"detail": "Email not verified."}, status=status.HTTP_403_FORBIDDEN)

        bruteforce.reset_attempts(lockout_key)
        log_security_event(request, event_type="login_success", user=user, metadata={"email": email})
        return _issue_tokens_response(user)


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if not raw_token:
            return Response({"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(raw_token)
            access = refresh.access_token
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({"access": str(access)})

        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            if settings.SIMPLE_JWT.get("BLACKLIST_AFTER_ROTATION"):
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass
            user_id = refresh[settings.SIMPLE_JWT["USER_ID_CLAIM"]]
            new_refresh = RefreshToken.for_user(User.objects.get(pk=user_id))
            set_refresh_cookie(response, new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if raw_token:
            try:
                RefreshToken(raw_token).blacklist()
            except (TokenError, AttributeError):
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-password-reset"

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        user = User.objects.filter(email=email, is_active=True).first()
        if user:
            token = otp.issue_password_reset_token(user.id)
            send_password_reset_email(user, token)
        return Response({"detail": "If the account exists, a reset link was sent."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-password-reset"

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        user_id = otp.consume_password_reset_token(token)
        if not user_id:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=["password"])
        log_security_event(request, event_type="password_reset", user=user, severity=SecurityEvent.Severity.WARNING)
        return Response({"detail": "Password updated."})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-login"

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["id_token"]

        try:
            payload = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError:
            return Response({"detail": "Invalid Google token."}, status=status.HTTP_401_UNAUTHORIZED)

        email = payload.get("email")
        if not email or not payload.get("email_verified"):
            return Response({"detail": "Google account email not verified."}, status=status.HTTP_401_UNAUTHORIZED)

        user, created = User.objects.get_or_create(
            email=email.lower(),
            defaults={
                "first_name": payload.get("given_name", ""),
                "last_name": payload.get("family_name", ""),
                "auth_provider": "google",
                "is_email_verified": True,
            },
        )
        if not user.is_email_verified:
            user.is_email_verified = True
            user.save(update_fields=["is_email_verified"])

        if not user.is_active:
            return Response({"detail": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        log_security_event(request, event_type="google_login", user=user)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return _issue_tokens_response(user, status_code=status_code)


class MeView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        log_security_event(request, event_type="password_changed", user=user, severity=SecurityEvent.Severity.WARNING)
        return Response({"detail": "Password updated."})


class UserListView(ListAPIView):
    """Admin-only: powers the admin Users page."""

    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all().prefetch_related("roles")
    filterset_fields = ["is_active", "is_email_verified", "auth_provider"]
    search_fields = ["email", "first_name", "last_name"]


class UserDetailView(RetrieveAPIView):
    """Admin-only: powers the admin User details page."""

    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all().prefetch_related("roles")
    lookup_field = "id"
