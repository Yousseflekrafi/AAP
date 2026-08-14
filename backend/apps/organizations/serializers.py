from rest_framework import serializers

from .models import Organization, OrganizationMember


class OrganizationMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ["id", "organization", "user", "user_email", "user_name", "role", "joined_at"]
        read_only_fields = ["id", "organization", "user", "user_email", "user_name", "joined_at"]


class InviteMemberSerializer(serializers.Serializer):
    """MVP invite: adds an existing, verified AAP user by email. A real
    pending-invitation flow (email sent to non-users) is a later phase."""

    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=OrganizationMember.OrgRole.choices, default=OrganizationMember.OrgRole.MEMBER)


class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id", "name", "slug", "org_type", "website", "country", "industry",
            "is_profile_complete", "status", "suspended_reason", "suspended_at",
            "created_by", "member_count", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "org_type", "is_profile_complete", "status", "suspended_reason", "suspended_at",
            "created_by", "member_count", "created_at", "updated_at",
        ]

    def validate_slug(self, value):
        return value.lower()


class SuspendOrganizationSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")
