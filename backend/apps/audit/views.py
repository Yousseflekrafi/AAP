from rest_framework.generics import ListAPIView

from apps.accounts.permissions import HasPermission

from .models import AuditLog, SecurityEvent
from .serializers import AuditLogSerializer, SecurityEventSerializer


class AuditLogListView(ListAPIView):
    permission_classes = [HasPermission("audit.view")]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related("user").all()
    filterset_fields = ["method", "status_code", "user"]
    search_fields = ["path", "action"]


class SecurityEventListView(ListAPIView):
    permission_classes = [HasPermission("audit.view")]
    serializer_class = SecurityEventSerializer
    queryset = SecurityEvent.objects.select_related("user").all()
    filterset_fields = ["severity", "event_type", "user"]
    search_fields = ["event_type", "description"]
