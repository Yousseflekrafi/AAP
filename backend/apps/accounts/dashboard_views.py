from django.utils import timezone
from datetime import timedelta
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_messages.models import AdminConversation
from apps.applications.models import Application
from apps.audit.models import SecurityEvent
from apps.connections.models import DatabaseConnection
from apps.organizations.models import Organization

from .models import Role, User
from .permissions import IsAdmin, IsSuperAdmin


class PlatformStatsView(APIView):
    """Super Admin dashboard: platform-wide counts (spec section 23)."""

    permission_classes = [IsSuperAdmin]

    def get(self, request):
        since_24h = timezone.now() - timedelta(hours=24)
        return Response(
            {
                "organizations": {
                    "total": Organization.objects.count(),
                    "active": Organization.objects.filter(status=Organization.Status.ACTIVE).count(),
                    "suspended": Organization.objects.filter(status=Organization.Status.SUSPENDED).count(),
                },
                "users": {
                    "total": User.objects.count(),
                    "active": User.objects.filter(is_active=True).count(),
                    "pending_verification": User.objects.filter(is_email_verified=False).count(),
                },
                "applications": {"total": Application.objects.count()},
                "connections": {
                    "total": DatabaseConnection.objects.count(),
                    "failing": DatabaseConnection.objects.filter(last_test_ok=False).count(),
                },
                "security": {
                    "events_last_24h": SecurityEvent.objects.filter(created_at__gte=since_24h).count(),
                    "critical_events_last_24h": SecurityEvent.objects.filter(
                        created_at__gte=since_24h, severity=SecurityEvent.Severity.CRITICAL
                    ).count(),
                },
                "admin_messages": {
                    "open": AdminConversation.objects.exclude(
                        status__in=[AdminConversation.Status.RESOLVED, AdminConversation.Status.CLOSED]
                    ).count(),
                },
            }
        )


class OrgStatsView(APIView):
    """Admin dashboard: counts scoped to the organizations this admin
    belongs to (owner/admin member) — never platform-wide (spec section
    24: "ADMIN should not automatically see other organizations")."""

    permission_classes = [IsAdmin]

    def get(self, request):
        user = request.user
        if user.has_role(Role.SUPER_ADMIN):
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(
                members__user=user, members__role__in=["owner", "admin"]
            ).distinct()

        applications = Application.objects.filter(organization__in=organizations)
        connections = DatabaseConnection.objects.filter(application__organization__in=organizations)

        return Response(
            {
                "organizations": organizations.count(),
                "members": sum(org.members.count() for org in organizations),
                "applications": applications.count(),
                "connections": {
                    "total": connections.count(),
                    "failing": connections.filter(last_test_ok=False).count(),
                },
            }
        )
