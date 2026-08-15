from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role
from apps.applications.models import Application

from .models import DatabaseConnection
from .permissions import IsConnectionOrgMember
from .serializers import DatabaseConnectionSerializer, TestConnectionResultSerializer
from .services import test_connection


class DatabaseConnectionListCreateView(ListCreateAPIView):
    """Nested under an application: list/create its database connections."""

    serializer_class = DatabaseConnectionSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsConnectionOrgMember()]

    def get_application(self):
        application = get_object_or_404(Application, id=self.kwargs["application_id"], is_deleted=False)
        self.check_object_permissions(self.request, application)
        return application

    def get_queryset(self):
        return DatabaseConnection.objects.filter(application=self.get_application(), is_deleted=False)

    def perform_create(self, serializer):
        serializer.save(application=self.get_application(), created_by=self.request.user)


class DatabaseConnectionDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = DatabaseConnectionSerializer
    lookup_field = "id"

    def get_permissions(self):
        return [IsAuthenticated(), IsConnectionOrgMember()]

    def get_queryset(self):
        user = self.request.user
        qs = DatabaseConnection.objects.select_related("application__organization").filter(is_deleted=False)
        if not user.has_role(Role.ADMIN):
            qs = qs.filter(application__organization__members__user=user)
        return qs.distinct()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=["is_deleted", "deleted_at"])


class DatabaseConnectionTestView(APIView):
    """Attempts a live, read-only connect + SELECT 1. Never returns or
    stores customer data — only success/failure."""

    def get_permissions(self):
        return [IsAuthenticated(), IsConnectionOrgMember()]

    def post(self, request, id):
        connection = get_object_or_404(
            DatabaseConnection.objects.select_related("application__organization"), id=id, is_deleted=False
        )
        self.check_object_permissions(request, connection)
        ok, detail = test_connection(connection)
        return Response(TestConnectionResultSerializer({"ok": ok, "detail": detail}).data)
