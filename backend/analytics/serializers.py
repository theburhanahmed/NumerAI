"""
Serializers for analytics models.
"""
from rest_framework import serializers
from .models import (
    UserActivityLog, EventTracking, UserJourney,
    ABTest, ConversionFunnel, BusinessMetric
)


class UserActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'user', 'activity_type', 'activity_data',
            'page_path', 'feature_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTracking
        fields = [
            'id', 'user', 'event_name', 'event_category', 'event_properties',
            'funnel_name', 'funnel_step', 'funnel_position',
            'experiment_id', 'variant_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserJourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserJourney
        fields = [
            'id', 'user', 'session_id', 'journey_type', 'steps',
            'current_step', 'completed', 'duration_seconds',
            'steps_completed', 'total_steps', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class ABTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABTest
        fields = [
            'id', 'name', 'description', 'is_active',
            'start_date', 'end_date', 'variants', 'target_audience',
            'primary_metric', 'secondary_metrics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConversionFunnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversionFunnel
        fields = [
            'id', 'name', 'description', 'steps',
            'is_active', 'time_window_hours', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BusinessMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessMetric
        fields = [
            'id', 'metric_name', 'metric_category', 'value', 'value_type',
            'period_start', 'period_end', 'period_type', 'dimensions', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
