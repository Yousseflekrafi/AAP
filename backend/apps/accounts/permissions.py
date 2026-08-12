from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Grants access to superusers or users holding the 'admin' role."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.has_role("admin")))


class IsSelfOrAdmin(BasePermission):
    """Object-level: user may act on their own record; admins may act on any."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.has_role("admin"):
            return True
        return obj == user


class ReadOnlyOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.has_role("admin")))
