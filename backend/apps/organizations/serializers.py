from rest_framework import serializers

from .models import Organization, OrganizationMember


class OrganizationMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ["id", "organization", "user", "user_email", "role", "joined_at"]
        read_only_fields = ["id", "organization", "user_email", "joined_at"]


class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id", "name", "slug", "status", "suspended_reason", "suspended_at",
            "created_by", "member_count", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "status", "suspended_reason", "suspended_at",
            "created_by", "member_count", "created_at", "updated_at",
        ]

    def validate_slug(self, value):
        return value.lower()


class SuspendOrganizationSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")
