from .models import AuditLog, SecurityEvent


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_audit(request, *, action, status_code, metadata=None):
    user = getattr(request, "user", None)
    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        method=request.method,
        path=request.path,
        status_code=status_code,
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
        metadata=metadata or {},
    )


def log_security_event(request, *, event_type, severity=SecurityEvent.Severity.INFO, description="", metadata=None, user=None):
    if user is None:
        req_user = getattr(request, "user", None)
        user = req_user if req_user and req_user.is_authenticated else None
    SecurityEvent.objects.create(
        user=user,
        event_type=event_type,
        severity=severity,
        ip_address=get_client_ip(request) if request else None,
        description=description,
        metadata=metadata or {},
    )
