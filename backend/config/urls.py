from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/audit/", include("apps.audit.urls")),
    path("api/organizations/", include("apps.organizations.urls")),
    path("api/", include("apps.applications.urls")),
    path("api/", include("apps.connections.urls")),
    path("api/", include("apps.schemas.urls")),
]
