from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "recipient", "notif_type", "is_read", "created_at")
    list_filter = ("notif_type", "is_read")
    search_fields = ("title", "recipient__email")
    readonly_fields = [f.name for f in Notification._meta.fields]

    def has_add_permission(self, request):
        return False
