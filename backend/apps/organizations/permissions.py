from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role

from .access import org_is_locked_for


class IsOrgMember(BasePermission):
    """Object-level: any member of the organization may read it; only an
    owner/admin member (or a platform admin/super_admin) may write. A
    suspended organization is locked out for its own members."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if org_is_locked_for(obj, user):
            return False
        if user.has_role(Role.ADMIN):
            return True
        membership = obj.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
