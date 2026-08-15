from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role
from apps.accounts.permissions import IsAdmin
from apps.notifications.models import Notification
from apps.notifications.services import notify, notify_many
from apps.organizations.models import OrganizationMember

from .models import AdminConversation, AdminMessage
from .permissions import IsConversationParticipant
from .serializers import (
    AdminConversationCloseSerializer,
    AdminConversationManageSerializer,
    AdminConversationSerializer,
    AdminMessageSerializer,
)
from .services import admin_users, super_admin_users


class RecipientsView(APIView):
    """Who this user may start a direct 1:1 with, so the compose UI can
    show a WhatsApp-style contact picker instead of a blind ticket queue:
    a super_admin picks a plain admin, a plain admin picks an org owner.
    A regular customer gets an empty list — they still reach AAP support,
    just without picking a specific person (any super_admin can pick it
    up)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.has_role(Role.SUPER_ADMIN):
            recipients = [
                {"id": str(u.id), "email": u.email, "name": u.full_name, "subtitle": "Admin"}
                for u in admin_users()
            ]
        elif user.has_role(Role.ADMIN):
            owners = (
                OrganizationMember.objects.filter(role=OrganizationMember.OrgRole.OWNER)
                .select_related("user", "organization")
                .exclude(user__is_active=False)
            )
            recipients = [
                {
                    "id": str(m.user.id),
                    "email": m.user.email,
                    "name": m.user.full_name,
                    "subtitle": m.organization.name,
                }
                for m in owners
            ]
        else:
            recipients = []
        return Response(recipients)


class ConversationListCreateView(ListCreateAPIView):
    """AAP platform support: any verified user (a customer/org owner, an
    admin, or a super_admin) may open a conversation with the platform
    team. super_admin sees every conversation (optionally filtered);
    everyone else sees only the ones they started — this is 1:1 support
    with AAP, not an org-wide inbox."""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminConversationSerializer
    filterset_fields = ["status", "priority", "organization"]

    def get_queryset(self):
        user = self.request.user
        qs = AdminConversation.objects.select_related("created_by", "target_user", "assigned_to")
        if not user.has_role(Role.SUPER_ADMIN):
            qs = qs.filter(Q(created_by=user) | Q(target_user=user))
        return qs

    def perform_create(self, serializer):
        sender = self.request.user
        target_user = serializer.validated_data.get("target_user")
        subject = serializer.validated_data.get("subject") or (
            f"Message to {target_user.full_name}" if target_user else f"Message from {sender.full_name}"
        )
        conversation = serializer.save(created_by=sender, subject=subject)

        if target_user:
            notify(
                target_user,
                Notification.NotifType.ADMINISTRATION,
                f"New message from {sender.email}",
                body=conversation.subject,
                action_url=f"/admin/messages/{conversation.id}",
            )
        else:
            notify_many(
                super_admin_users(),
                Notification.NotifType.ADMINISTRATION,
                f"New admin conversation: {conversation.subject}",
                body=f"From {sender.email}",
                action_url=f"/admin/messages/{conversation.id}",
            )


class ConversationDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]
    serializer_class = AdminConversationSerializer
    queryset = AdminConversation.objects.select_related("created_by", "assigned_to")
    lookup_field = "id"


class ConversationCloseView(APIView):
    """Any participant (the user who opened it, or super_admin on any) may
    close/reopen — the lightweight status change everyone gets."""

    permission_classes = [IsAuthenticated, IsConversationParticipant]

    def post(self, request, id):
        conversation = get_object_or_404(AdminConversation, id=id)
        self.check_object_permissions(request, conversation)
        serializer = AdminConversationCloseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation.status = serializer.validated_data["status"]
        conversation.save(update_fields=["status", "updated_at"])
        return Response(AdminConversationSerializer(conversation).data)


class ConversationManageView(APIView):
    """super_admin only: priority and assignment."""

    permission_classes = [IsAdmin]

    def patch(self, request, id):
        if not request.user.has_role(Role.SUPER_ADMIN):
            return Response(
                {"detail": "Only a super_admin can manage priority/assignment."},
                status=status.HTTP_403_FORBIDDEN,
            )
        conversation = get_object_or_404(AdminConversation, id=id)
        serializer = AdminConversationManageSerializer(conversation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminConversationSerializer(conversation).data)


class MessageListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsConversationParticipant]
    serializer_class = AdminMessageSerializer

    def get_conversation(self):
        conversation = get_object_or_404(AdminConversation, id=self.kwargs["conversation_id"])
        self.check_object_permissions(self.request, conversation)
        return conversation

    def get_queryset(self):
        return AdminMessage.objects.filter(conversation=self.get_conversation()).select_related("sender")

    def perform_create(self, serializer):
        conversation = self.get_conversation()
        sender = self.request.user
        serializer.save(conversation=conversation, sender=sender)

        is_super_admin_reply = sender.has_role(Role.SUPER_ADMIN)
        conversation.status = (
            AdminConversation.Status.WAITING_FOR_ADMIN
            if is_super_admin_reply
            else AdminConversation.Status.WAITING_FOR_SUPER_ADMIN
        )
        conversation.save(update_fields=["status", "updated_at"])

        # Directed 1:1 (target_user set): reply always goes to "the other
        # side" of that pair. Otherwise it's the original open-ticket
        # behavior: a super_admin reply goes to whoever opened it, and a
        # non-super_admin reply broadcasts to the super_admin queue.
        if conversation.target_user_id:
            recipient = conversation.created_by if sender.id == conversation.target_user_id else conversation.target_user
            notify(
                recipient,
                Notification.NotifType.ADMINISTRATION,
                f"Reply on: {conversation.subject}",
                body=f"From {sender.email}",
                action_url=f"/admin/messages/{conversation.id}",
            )
        elif is_super_admin_reply:
            notify(
                conversation.created_by,
                Notification.NotifType.ADMINISTRATION,
                f"Reply on: {conversation.subject}",
                body=f"From {sender.email}",
                action_url=f"/admin/messages/{conversation.id}",
            )
        else:
            notify_many(
                super_admin_users(),
                Notification.NotifType.ADMINISTRATION,
                f"Reply on: {conversation.subject}",
                body=f"From {sender.email}",
                action_url=f"/admin/messages/{conversation.id}",
            )
