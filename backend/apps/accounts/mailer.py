from django.conf import settings
from django.core.mail import send_mail


def send_verification_email(user, code):
    send_mail(
        subject="Verify your AAP account",
        message=f"Your verification code is {code}. It expires in 15 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_invite_email(user, token, organization_name):
    set_password_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject=f"You were added to {organization_name} on AAP",
        message=(
            f"You've been added to {organization_name} on AAP. "
            f"Set your password to sign in: {set_password_url}\nThis link expires in 30 minutes."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_password_reset_email(user, token):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject="Reset your AAP password",
        message=f"Reset your password: {reset_url}\nThis link expires in 30 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
