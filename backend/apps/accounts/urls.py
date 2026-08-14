from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("verify-email/resend/", views.ResendVerificationView.as_view(), name="resend-verification"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("login/google/", views.GoogleLoginView.as_view(), name="google-login"),
    path("refresh/", views.RefreshView.as_view(), name="refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("password/forgot/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/reset/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("password/change/", views.ChangePasswordView.as_view(), name="change-password"),
    path("me/", views.MeView.as_view(), name="me"),
    path("users/", views.UserListView.as_view(), name="user-list"),
    path("users/<uuid:id>/", views.UserDetailView.as_view(), name="user-detail"),
    path("users/<uuid:id>/status/", views.UserStatusUpdateView.as_view(), name="user-status"),
    path("users/<uuid:id>/roles/", views.UserRoleUpdateView.as_view(), name="user-roles"),
]
