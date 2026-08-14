from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False)

    class Meta:
        model = Application
        fields = [
            "id", "organization", "name", "slug", "description", "application_url",
            "environment", "context_description", "created_by", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_by", "created_at", "updated_at"]

    def validate_slug(self, value):
        return value.lower()
