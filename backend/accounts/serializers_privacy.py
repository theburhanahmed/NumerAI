"""
Serializers for privacy settings.
"""
from rest_framework import serializers
from .models_privacy import PrivacySettings


class PrivacySettingsSerializer(serializers.ModelSerializer):
    """Serializer for privacy settings."""
    
    class Meta:
        model = PrivacySettings
        fields = [
            'id', 'share_analytics', 'share_marketing', 'share_third_party',
            'profile_visibility', 'data_retention_consent', 'data_retention_period_days',
            'gdpr_consent', 'gdpr_consent_date', 'privacy_policy_accepted',
            'privacy_policy_version', 'privacy_policy_accepted_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UpdatePrivacySettingsSerializer(serializers.Serializer):
    """Serializer for updating privacy settings."""
    share_analytics = serializers.BooleanField(required=False)
    share_marketing = serializers.BooleanField(required=False)
    share_third_party = serializers.BooleanField(required=False)
    profile_visibility = serializers.ChoiceField(
        choices=['public', 'private', 'friends'],
        required=False
    )
    data_retention_consent = serializers.BooleanField(required=False)
    data_retention_period_days = serializers.IntegerField(min_value=30, max_value=3650, required=False)

