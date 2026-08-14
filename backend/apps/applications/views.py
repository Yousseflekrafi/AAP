from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Role
from apps.organizations.models import Organization

from .models import Application
from .permissions import IsApplicationOrgMember
from .serializers import ApplicationSerializer


class ApplicationListCreateView(ListCreateAPIView):
    """Nested under an organization: list/create its applications."""

    serializer_class = ApplicationSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsApplicationOrgMember()]

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"])
        self.check_object_permissions(self.request, organization)
        return organization

    def get_queryset(self):
        return Application.objects.filter(organization=self.get_organization())

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization(), created_by=self.request.user)


class ApplicationDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    lookup_field = "id"

    def get_permissions(self):
        return [IsAuthenticated(), IsApplicationOrgMember()]

    def get_queryset(self):
        user = self.request.user
        qs = Application.objects.select_related("organization")
        if not user.has_role(Role.ADMIN):
            qs = qs.filter(organization__members__user=user)
        return qs.distinct()
