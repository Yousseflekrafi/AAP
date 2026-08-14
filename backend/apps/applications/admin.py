from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "environment", "slug", "created_at")
    search_fields = ("name", "slug", "organization__name")
    list_filter = ("organization", "environment")
