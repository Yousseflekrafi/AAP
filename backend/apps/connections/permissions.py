from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role


class IsConnectionOrgMember(BasePermission):
    """Object-level: any member of the owning application's organization
    may read; only an owner/admin member (or platform admin/super_admin)
    may write. `obj` may be an Application (nested list/create route) or a
    DatabaseConnection (detail route)."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.ADMIN):
            return True
        application = obj if hasattr(obj, "organization") else obj.application
        membership = application.organization.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
