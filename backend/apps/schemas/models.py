import uuid

from django.db import models

from apps.connections.models import DatabaseConnection


class DatabaseSchema(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    connection = models.ForeignKey(DatabaseConnection, on_delete=models.CASCADE, related_name="schemas")
    name = models.CharField(max_length=150, default="public")
    discovered_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["connection", "name"], name="unique_schema_per_connection"),
        ]
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.connection.name})"


class DatabaseTable(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schema = models.ForeignKey(DatabaseSchema, on_delete=models.CASCADE, related_name="tables")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    is_selected = models.BooleanField(
        default=True,
        help_text="Whether this table is part of the project's allowed data-access "
        "whitelist (spec section 16) — set by the recommendation heuristic on "
        "discovery, adjustable by the customer.",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["schema", "name"], name="unique_table_per_schema"),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name


class DatabaseColumn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    table = models.ForeignKey(DatabaseTable, on_delete=models.CASCADE, related_name="columns")
    name = models.CharField(max_length=150)
    data_type = models.CharField(max_length=100)
    is_nullable = models.BooleanField(default=True)
    is_primary_key = models.BooleanField(default=False)
    ordinal_position = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    is_allowed = models.BooleanField(
        default=True,
        help_text="Column-level permission (spec section 17) — whether this column "
        "is exposed at all within its table's allowed data access.",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["table", "name"], name="unique_column_per_table"),
        ]
        ordering = ["ordinal_position"]

    def __str__(self):
        return f"{self.table.name}.{self.name}"


class DatabaseRelationship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_table = models.ForeignKey(DatabaseTable, on_delete=models.CASCADE, related_name="relationships_from")
    from_column = models.ForeignKey(DatabaseColumn, on_delete=models.CASCADE, related_name="relationships_from")
    to_table = models.ForeignKey(DatabaseTable, on_delete=models.CASCADE, related_name="relationships_to")
    to_column = models.ForeignKey(DatabaseColumn, on_delete=models.CASCADE, related_name="relationships_to")
    constraint_name = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["constraint_name"]

    def __str__(self):
        return f"{self.from_table.name}.{self.from_column.name} -> {self.to_table.name}.{self.to_column.name}"
