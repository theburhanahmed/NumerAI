"""
Serializers for feature flags API.
"""
from rest_framework import serializers
from .models import FeatureFlag, SubscriptionFeatureAccess


class SubscriptionFeatureAccessSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionFeatureAccess."""
    
    class Meta:
        model = SubscriptionFeatureAccess
        fields = ['id', 'subscription_tier', 'is_enabled', 'limits', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureFlagSerializer(serializers.ModelSerializer):
    """Serializer for FeatureFlag."""
    
    tier_access = SubscriptionFeatureAccessSerializer(many=True, read_only=True)
    
    class Meta:
        model = FeatureFlag
        fields = [
            'id', 'name', 'display_name', 'description', 'category',
            'is_active', 'default_tier', 'tier_access', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureFlagListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for feature flag lists."""
    
    class Meta:
        model = FeatureFlag
        fields = ['id', 'name', 'display_name', 'category', 'is_active', 'default_tier']


class UserFeatureAccessSerializer(serializers.Serializer):
    """Serializer for user's feature access."""
    
    feature_name = serializers.CharField()
    has_access = serializers.BooleanField()
    limits = serializers.DictField(required=False)


class FeatureCheckSerializer(serializers.Serializer):
    """Serializer for feature access check request."""
    
    feature_name = serializers.CharField(required=True)


class FeatureCheckResponseSerializer(serializers.Serializer):
    """Serializer for feature access check response."""
    
    feature_name = serializers.CharField()
    has_access = serializers.BooleanField()
    limits = serializers.DictField(required=False)
    subscription_tier = serializers.CharField()

