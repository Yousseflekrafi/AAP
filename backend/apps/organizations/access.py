from apps.accounts.models import Role

from .models import Organization


def org_is_locked_for(organization, user):
    """A suspended organization is locked out for everyone — including
    plain platform 'admin' users who happen to be members — except
    super_admin, since only super_admin can impose/lift the suspension in
    the first place and needs to be able to see it to investigate."""

    return organization.status != Organization.Status.ACTIVE and not user.has_role(Role.SUPER_ADMIN)
