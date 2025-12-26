"""
Serializers for notification preferences.
"""
from rest_framework import serializers
from .models_notification_prefs import NotificationPreference


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences."""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'notification_type', 'channel', 'enabled',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UpdateNotificationPreferenceSerializer(serializers.Serializer):
    """Serializer for updating notification preferences."""
    notification_type = serializers.ChoiceField(
        choices=NotificationPreference.NOTIFICATION_TYPES,
        required=True
    )
    channel = serializers.ChoiceField(
        choices=NotificationPreference.CHANNEL_TYPES,
        required=True
    )
    enabled = serializers.BooleanField(required=True)

