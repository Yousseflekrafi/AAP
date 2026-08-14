from django.contrib import admin

from .models import Organization, OrganizationMember


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "org_type", "status", "created_by", "created_at")
    list_filter = ("status", "org_type")
    search_fields = ("name", "slug")
    inlines = [OrganizationMemberInline]


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("organization", "user", "role", "joined_at")
    list_filter = ("role",)
    search_fields = ("organization__name", "user__email")
