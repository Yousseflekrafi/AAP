from django.urls import path

from . import views

app_name = "organizations"

urlpatterns = [
    path("", views.OrganizationListCreateView.as_view(), name="organization-list"),
    path("<uuid:id>/", views.OrganizationDetailView.as_view(), name="organization-detail"),
    path("<uuid:id>/stats/", views.OrganizationStatsView.as_view(), name="organization-stats"),
    path("<uuid:id>/suspend/", views.OrganizationSuspendView.as_view(), name="organization-suspend"),
    path("<uuid:id>/reactivate/", views.OrganizationReactivateView.as_view(), name="organization-reactivate"),
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
    path(
        "<uuid:organization_id>/messages/",
        views.OrganizationMessageListCreateView.as_view(),
        name="organization-message-list",
    ),
]
