import secrets

from django.conf import settings
from django.core.cache import cache

_EMAIL_VERIFICATION_PREFIX = "otp:email-verify:"
_PASSWORD_RESET_PREFIX = "otp:password-reset:"


def _generate_code(length=6):
    return "".join(secrets.choice("0123456789") for _ in range(length))


def _generate_token():
    return secrets.token_urlsafe(32)


def issue_email_verification_code(user_id):
    code = _generate_code()
    cache.set(
        f"{_EMAIL_VERIFICATION_PREFIX}{user_id}",
        code,
        timeout=settings.EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    )
    return code


def check_email_verification_code(user_id, code):
    key = f"{_EMAIL_VERIFICATION_PREFIX}{user_id}"
    stored = cache.get(key)
    if stored is not None and secrets.compare_digest(stored, code):
        cache.delete(key)
        return True
    return False


def issue_password_reset_token(user_id):
    token = _generate_token()
    cache.set(
        f"{_PASSWORD_RESET_PREFIX}{token}",
        str(user_id),
        timeout=settings.PASSWORD_RESET_TOKEN_TTL_SECONDS,
    )
    return token


def consume_password_reset_token(token):
    key = f"{_PASSWORD_RESET_PREFIX}{token}"
    user_id = cache.get(key)
    if user_id is not None:
        cache.delete(key)
    return user_id
