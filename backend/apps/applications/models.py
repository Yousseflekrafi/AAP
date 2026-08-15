import uuid

from django.conf import settings
from django.db import models

from apps.organizations.models import Organization


class Application(models.Model):
    """A "Project" in the product blueprint — the actual administration
    system being built: its own application, database connection, schema,
    allowed tables/columns, admin config, AI config, preview, install."""

    class Environment(models.TextChoices):
        DEVELOPMENT = "development", "Development"
        STAGING = "staging", "Staging"
        PRODUCTION = "production", "Production"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="applications")
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160)
    description = models.TextField(blank=True)
    application_url = models.URLField(blank=True)
    environment = models.CharField(max_length=20, choices=Environment.choices, default=Environment.DEVELOPMENT)
    context_description = models.TextField(
        blank=True,
        help_text="Plain-language description of what the administration should manage — "
        "becomes context for schema analysis and AI setup.",
    )
    admin_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Admin Builder config: per selected table, which columns are filters, "
        "which are form fields, and any chart definitions. Keyed by table id.",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="applications_created",
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["organization", "slug"], name="unique_application_slug_per_org"),
        ]

    def __str__(self):
        return f"{self.name} ({self.organization.name})"
