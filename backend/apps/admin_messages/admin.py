from django.contrib import admin

from .models import AdminConversation, AdminMessage


class AdminMessageInline(admin.TabularInline):
    model = AdminMessage
    extra = 0
    readonly_fields = ("sender", "message", "created_at", "read_at")


@admin.register(AdminConversation)
class AdminConversationAdmin(admin.ModelAdmin):
    list_display = ("subject", "organization", "created_by", "status", "priority", "updated_at")
    list_filter = ("status", "priority")
    search_fields = ("subject", "created_by__email")
    inlines = [AdminMessageInline]
