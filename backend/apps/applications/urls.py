from django.urls import path

from . import views

app_name = "applications"

urlpatterns = [
    path(
        "organizations/<uuid:organization_id>/projects/",
        views.ApplicationListCreateView.as_view(),
        name="project-list",
    ),
    path("projects/<uuid:id>/", views.ApplicationDetailView.as_view(), name="project-detail"),
]
