from django.conf import settings


def set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=str(refresh_token),
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=getattr(settings, "AUTH_COOKIE_SECURE", not settings.DEBUG),
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/api/auth/",
    )


def clear_refresh_cookie(response):
    response.delete_cookie(settings.AUTH_COOKIE_NAME, path="/api/auth/")
