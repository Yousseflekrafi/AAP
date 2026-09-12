import uuid

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role
from apps.organizations.models import Organization

from .models import Application
from .permissions import IsApplicationOrgMember
from .serializers import ApplicationSerializer


class ApplicationListCreateView(ListCreateAPIView):
    """Nested under an organization: list/create its applications (aka
    "Projects" in the product UI)."""

    serializer_class = ApplicationSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsApplicationOrgMember()]

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"], is_deleted=False)
        self.check_object_permissions(self.request, organization)
        return organization

    def get_queryset(self):
        return Application.objects.filter(organization=self.get_organization(), is_deleted=False)

    def perform_create(self, serializer):
        organization = self.get_organization()
        base_slug = slugify(serializer.validated_data.get("slug") or serializer.validated_data["name"]) or "project"
        slug = base_slug
        while Application.objects.filter(organization=organization, slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        serializer.save(organization=organization, slug=slug, created_by=self.request.user)


class ApplicationDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    lookup_field = "id"

    def get_permissions(self):
        return [IsAuthenticated(), IsApplicationOrgMember()]

    def get_queryset(self):
        user = self.request.user
        qs = Application.objects.select_related("organization").filter(is_deleted=False)
        if not user.has_role(Role.ADMIN):
            qs = qs.filter(organization__members__user=user)
        return qs.distinct()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=["is_deleted", "deleted_at"])


class ApplicationPublishView(APIView):
    """Confirm screen action: the customer has finished styling the panel,
    picking tables, and picking per-table CRUD methods (all in
    Application.panel_style / admin_config) and clicks "Confirm & Publish".

    NOT YET IMPLEMENTED: actual API-key generation and the embeddable
    script that lets the customer mount this panel in their own app.
    Deliberately left as a stub (returns null values + a note) — plug in
    real key generation/storage here next. Suggested shape when you do:
    a new ApplicationApiKey model (id, application FK, key_hash, prefix,
    created_at, revoked_at) plus a signed embed snippet that points at
    this application's id + a short-lived exchange token.
    """

    permission_classes = [IsAuthenticated, IsApplicationOrgMember]

    def post(self, request, id):
        application = get_object_or_404(Application, id=id, is_deleted=False)
        self.check_object_permissions(request, application)

        has_selected_table = bool(application.admin_config)
        if not has_selected_table:
            return Response(
                {"detail": "Select at least one table and configure it before publishing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.is_published = True
        application.published_at = timezone.now()
        application.save(update_fields=["is_published", "published_at"])

        return Response(
            {
                "application": ApplicationSerializer(application).data,
                # TODO: replace with real values once API key generation +
                # the embed script are implemented (see class docstring).
                "api_key": None,
                "embed_script": None,
                "note": "API key generation and the embed script are not implemented yet.",
            }
        )
