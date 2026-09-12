from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Role
from .rbac import user_has_permission


def HasPermission(perm_key):
    """DRF permission factory gating a view behind a single RBAC
    permission key, e.g. `permission_classes = [HasPermission("audit.view")]`.
    Checks the requester's resolved (cached) flat permission set — see
    apps.accounts.rbac. Returns 403 with a clear message on failure."""

    class _HasPermission(BasePermission):
        message = f"You don't have the '{perm_key}' permission."

        def has_permission(self, request, view):
            user = request.user
            return bool(user and user.is_authenticated and user_has_permission(user, perm_key))

    _HasPermission.__name__ = f"HasPermission_{perm_key.replace('.', '_')}"
    return _HasPermission


class IsAdmin(BasePermission):
    """Grants access to superusers, admins, and super_admins (super_admin
    implies admin — see Role.IMPLIES)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Role.ADMIN))


class IsSuperAdmin(BasePermission):
    """Grants access to superusers and super_admins only — platform-level
    administration (organizations, admin accounts, global security)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Role.SUPER_ADMIN))


class IsSelfOrAdmin(BasePermission):
    """Object-level: user may act on their own record; admins may act on any."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.ADMIN):
            return True
        return obj == user


class ReadOnlyOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Role.ADMIN))
