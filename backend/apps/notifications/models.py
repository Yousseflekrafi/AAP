import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotifType(models.TextChoices):
        ACCOUNT = "account", "Account"
        SECURITY = "security", "Security"
        ORGANIZATION = "organization", "Organization"
        APPLICATION = "application", "Application"
        CONNECTION = "connection", "Connection"
        AI = "ai", "AI"
        QUERY = "query", "Query"
        ADMINISTRATION = "administration", "Administration"
        SYSTEM = "system", "System"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=20, choices=NotifType.choices, default=NotifType.SYSTEM)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    action_url = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"{self.title} -> {self.recipient}"
