import uuid

from django.utils.text import slugify

from .models import Organization, OrganizationMember


def ensure_default_workspace(user):
    """Every account gets an internal workspace so the backend stays
    consistent whether the account is personal or company (blueprint
    section 5) — created once, idempotently, right after the account
    becomes usable (email verified / first Google login)."""

    if OrganizationMember.objects.filter(user=user).exists():
        return None

    if user.account_type == user.AccountType.COMPANY:
        name = f"{user.full_name}'s Company"
        org_type = Organization.OrgType.COMPANY
    else:
        name = f"{user.full_name}'s Workspace"
        org_type = Organization.OrgType.PERSONAL

    base_slug = slugify(name) or "workspace"
    slug = base_slug
    while Organization.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

    organization = Organization.objects.create(
        name=name,
        slug=slug,
        org_type=org_type,
        created_by=user,
    )
    OrganizationMember.objects.create(
        organization=organization,
        user=user,
        role=OrganizationMember.OrgRole.OWNER,
    )
    return organization
