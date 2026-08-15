from django.db.models import Q

from apps.accounts.models import Role, User


def super_admin_users():
    return User.objects.filter(is_active=True).filter(
        Q(is_superuser=True) | Q(roles__name=Role.SUPER_ADMIN)
    ).distinct()


def admin_users():
    """Plain platform admins — excludes super_admin, who has their own
    recipient list (see RecipientsView)."""
    return (
        User.objects.filter(is_active=True, roles__name=Role.ADMIN)
        .exclude(Q(is_superuser=True) | Q(roles__name=Role.SUPER_ADMIN))
        .distinct()
    )
