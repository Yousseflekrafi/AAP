from django.contrib import admin

from .models import DatabaseColumn, DatabaseRelationship, DatabaseSchema, DatabaseTable


class DatabaseTableInline(admin.TabularInline):
    model = DatabaseTable
    extra = 0


@admin.register(DatabaseSchema)
class DatabaseSchemaAdmin(admin.ModelAdmin):
    list_display = ("name", "connection", "discovered_at")
    inlines = [DatabaseTableInline]


class DatabaseColumnInline(admin.TabularInline):
    model = DatabaseColumn
    extra = 0


@admin.register(DatabaseTable)
class DatabaseTableAdmin(admin.ModelAdmin):
    list_display = ("name", "schema")
    search_fields = ("name",)
    inlines = [DatabaseColumnInline]


@admin.register(DatabaseColumn)
class DatabaseColumnAdmin(admin.ModelAdmin):
    list_display = ("table", "name", "data_type", "is_primary_key", "is_nullable")
    search_fields = ("name", "table__name")


@admin.register(DatabaseRelationship)
class DatabaseRelationshipAdmin(admin.ModelAdmin):
    list_display = ("from_table", "from_column", "to_table", "to_column")
