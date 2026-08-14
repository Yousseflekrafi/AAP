from django.urls import path

from . import views

app_name = "applications"

urlpatterns = [
    path(
        "organizations/<uuid:organization_id>/applications/",
        views.ApplicationListCreateView.as_view(),
        name="application-list",
    ),
    path("applications/<uuid:id>/", views.ApplicationDetailView.as_view(), name="application-detail"),
]
