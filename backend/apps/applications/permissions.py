from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role


class IsApplicationOrgMember(BasePermission):
    """Object-level: any member of the application's organization may read
    it; only an owner/admin member (or a platform admin/super_admin) may
    write. `obj` may be an Organization (for the nested list/create route)
    or an Application (for the detail route)."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.ADMIN):
            return True
        organization = obj if hasattr(obj, "members") else obj.organization
        membership = organization.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
