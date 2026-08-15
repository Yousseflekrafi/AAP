import uuid

from django.conf import settings
from django.db import models

from apps.applications.models import Application

from .crypto import decrypt, encrypt


class DatabaseConnection(models.Model):
    """A customer PostgreSQL connection AAP uses read-only. Credentials are
    encrypted at rest (Fernet) and never returned by the API — see
    serializers.DatabaseConnectionSerializer."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="database_connections")
    name = models.CharField(max_length=150)
    host = models.CharField(max_length=255)
    port = models.PositiveIntegerField(default=5432)
    database = models.CharField(max_length=150)
    username = models.CharField(max_length=150)
    password_encrypted = models.TextField()
    is_read_only = models.BooleanField(default=True)
    last_tested_at = models.DateTimeField(null=True, blank=True)
    last_test_ok = models.BooleanField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="database_connections_created",
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.application.name})"

    def set_password(self, raw_password):
        self.password_encrypted = encrypt(raw_password)

    def get_password(self):
        return decrypt(self.password_encrypted)


class ApiConnection(models.Model):
    """Placeholder for the API/AAP-Connector method of reaching customer
    data (spec section 5.2/5.3) — full tool-calling support lands with the
    AI Query Engine phase."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="api_connections")
    name = models.CharField(max_length=150)
    base_url = models.URLField()
    auth_type = models.CharField(
        max_length=20,
        choices=[("none", "None"), ("api_key", "API key"), ("bearer", "Bearer token")],
        default="none",
    )
    credentials_encrypted = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="api_connections_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.application.name})"

    def set_credentials(self, raw_value):
        self.credentials_encrypted = encrypt(raw_value) if raw_value else ""

    def get_credentials(self):
        return decrypt(self.credentials_encrypted) if self.credentials_encrypted else ""
