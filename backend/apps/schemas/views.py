from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.connections.models import DatabaseConnection

from .models import DatabaseColumn, DatabaseSchema, DatabaseTable
from .permissions import IsSchemaOrgMember
from .serializers import (
    ColumnAllowedSerializer,
    DatabaseSchemaSerializer,
    DatabaseTableSerializer,
    DiscoverySummarySerializer,
    TableSelectionSerializer,
)
from .services import discover_schema, recommend_column_allowed, recommend_table_selection


class SchemaDiscoveryView(APIView):
    """POST triggers a fresh read-only introspection of the customer
    database (information_schema only) and syncs AAP's schema metadata."""

    def get_permissions(self):
        return [IsAuthenticated(), IsSchemaOrgMember()]

    def _get_connection(self, connection_id):
        connection = get_object_or_404(
            DatabaseConnection.objects.select_related("application__organization"), id=connection_id
        )
        self.check_object_permissions(self.request, connection)
        return connection

    def post(self, request, connection_id):
        connection = self._get_connection(connection_id)
        summary = discover_schema(connection)
        return Response(DiscoverySummarySerializer(summary).data)


class SchemaDetailView(APIView):
    """GET returns the last-discovered schema (tables, columns,
    relationships) for a connection — no live customer-database query."""

    def get_permissions(self):
        return [IsAuthenticated(), IsSchemaOrgMember()]

    def get(self, request, connection_id):
        connection = get_object_or_404(
            DatabaseConnection.objects.select_related("application__organization"), id=connection_id
        )
        self.check_object_permissions(request, connection)
        schema = get_object_or_404(DatabaseSchema, connection=connection, name="public")
        return Response(DatabaseSchemaSerializer(schema).data)


class SchemaRecommendView(APIView):
    """Re-applies the table/column recommendation heuristic (spec section
    15) to every table and column in this connection's schema — resets
    manual overrides. Owner/admin only, like discovery itself."""

    def get_permissions(self):
        return [IsAuthenticated(), IsSchemaOrgMember()]

    def post(self, request, connection_id):
        connection = get_object_or_404(
            DatabaseConnection.objects.select_related("application__organization"), id=connection_id
        )
        self.check_object_permissions(request, connection)
        schema = get_object_or_404(DatabaseSchema, connection=connection, name="public")

        tables = DatabaseTable.objects.filter(schema=schema)
        for table in tables:
            table.is_selected = recommend_table_selection(table.name)
        DatabaseTable.objects.bulk_update(tables, ["is_selected"])

        columns = DatabaseColumn.objects.filter(table__schema=schema)
        for column in columns:
            column.is_allowed = recommend_column_allowed(column.name)
        DatabaseColumn.objects.bulk_update(columns, ["is_allowed"])

        return Response(DatabaseSchemaSerializer(schema).data)


class TableSelectionUpdateView(APIView):
    """PATCH toggles whether a discovered table is part of the project's
    allowed data-access whitelist."""

    def get_permissions(self):
        return [IsAuthenticated(), IsSchemaOrgMember()]

    def patch(self, request, id):
        table = get_object_or_404(
            DatabaseTable.objects.select_related("schema__connection__application__organization"), id=id
        )
        self.check_object_permissions(request, table.schema.connection)
        serializer = TableSelectionSerializer(table, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(DatabaseTableSerializer(table).data)


class ColumnAllowedUpdateView(APIView):
    """PATCH toggles whether a discovered column is exposed within its
    table's allowed data access."""

    def get_permissions(self):
        return [IsAuthenticated(), IsSchemaOrgMember()]

    def patch(self, request, id):
        column = get_object_or_404(
            DatabaseColumn.objects.select_related("table__schema__connection__application__organization"), id=id
        )
        self.check_object_permissions(request, column.table.schema.connection)
        serializer = ColumnAllowedSerializer(column, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
