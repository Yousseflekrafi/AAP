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
    path(
        "connections/<uuid:connection_id>/recommend/",
        views.SchemaRecommendView.as_view(),
        name="schema-recommend",
    ),
    path("schema-tables/<uuid:id>/", views.TableSelectionUpdateView.as_view(), name="table-selection"),
    path("schema-columns/<uuid:id>/", views.ColumnAllowedUpdateView.as_view(), name="column-allowed"),
]
