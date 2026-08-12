from django.contrib import admin

from .models import AuditLog, SecurityEvent


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "method", "path", "status_code", "ip_address")
    list_filter = ("method", "status_code")
    search_fields = ("path", "user__email", "ip_address")
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "event_type", "severity", "user", "ip_address")
    list_filter = ("severity", "event_type")
    search_fields = ("event_type", "user__email", "ip_address")
    readonly_fields = [f.name for f in SecurityEvent._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
