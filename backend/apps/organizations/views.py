from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role
from apps.accounts.permissions import IsSuperAdmin
from apps.audit.models import SecurityEvent
from apps.audit.services import log_security_event
from apps.notifications.models import Notification
from apps.notifications.services import notify, notify_many

from .models import Organization, OrganizationMember
from .permissions import IsOrgMember
from .serializers import OrganizationMemberSerializer, OrganizationSerializer, SuspendOrganizationSerializer


class OrganizationListCreateView(ListCreateAPIView):
    """Any verified user may create an organization and becomes its owner.
    Listing is scoped to organizations the requester belongs to, unless
    they're a platform admin/super_admin (who see all)."""

    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Organization.objects.all()
        if not user.has_role(Role.ADMIN):
            qs = qs.filter(members__user=user)
        return qs.distinct()

    def perform_create(self, serializer):
        organization = serializer.save(created_by=self.request.user)
        OrganizationMember.objects.create(
            organization=organization,
            user=self.request.user,
            role=OrganizationMember.OrgRole.OWNER,
        )


class OrganizationDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsOrgMember]
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()
    lookup_field = "id"


class OrganizationMemberListCreateView(ListCreateAPIView):
    """Nested under an organization: list/add members. Adding a member
    requires owner/admin on the organization (enforced via IsOrgMember on
    the parent lookup)."""

    serializer_class = OrganizationMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"])
        self.check_object_permissions(self.request, organization)
        return organization

    def get_queryset(self):
        organization = self.get_organization()
        return OrganizationMember.objects.filter(organization=organization).select_related("user")

    def get_permissions(self):
        return [IsAuthenticated(), IsOrgMember()]

    def perform_create(self, serializer):
        organization = self.get_organization()
        member = serializer.save(organization=organization)
        notify(
            member.user,
            Notification.NotifType.ORGANIZATION,
            f"You were added to {organization.name}",
            body=f"Role: {member.role}",
        )


class OrganizationMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, organization_id, member_id):
        organization = get_object_or_404(Organization, id=organization_id)
        self.check_object_permissions(request, organization)
        member = get_object_or_404(OrganizationMember, id=member_id, organization=organization)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsAuthenticated(), IsOrgMember()]


class OrganizationSuspendView(APIView):
    """Platform-level moderation, not a pre-use approval gate — the
    organization is usable the moment it's created; this is how a
    super_admin locks one out after the fact (abuse, security incident,
    billing, etc.)."""

    permission_classes = [IsSuperAdmin]

    def post(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        serializer = SuspendOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        organization.status = Organization.Status.SUSPENDED
        organization.suspended_reason = serializer.validated_data["reason"]
        organization.suspended_by = request.user
        organization.suspended_at = timezone.now()
        organization.save(update_fields=["status", "suspended_reason", "suspended_by", "suspended_at"])

        log_security_event(
            request,
            event_type="organization_suspended",
            severity=SecurityEvent.Severity.WARNING,
            metadata={"organization": str(organization.id), "reason": organization.suspended_reason},
        )
        notify_many(
            (m.user for m in organization.members.select_related("user")),
            Notification.NotifType.ORGANIZATION,
            f"{organization.name} was suspended",
            body=organization.suspended_reason or "Contact platform support for details.",
        )
        return Response(OrganizationSerializer(organization).data)


class OrganizationReactivateView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        organization.status = Organization.Status.ACTIVE
        organization.suspended_reason = ""
        organization.suspended_by = None
        organization.suspended_at = None
        organization.save(update_fields=["status", "suspended_reason", "suspended_by", "suspended_at"])

        log_security_event(
            request,
            event_type="organization_reactivated",
            metadata={"organization": str(organization.id)},
        )
        notify_many(
            (m.user for m in organization.members.select_related("user")),
            Notification.NotifType.ORGANIZATION,
            f"{organization.name} was reactivated",
        )
        return Response(OrganizationSerializer(organization).data)
