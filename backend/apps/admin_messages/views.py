from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role
from apps.accounts.permissions import IsAdmin
from apps.notifications.models import Notification
from apps.notifications.services import notify, notify_many

from .models import AdminConversation, AdminMessage
from .permissions import IsConversationParticipant
from .serializers import (
    AdminConversationCloseSerializer,
    AdminConversationManageSerializer,
    AdminConversationSerializer,
    AdminMessageSerializer,
)
from .services import super_admin_users


class ConversationListCreateView(ListCreateAPIView):
    """super_admin sees every conversation (optionally filtered); an admin
    sees only the ones they started — this is admin-to-platform support,
    not an org-wide inbox."""

    permission_classes = [IsAdmin]
    serializer_class = AdminConversationSerializer
    filterset_fields = ["status", "priority", "organization"]

    def get_queryset(self):
        user = self.request.user
        qs = AdminConversation.objects.select_related("created_by", "assigned_to")
        if not user.has_role(Role.SUPER_ADMIN):
            qs = qs.filter(created_by=user)
        return qs

    def perform_create(self, serializer):
        conversation = serializer.save(created_by=self.request.user)
        notify_many(
            super_admin_users(),
            Notification.NotifType.ADMINISTRATION,
            f"New admin conversation: {conversation.subject}",
            body=f"From {self.request.user.email}",
            action_url=f"/admin/messages/{conversation.id}",
        )


class ConversationDetailView(RetrieveAPIView):
    permission_classes = [IsAdmin, IsConversationParticipant]
    serializer_class = AdminConversationSerializer
    queryset = AdminConversation.objects.select_related("created_by", "assigned_to")
    lookup_field = "id"


class ConversationCloseView(APIView):
    """Any participant (admin on their own conversation, or super_admin on
    any) may close/reopen — the lightweight status change everyone gets."""

    permission_classes = [IsAdmin, IsConversationParticipant]

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
    permission_classes = [IsAdmin, IsConversationParticipant]
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

        if is_super_admin_reply:
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
