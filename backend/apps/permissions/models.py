import uuid

from django.conf import settings
from django.db import models

from apps.accounts.models import Role
from apps.applications.models import Application
from apps.schemas.models import DatabaseColumn, DatabaseTable

# Structural models for the Permission Engine (spec section 5/7). Full
# enforcement (checked during AI query execution) is a later phase — for
# now these just let admins define grants; nothing reads them yet.


class TablePermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="table_permissions")
    table = models.ForeignKey(DatabaseTable, on_delete=models.CASCADE, related_name="permissions")
    role = models.ForeignKey(Role, null=True, blank=True, on_delete=models.CASCADE, related_name="table_permissions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="table_permissions"
    )
    can_read = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["table__name"]

    def __str__(self):
        grantee = self.role or self.user
        return f"{grantee} -> {self.table} ({'read' if self.can_read else 'no access'})"


class ColumnPermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    column = models.ForeignKey(DatabaseColumn, on_delete=models.CASCADE, related_name="permissions")
    role = models.ForeignKey(Role, null=True, blank=True, on_delete=models.CASCADE, related_name="column_permissions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="column_permissions"
    )
    can_read = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["column__name"]

    def __str__(self):
        grantee = self.role or self.user
        return f"{grantee} -> {self.column} ({'read' if self.can_read else 'no access'})"


class DataPermission(models.Model):
    """Row-level scoping for a table, e.g. restrict a role to rows matching
    a filter. `filter_expression` is interpreted by the permission engine
    when it lands (Phase 4) — stored, not executed, for now."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="data_permissions")
    table = models.ForeignKey(DatabaseTable, on_delete=models.CASCADE, related_name="data_permissions")
    role = models.ForeignKey(Role, null=True, blank=True, on_delete=models.CASCADE, related_name="data_permissions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="data_permissions"
    )
    filter_expression = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["table__name"]

    def __str__(self):
        grantee = self.role or self.user
        return f"{grantee} -> {self.table} [{self.filter_expression or 'all rows'}]"
