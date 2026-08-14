from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import ONLINE_WINDOW

# Only touch the DB when the last recorded heartbeat is stale enough that an
# extra write is worth it — avoids a write on every single request.
_TOUCH_INTERVAL = ONLINE_WINDOW / 2


class HeartbeatJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return result
        user, _token = result
        now = timezone.now()
        if user.last_seen_at is None or now - user.last_seen_at > _TOUCH_INTERVAL:
            user.last_seen_at = now
            user.save(update_fields=["last_seen_at"])
        return result
