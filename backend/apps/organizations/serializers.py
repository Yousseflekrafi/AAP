from rest_framework import serializers

from .models import Organization, OrganizationMember, OrganizationMessage


class OrganizationMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_status = serializers.CharField(source="user.status", read_only=True)
    is_online = serializers.BooleanField(source="user.is_online", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = [
            "id", "organization", "user", "user_email", "user_name", "user_status", "is_online",
            "role", "joined_at",
        ]
        read_only_fields = [
            "id", "organization", "user", "user_email", "user_name", "user_status", "is_online", "joined_at",
        ]


class InviteMemberSerializer(serializers.Serializer):
    """Invite a teammate by email. If no AAP account exists for that email
    yet, one is created on the spot (same registration data shape the
    owner used: first/last name, personal account) and an invite email is
    sent so they can set their password."""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
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


class OrganizationMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)
    recipient_email = serializers.EmailField(source="recipient.email", read_only=True, default=None)
    recipient_name = serializers.CharField(source="recipient.full_name", read_only=True, default=None)

    class Meta:
        model = OrganizationMessage
        fields = [
            "id", "organization", "sender", "sender_email", "sender_name",
            "recipient", "recipient_email", "recipient_name", "message", "created_at",
        ]
        read_only_fields = [
            "id", "organization", "sender", "sender_email", "sender_name",
            "recipient_email", "recipient_name", "created_at",
        ]
