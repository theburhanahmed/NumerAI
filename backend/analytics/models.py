"""
Analytics models for tracking user behavior and business metrics.
"""
from django.db import models
from django.conf import settings
import uuid


class UserActivityLog(models.Model):
    """
    Log user activities for analytics and behavior tracking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        null=True,
        blank=True
    )
    
    # Activity details
    activity_type = models.CharField(max_length=50, db_index=True)
    activity_data = models.JSONField(default=dict, blank=True)
    
    # Request details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=255, blank=True, db_index=True)
    
    # Page/Feature tracking
    page_path = models.CharField(max_length=500, blank=True)
    feature_name = models.CharField(max_length=100, blank=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'user_activity_log'
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['activity_type', 'created_at']),
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['feature_name', 'created_at']),
        ]

    def __str__(self):
        return f"{self.activity_type} - {self.user or 'Anonymous'} - {self.created_at}"


class EventTracking(models.Model):
    """
    Track specific events for conversion funnels and A/B testing.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_trackings',
        null=True,
        blank=True
    )
    
    # Event details
    event_name = models.CharField(max_length=100, db_index=True)
    event_category = models.CharField(max_length=50, db_index=True)  # e.g., 'conversion', 'engagement', 'error'
    event_properties = models.JSONField(default=dict, blank=True)
    
    # Funnel tracking
    funnel_name = models.CharField(max_length=100, blank=True, db_index=True)
    funnel_step = models.CharField(max_length=50, blank=True)
    funnel_position = models.IntegerField(null=True, blank=True)
    
    # A/B Testing
    experiment_id = models.CharField(max_length=100, blank=True, db_index=True)
    variant_id = models.CharField(max_length=100, blank=True)
    
    # Context
    session_id = models.CharField(max_length=255, blank=True, db_index=True)
    page_path = models.CharField(max_length=500, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'event_tracking'
        verbose_name = 'Event Tracking'
        verbose_name_plural = 'Event Trackings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_name', 'created_at']),
            models.Index(fields=['funnel_name', 'funnel_position']),
            models.Index(fields=['experiment_id', 'variant_id']),
            models.Index(fields=['event_category', 'created_at']),
        ]

    def __str__(self):
        return f"{self.event_name} - {self.user or 'Anonymous'} - {self.created_at}"


class UserJourney(models.Model):
    """
    Track user journeys through the application.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='journeys',
        null=True,
        blank=True
    )
    
    session_id = models.CharField(max_length=255, db_index=True)
    journey_type = models.CharField(max_length=50, db_index=True)  # e.g., 'registration', 'subscription', 'report_generation'
    
    # Journey steps
    steps = models.JSONField(default=list)  # List of steps with timestamps
    current_step = models.CharField(max_length=100, blank=True)
    completed = models.BooleanField(default=False)
    
    # Metrics
    duration_seconds = models.IntegerField(null=True, blank=True)
    steps_completed = models.IntegerField(default=0)
    total_steps = models.IntegerField(default=0)
    
    started_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_journey'
        verbose_name = 'User Journey'
        verbose_name_plural = 'User Journeys'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'journey_type', 'started_at']),
            models.Index(fields=['session_id', 'started_at']),
            models.Index(fields=['completed', 'started_at']),
        ]

    def __str__(self):
        return f"{self.journey_type} - {self.user or 'Anonymous'} - {self.started_at}"


class ABTest(models.Model):
    """
    A/B test experiments configuration.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    
    # Test configuration
    is_active = models.BooleanField(default=True, db_index=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Variants
    variants = models.JSONField(default=list)  # List of variant configurations
    
    # Targeting
    target_audience = models.JSONField(default=dict)  # e.g., {'subscription_plan': 'free'}
    
    # Metrics
    primary_metric = models.CharField(max_length=100)  # e.g., 'conversion_rate', 'engagement_score'
    secondary_metrics = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ab_tests'
        verbose_name = 'A/B Test'
        verbose_name_plural = 'A/B Tests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"


class ConversionFunnel(models.Model):
    """
    Define conversion funnels for tracking user progression.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    
    # Funnel steps
    steps = models.JSONField(default=list)  # List of step definitions with event names
    
    # Configuration
    is_active = models.BooleanField(default=True, db_index=True)
    time_window_hours = models.IntegerField(default=24)  # Time window for funnel completion
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversion_funnels'
        verbose_name = 'Conversion Funnel'
        verbose_name_plural = 'Conversion Funnels'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({len(self.steps)} steps)"


class BusinessMetric(models.Model):
    """
    Store aggregated business metrics for dashboards.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Metric details
    metric_name = models.CharField(max_length=100, db_index=True)
    metric_category = models.CharField(max_length=50, db_index=True)  # e.g., 'user', 'revenue', 'engagement'
    
    # Value
    value = models.DecimalField(max_digits=20, decimal_places=2)
    value_type = models.CharField(max_length=20)  # 'count', 'sum', 'average', 'percentage'
    
    # Time period
    period_start = models.DateTimeField(db_index=True)
    period_end = models.DateTimeField(db_index=True)
    period_type = models.CharField(max_length=20)  # 'hour', 'day', 'week', 'month'
    
    # Dimensions
    dimensions = models.JSONField(default=dict)  # e.g., {'subscription_plan': 'premium', 'country': 'US'}
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'business_metrics'
        verbose_name = 'Business Metric'
        verbose_name_plural = 'Business Metrics'
        ordering = ['-period_start']
        indexes = [
            models.Index(fields=['metric_name', 'period_start']),
            models.Index(fields=['metric_category', 'period_start']),
            models.Index(fields=['period_type', 'period_start']),
        ]
        unique_together = [['metric_name', 'period_start', 'period_type']]

    def __str__(self):
        return f"{self.metric_name} - {self.value} - {self.period_start}"
