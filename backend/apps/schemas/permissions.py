from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role


class IsSchemaOrgMember(BasePermission):
    """Object-level against a DatabaseConnection: any org member may read
    the discovered schema; only owner/admin (or platform admin/super_admin)
    may trigger discovery."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.ADMIN):
            return True
        membership = obj.application.organization.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
