"""Role -> permission resolution, cached so we don't hit the
role_permissions join table on every request. The map is loaded once and
kept in the shared (Redis) cache; it's invalidated by the RolePermission/
Permission/Role signal handlers in apps.py whenever the grants change."""

from django.core.cache import cache

CACHE_KEY = "rbac:role_permission_map"
CACHE_TTL = None  # cached until explicitly invalidated by a signal


def _load_role_permission_map():
    from .models import Role

    return {
        role.name: set(role.permissions.values_list("key", flat=True))
        for role in Role.objects.prefetch_related("permissions")
    }


def get_role_permission_map():
    mapping = cache.get(CACHE_KEY)
    if mapping is None:
        mapping = _load_role_permission_map()
        cache.set(CACHE_KEY, mapping, CACHE_TTL)
    return mapping


def invalidate_role_permission_cache(*args, **kwargs):
    cache.delete(CACHE_KEY)


def user_permissions(user) -> set[str]:
    """Flat set of every permission key granted by any role the user
    holds. Superusers (Django is_superuser, e.g. the createsuperuser
    account) get every known permission."""
    mapping = get_role_permission_map()
    if getattr(user, "is_superuser", False):
        return {key for keys in mapping.values() for key in keys}
    held_roles = set(user.roles.values_list("name", flat=True))
    granted: set[str] = set()
    for role_name in held_roles:
        granted |= mapping.get(role_name, set())
    return granted


def user_has_permission(user, perm_key: str) -> bool:
    return perm_key in user_permissions(user)
