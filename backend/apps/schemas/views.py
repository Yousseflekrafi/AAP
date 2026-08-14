from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.connections.models import DatabaseConnection

from .models import DatabaseSchema
from .permissions import IsSchemaOrgMember
from .serializers import DatabaseSchemaSerializer, DiscoverySummarySerializer
from .services import discover_schema


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
