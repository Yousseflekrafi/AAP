from django.urls import path

from . import views

app_name = "organizations"

urlpatterns = [
    path("", views.OrganizationListCreateView.as_view(), name="organization-list"),
    path("<uuid:id>/", views.OrganizationDetailView.as_view(), name="organization-detail"),
    path(
        "<uuid:organization_id>/members/",
        views.OrganizationMemberListCreateView.as_view(),
        name="organization-member-list",
    ),
    path(
        "<uuid:organization_id>/members/<uuid:member_id>/",
        views.OrganizationMemberDetailView.as_view(),
        name="organization-member-detail",
    ),
]
