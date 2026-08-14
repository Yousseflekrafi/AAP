from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role
from apps.organizations.access import org_is_locked_for


class IsApplicationOrgMember(BasePermission):
    """Object-level: any member of the application's organization may read
    it; only an owner/admin member (or a platform admin/super_admin) may
    write. `obj` may be an Organization (for the nested list/create route)
    or an Application (for the detail route). Locked out entirely if the
    organization is suspended."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization = obj if hasattr(obj, "members") else obj.organization
        if org_is_locked_for(organization, user):
            return False
        if user.has_role(Role.ADMIN):
            return True
        membership = organization.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
