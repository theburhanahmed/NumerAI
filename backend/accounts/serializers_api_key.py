"""
Serializers for API key management.
"""
from rest_framework import serializers
from .models_api_key import APIKey


class APIKeySerializer(serializers.ModelSerializer):
    """Serializer for API key (without full key for security)."""
    
    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'key_prefix', 'is_active', 'last_used',
            'expires_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'key_prefix', 'is_active', 'last_used',
            'expires_at', 'created_at',
        ]


class CreateAPIKeySerializer(serializers.Serializer):
    """Serializer for creating an API key."""
    name = serializers.CharField(max_length=100, required=True)
    expires_in_days = serializers.IntegerField(min_value=1, max_value=3650, required=False)

