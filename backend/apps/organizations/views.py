from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Role

from .models import Organization, OrganizationMember
from .permissions import IsOrgMember
from .serializers import OrganizationMemberSerializer, OrganizationSerializer


class OrganizationListCreateView(ListCreateAPIView):
    """Any verified user may create an organization and becomes its owner.
    Listing is scoped to organizations the requester belongs to, unless
    they're a platform admin/super_admin (who see all)."""

    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Organization.objects.all()
        if not user.has_role(Role.ADMIN):
            qs = qs.filter(members__user=user)
        return qs.distinct()

    def perform_create(self, serializer):
        organization = serializer.save(created_by=self.request.user)
        OrganizationMember.objects.create(
            organization=organization,
            user=self.request.user,
            role=OrganizationMember.OrgRole.OWNER,
        )


class OrganizationDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsOrgMember]
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()
    lookup_field = "id"


class OrganizationMemberListCreateView(ListCreateAPIView):
    """Nested under an organization: list/add members. Adding a member
    requires owner/admin on the organization (enforced via IsOrgMember on
    the parent lookup)."""

    serializer_class = OrganizationMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_organization(self):
        organization = get_object_or_404(Organization, id=self.kwargs["organization_id"])
        self.check_object_permissions(self.request, organization)
        return organization

    def get_queryset(self):
        organization = self.get_organization()
        return OrganizationMember.objects.filter(organization=organization).select_related("user")

    def get_permissions(self):
        return [IsAuthenticated(), IsOrgMember()]

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization)


class OrganizationMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, organization_id, member_id):
        organization = get_object_or_404(Organization, id=organization_id)
        self.check_object_permissions(request, organization)
        member = get_object_or_404(OrganizationMember, id=member_id, organization=organization)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        return [IsAuthenticated(), IsOrgMember()]
