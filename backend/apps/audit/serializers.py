from rest_framework import serializers

from .models import AuditLog, SecurityEvent


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = ["id", "user", "user_email", "action", "method", "path", "status_code", "ip_address", "created_at"]
        read_only_fields = fields


class SecurityEventSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True, default=None)

    class Meta:
        model = SecurityEvent
        fields = ["id", "user", "user_email", "event_type", "severity", "ip_address", "description", "created_at"]
        read_only_fields = fields
