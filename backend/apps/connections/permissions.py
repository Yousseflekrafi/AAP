from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role
from apps.organizations.access import org_is_locked_for


class IsConnectionOrgMember(BasePermission):
    """Object-level: any member of the owning application's organization
    may read; only an owner/admin member (or platform admin/super_admin)
    may write. `obj` may be an Application (nested list/create route) or a
    DatabaseConnection (detail route). Locked out entirely if the
    organization is suspended."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        application = obj if hasattr(obj, "organization") else obj.application
        if org_is_locked_for(application.organization, user):
            return False
        if user.has_role(Role.ADMIN):
            return True
        membership = application.organization.members.filter(user=user).first()
        if membership is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return membership.role in ("owner", "admin")
