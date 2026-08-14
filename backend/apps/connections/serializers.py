from rest_framework import serializers

from .models import DatabaseConnection


class DatabaseConnectionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = DatabaseConnection
        fields = [
            "id", "application", "name", "host", "port", "database", "username",
            "password", "is_read_only", "last_tested_at", "last_test_ok",
            "created_by", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "application", "last_tested_at", "last_test_ok",
            "created_by", "created_at", "updated_at",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "This field is required."})
        instance = DatabaseConnection(**validated_data)
        instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class TestConnectionResultSerializer(serializers.Serializer):
    ok = serializers.BooleanField()
    detail = serializers.CharField()
