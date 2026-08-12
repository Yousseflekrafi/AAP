from .services import log_audit

_SKIP_PREFIXES = ("/static/", "/admin/jsi18n/")
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


class AuditLogMiddleware:
    """Logs mutating requests and API traffic. Read-only GETs on non-API
    routes are skipped to keep the audit trail focused on actions."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path.startswith(_SKIP_PREFIXES):
            return response

        should_log = request.path.startswith("/api/") and (
            request.method not in _SAFE_METHODS or response.status_code >= 400
        )
        if should_log:
            log_audit(
                request,
                action=f"{request.method} {request.path}",
                status_code=response.status_code,
            )

        return response
