from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role


class IsOrgMember(BasePermission):
    """Object-level: any member of the organization may read it; only an
    owner/admin member (or a platform admin/super_admin) may write."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.ADMIN):
            return True
        membership = obj.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
