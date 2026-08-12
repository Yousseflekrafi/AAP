from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Role, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ["-created_at"]
    list_display = ("email", "full_name", "is_active", "is_email_verified", "is_staff", "created_at")
    list_filter = ("is_active", "is_email_verified", "is_staff", "roles")
    search_fields = ("email", "first_name", "last_name")
    readonly_fields = ("id", "created_at", "updated_at", "last_login")
    filter_horizontal = ("roles", "groups", "user_permissions")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Roles & status", {"fields": ("roles", "is_active", "is_staff", "is_superuser", "is_email_verified", "auth_provider")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
