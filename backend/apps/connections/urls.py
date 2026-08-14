from django.urls import path

from . import views

app_name = "connections"

urlpatterns = [
    path(
        "applications/<uuid:application_id>/connections/",
        views.DatabaseConnectionListCreateView.as_view(),
        name="connection-list",
    ),
    path("connections/<uuid:id>/", views.DatabaseConnectionDetailView.as_view(), name="connection-detail"),
    path("connections/<uuid:id>/test/", views.DatabaseConnectionTestView.as_view(), name="connection-test"),
]
