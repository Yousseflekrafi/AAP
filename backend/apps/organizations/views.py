from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.mailer import send_invite_email
from apps.accounts.models import Role, User
from apps.accounts.permissions import IsSuperAdmin
from apps.applications.models import Application
from apps.audit.models import SecurityEvent
from apps.audit.services import log_security_event
from apps.connections.models import DatabaseConnection
from apps.notifications.models import Notification
from apps.notifications.services import notify, notify_many

from .models import Organization, OrganizationMember, OrganizationMessage
from .permissions import IsAnyOrgMember, IsOrgMember
from .serializers import (
    InviteMemberSerializer,
    OrganizationMemberSerializer,
    OrganizationMessageSerializer,
    OrganizationSerializer,
    SuspendOrganizationSerializer,
)


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


class OrganizationStatsView(APIView):
    """Any member (not just platform admins) can see their own
    organization's dashboard numbers — projects, team, connection health —
    scoped strictly to this one organization via IsOrgMember."""

    permission_classes = [IsAuthenticated, IsOrgMember]

    def get(self, request, id):
        organization = get_object_or_404(Organization, id=id)
        self.check_object_permissions(request, organization)

        projects = Application.objects.filter(organization=organization)
        members = organization.members.select_related("user")
        connections = DatabaseConnection.objects.filter(application__organization=organization)

        by_environment = {choice.value: 0 for choice in Application.Environment}
        for project in projects.only("environment"):
            by_environment[project.environment] = by_environment.get(project.environment, 0) + 1

        by_role = {"owner": 0, "admin": 0, "member": 0}
        online_count = 0
        for member in members:
            by_role[member.role] = by_role.get(member.role, 0) + 1
            if member.user.is_online:
                online_count += 1

        return Response(
            {
                "projects": {"total": projects.count(), "by_environment": by_environment},
                "members": {"total": members.count(), "by_role": by_role, "online": online_count},
                "connections": {
                    "total": connections.count(),
                    "ok": connections.filter(last_test_ok=True).count(),
                    "failing": connections.filter(last_test_ok=False).count(),
                    "untested": connections.filter(last_test_ok__isnull=True).count(),
                },
            }
        )


class OrganizationMemberListCreateView(ListCreateAPIView):
    """Nested under an organization: list members, invite by email. Adding
    a member requires owner/admin on the organization (enforced via
    IsOrgMember on the parent lookup). If the invitee has no AAP account
    yet, one is created for them (same shape as self-registration) and an
    invite email lets them set a password."""

    permission_classes = [IsAuthenticated]

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"])
        self.check_object_permissions(self.request, organization)
        return organization

    def get_queryset(self):
        organization = self.get_organization()
        return OrganizationMember.objects.filter(organization=organization).select_related("user")

    def get_serializer_class(self):
        return InviteMemberSerializer if self.request.method == "POST" else OrganizationMemberSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsOrgMember()]

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        role = serializer.validated_data["role"]
        first_name = serializer.validated_data["first_name"]
        last_name = serializer.validated_data["last_name"]

        invitee = User.objects.filter(email=email).first()
        created_account = False
        generated_password = None
        if invitee is None:
            generated_password = get_random_string(
                12, allowed_chars="abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
            )
            invitee = User.objects.create_user(
                email=email,
                password=generated_password,
                first_name=first_name,
                last_name=last_name,
                account_type=User.AccountType.PERSONAL,
                is_email_verified=True,
            )
            created_account = True

        if OrganizationMember.objects.filter(organization=organization, user=invitee).exists():
            return Response({"detail": "Already a member of this organization."}, status=status.HTTP_400_BAD_REQUEST)

        member = OrganizationMember.objects.create(organization=organization, user=invitee, role=role)

        if created_account:
            project_names = list(
                Application.objects.filter(organization=organization).values_list("name", flat=True)
            )
            send_invite_email(invitee, generated_password, organization.name, project_names)
        else:
            notify(
                invitee,
                Notification.NotifType.ORGANIZATION,
                f"You were added to {organization.name}",
                body=f"Role: {member.role}",
            )
        return Response(OrganizationMemberSerializer(member).data, status=status.HTTP_201_CREATED)


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


class OrganizationMessageListCreateView(ListCreateAPIView):
    """Team chat scoped to one organization — every member (owner, admin,
    or plain member) can read and post, unlike the member-management
    endpoints which restrict writes to owner/admin."""

    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationMessageSerializer

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"])
        self.check_object_permissions(self.request, organization)
        return organization

    def get_permissions(self):
        return [IsAuthenticated(), IsAnyOrgMember()]

    def get_queryset(self):
        organization = self.get_organization()
        qs = OrganizationMessage.objects.filter(organization=organization).select_related("sender", "recipient")
        with_user_id = self.request.query_params.get("with")
        user = self.request.user
        if with_user_id:
            qs = qs.filter(
                Q(sender=user, recipient_id=with_user_id) | Q(sender_id=with_user_id, recipient=user)
            )
        else:
            qs = qs.filter(recipient__isnull=True)
        return qs

    def perform_create(self, serializer):
        organization = self.get_organization()
        sender = self.request.user
        recipient = serializer.validated_data.get("recipient")
        if recipient and not organization.members.filter(user=recipient).exists():
            raise ValidationError({"recipient": "Not a member of this organization."})
        message = serializer.save(organization=organization, sender=sender)
        if recipient:
            notify(
                recipient,
                Notification.NotifType.ORGANIZATION,
                f"New message from {sender.full_name}",
                body=message.message,
            )


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
