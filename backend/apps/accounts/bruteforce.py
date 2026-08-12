from django.core.cache import cache

MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
ATTEMPT_WINDOW_SECONDS = 15 * 60


def _key(identifier):
    return f"login-attempts:{identifier}"


def is_locked_out(identifier):
    return cache.get(_key(identifier), 0) >= MAX_ATTEMPTS


def register_failed_attempt(identifier):
    key = _key(identifier)
    attempts = cache.get(key, 0) + 1
    timeout = LOCKOUT_SECONDS if attempts >= MAX_ATTEMPTS else ATTEMPT_WINDOW_SECONDS
    cache.set(key, attempts, timeout=timeout)
    return attempts


def reset_attempts(identifier):
    cache.delete(_key(identifier))
