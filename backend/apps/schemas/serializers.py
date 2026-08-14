from rest_framework import serializers

from .models import DatabaseColumn, DatabaseRelationship, DatabaseSchema, DatabaseTable


class DatabaseColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseColumn
        fields = ["id", "name", "data_type", "is_nullable", "is_primary_key", "ordinal_position", "description"]


class DatabaseTableSerializer(serializers.ModelSerializer):
    columns = DatabaseColumnSerializer(many=True, read_only=True)

    class Meta:
        model = DatabaseTable
        fields = ["id", "name", "description", "columns"]


class DatabaseRelationshipSerializer(serializers.ModelSerializer):
    from_table = serializers.CharField(source="from_table.name", read_only=True)
    from_column = serializers.CharField(source="from_column.name", read_only=True)
    to_table = serializers.CharField(source="to_table.name", read_only=True)
    to_column = serializers.CharField(source="to_column.name", read_only=True)

    class Meta:
        model = DatabaseRelationship
        fields = ["id", "constraint_name", "from_table", "from_column", "to_table", "to_column"]


class DatabaseSchemaSerializer(serializers.ModelSerializer):
    tables = DatabaseTableSerializer(many=True, read_only=True)
    relationships = serializers.SerializerMethodField()

    class Meta:
        model = DatabaseSchema
        fields = ["id", "connection", "name", "discovered_at", "tables", "relationships"]

    def get_relationships(self, schema):
        relationships = DatabaseRelationship.objects.filter(from_table__schema=schema).select_related(
            "from_table", "from_column", "to_table", "to_column"
        )
        return DatabaseRelationshipSerializer(relationships, many=True).data


class DiscoverySummarySerializer(serializers.Serializer):
    schema = serializers.CharField()
    tables = serializers.IntegerField()
    columns = serializers.IntegerField()
    relationships = serializers.IntegerField()
