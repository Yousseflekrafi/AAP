from django.contrib import admin

from .models import ColumnPermission, DataPermission, TablePermission


@admin.register(TablePermission)
class TablePermissionAdmin(admin.ModelAdmin):
    list_display = ("table", "role", "user", "can_read")
    list_filter = ("can_read",)


@admin.register(ColumnPermission)
class ColumnPermissionAdmin(admin.ModelAdmin):
    list_display = ("column", "role", "user", "can_read")
    list_filter = ("can_read",)


@admin.register(DataPermission)
class DataPermissionAdmin(admin.ModelAdmin):
    list_display = ("table", "role", "user", "filter_expression")
