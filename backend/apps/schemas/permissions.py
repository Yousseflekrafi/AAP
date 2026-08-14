from rest_framework.permissions import SAFE_METHODS, BasePermission

from apps.accounts.models import Role
from apps.organizations.access import org_is_locked_for


class IsSchemaOrgMember(BasePermission):
    """Object-level against a DatabaseConnection: any org member may read
    the discovered schema; only owner/admin (or platform admin/super_admin)
    may trigger discovery. Locked out entirely if the organization is
    suspended."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization = obj.application.organization
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
