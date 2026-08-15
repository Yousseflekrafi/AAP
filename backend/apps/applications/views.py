import uuid

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

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
