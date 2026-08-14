from rest_framework import serializers

from .models import AdminConversation, AdminMessage


class AdminMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = AdminMessage
        fields = ["id", "conversation", "sender", "sender_email", "message", "created_at", "read_at"]
        read_only_fields = ["id", "conversation", "sender", "sender_email", "created_at", "read_at"]


class AdminConversationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True, default=None)
    message_count = serializers.IntegerField(source="messages.count", read_only=True)

    class Meta:
        model = AdminConversation
        fields = [
            "id", "organization", "created_by", "created_by_email", "assigned_to", "assigned_to_email",
            "subject", "status", "priority", "message_count", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "created_by", "created_by_email", "assigned_to_email", "status",
            "message_count", "created_at", "updated_at",
        ]

    def create(self, validated_data):
        validated_data.setdefault("priority", AdminConversation.Priority.NORMAL)
        return super().create(validated_data)


class AdminConversationCloseSerializer(serializers.Serializer):
    """An admin (non-super) may only close/reopen their own conversation —
    not touch priority or assignment, that's super_admin territory."""

    status = serializers.ChoiceField(choices=[AdminConversation.Status.CLOSED, AdminConversation.Status.OPEN])


class AdminConversationManageSerializer(serializers.ModelSerializer):
    """Super_admin only: full control over status/priority/assignment."""

    class Meta:
        model = AdminConversation
        fields = ["status", "priority", "assigned_to"]
