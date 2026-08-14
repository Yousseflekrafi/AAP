from django.contrib import admin

from .models import ApiConnection, DatabaseConnection


@admin.register(DatabaseConnection)
class DatabaseConnectionAdmin(admin.ModelAdmin):
    list_display = ("name", "application", "host", "port", "database", "is_read_only", "last_test_ok")
    search_fields = ("name", "host", "database", "application__name")
    readonly_fields = ("password_encrypted", "last_tested_at", "last_test_ok")


@admin.register(ApiConnection)
class ApiConnectionAdmin(admin.ModelAdmin):
    list_display = ("name", "application", "base_url", "auth_type")
    search_fields = ("name", "base_url", "application__name")
    readonly_fields = ("credentials_encrypted",)
