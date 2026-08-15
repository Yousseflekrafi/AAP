import uuid

from django.conf import settings
from django.db import models


class Organization(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"

    class OrgType(models.TextChoices):
        PERSONAL = "personal", "Personal"
        COMPANY = "company", "Company"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True)
    org_type = models.CharField(max_length=10, choices=OrgType.choices, default=OrgType.PERSONAL)
    website = models.URLField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    suspended_reason = models.CharField(max_length=500, blank=True)
    suspended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="organizations_suspended",
    )
    suspended_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="organizations_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE

    @property
    def is_profile_complete(self):
        """Blueprint section 3: company accounts see a non-blocking warning
        if the org profile is incomplete. Personal workspaces are always
        considered complete — there's nothing more to fill in."""
        if self.org_type != self.OrgType.COMPANY:
            return True
        return bool(self.website and self.country and self.industry)


class OrganizationMember(models.Model):
    class OrgRole(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
    )
    role = models.CharField(max_length=20, choices=OrgRole.choices, default=OrgRole.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["organization", "user"], name="unique_org_member"),
        ]
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user_id} @ {self.organization_id} ({self.role})"


class OrganizationMessage(models.Model):
    """A flat team-chat channel scoped to one organization — any member
    (owner/admin/member alike) can post and read. Distinct from
    AdminConversation, which is 1:1 support between a user and AAP
    platform staff."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_messages_sent",
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender_id} @ {self.organization_id}"
