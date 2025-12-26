"""
Admin configuration for analytics models.
"""
from django.contrib import admin
from .models import (
    UserActivityLog, EventTracking, UserJourney,
    ABTest, ConversionFunnel, BusinessMetric
)


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'activity_type', 'feature_name', 'created_at']
    list_filter = ['activity_type', 'feature_name', 'created_at']
    search_fields = ['user__email', 'activity_type', 'feature_name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(EventTracking)
class EventTrackingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'event_name', 'event_category', 'funnel_name', 'experiment_id', 'created_at']
    list_filter = ['event_category', 'funnel_name', 'experiment_id', 'created_at']
    search_fields = ['user__email', 'event_name', 'funnel_name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(UserJourney)
class UserJourneyAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'journey_type', 'current_step', 'completed', 'started_at']
    list_filter = ['journey_type', 'completed', 'started_at']
    search_fields = ['user__email', 'journey_type', 'session_id']
    readonly_fields = ['id', 'started_at']
    date_hierarchy = 'started_at'


@admin.register(ABTest)
class ABTestAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'start_date', 'end_date', 'primary_metric', 'created_at']
    list_filter = ['is_active', 'start_date', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ConversionFunnel)
class ConversionFunnelAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'time_window_hours', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(BusinessMetric)
class BusinessMetricAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_category', 'value', 'period_type', 'period_start']
    list_filter = ['metric_category', 'period_type', 'period_start']
    search_fields = ['metric_name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'period_start'
