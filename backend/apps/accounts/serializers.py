from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Role, User
from .rbac import user_permissions


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "account_type"]

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(slug_field="name", many=True, read_only=True)
    role = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name", "account_type",
            "is_active", "is_deleted", "status", "is_online", "last_seen_at",
            "is_email_verified", "is_staff", "is_superuser", "auth_provider",
            "roles", "role", "permissions", "created_at",
        ]
        read_only_fields = fields

    def get_role(self, obj):
        """The single highest-precedence role name, defaulting to
        'customer' — for UI display; authorization itself is always
        checked against the full `permissions` list, not this field."""
        if obj.has_role(Role.SUPER_ADMIN):
            return Role.SUPER_ADMIN
        if obj.has_role(Role.ADMIN):
            return Role.ADMIN
        return Role.CUSTOMER

    def get_permissions(self, obj):
        return sorted(user_permissions(obj))


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """What a user may edit about their own account details — not the full
    UserSerializer surface (role, is_staff, is_superuser, etc. stay
    read-only everywhere)."""

    class Meta:
        model = User
        fields = ["first_name", "last_name"]


class AdminUserStatusSerializer(serializers.Serializer):
    """US-09: admin activates/deactivates an account."""

    is_active = serializers.BooleanField()


class AdminUserRoleSerializer(serializers.Serializer):
    """US-10: admin changes a user's roles. Only super_admin may grant or
    revoke the super_admin role itself."""

    roles = serializers.ListField(child=serializers.SlugField(), allow_empty=True)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value
