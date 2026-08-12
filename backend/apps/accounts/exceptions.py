import logging

from rest_framework.views import exception_handler as drf_exception_handler

security_logger = logging.getLogger("aap.security")

_SECURITY_RELEVANT_STATUS_CODES = {401, 403, 429}


def centralized_exception_handler(exc, context):
    """Wraps DRF's default handler: consistent error envelope, logs
    security-relevant failures without leaking sensitive payloads."""

    response = drf_exception_handler(exc, context)

    if response is None:
        security_logger.exception("Unhandled exception: %s", exc.__class__.__name__)
        return None

    request = context.get("request")
    if response.status_code in _SECURITY_RELEVANT_STATUS_CODES:
        security_logger.warning(
            "security_event status=%s path=%s method=%s",
            response.status_code,
            getattr(request, "path", "unknown"),
            getattr(request, "method", "unknown"),
        )

    detail = response.data
    response.data = {
        "error": {
            "code": response.status_code,
            "message": _flatten_detail(detail),
        }
    }
    return response


def _flatten_detail(detail):
    if isinstance(detail, dict):
        return detail
    if isinstance(detail, list):
        return [str(item) for item in detail]
    return str(detail)
