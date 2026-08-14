from django.urls import path

from . import views

app_name = "schemas"

urlpatterns = [
    path(
        "connections/<uuid:connection_id>/discover-schema/",
        views.SchemaDiscoveryView.as_view(),
        name="schema-discover",
    ),
    path("connections/<uuid:connection_id>/schema/", views.SchemaDetailView.as_view(), name="schema-detail"),
]
