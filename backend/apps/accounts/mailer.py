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


def send_invite_email(user, password, organization_name, project_names):
    login_url = f"{settings.FRONTEND_URL}/login"
    projects_line = (
        f"Projects you now have access to: {', '.join(project_names)}."
        if project_names
        else "This organization has no projects yet."
    )
    send_mail(
        subject=f"You were added to {organization_name} on AAP",
        message=(
            f"Hi {user.full_name},\n\n"
            f"You've been added to {organization_name} on AAP.\n\n"
            f"Sign in at {login_url} with:\n"
            f"  Email: {user.email}\n"
            f"  Temporary password: {password}\n\n"
            f"{projects_line}\n\n"
            "We recommend changing your password after your first sign-in (Settings)."
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
