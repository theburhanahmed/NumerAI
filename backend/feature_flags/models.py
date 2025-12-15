"""
Feature flag models for NumerAI application.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class FeatureFlag(models.Model):
    """Master feature flag definition."""
    
    CATEGORY_CHOICES = [
        ('core', 'Core Features'),
        ('meus', 'MEUS (Multi-Entity Universe System)'),
        ('numerology', 'Numerology Features'),
        ('ai', 'AI Features'),
        ('reports', 'Reports'),
        ('social', 'Social Features'),
        ('premium', 'Premium Features'),
    ]
    
    TIER_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('elite', 'Elite'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True, help_text="Unique identifier for the feature flag")
    display_name = models.CharField(max_length=200, help_text="Human-readable name")
    description = models.TextField(blank=True, help_text="Feature description")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='core')
    is_active = models.BooleanField(default=True, help_text="Global enable/disable for the feature")
    default_tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='free', help_text="Minimum tier required by default")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'feature_flags'
        verbose_name = 'Feature Flag'
        verbose_name_plural = 'Feature Flags'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.display_name} ({self.name})"


class SubscriptionFeatureAccess(models.Model):
    """Subscription tier-based feature access control."""
    
    TIER_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('elite', 'Elite'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription_tier = models.CharField(max_length=20, choices=TIER_CHOICES, db_index=True)
    feature_flag = models.ForeignKey(FeatureFlag, on_delete=models.CASCADE, related_name='tier_access')
    is_enabled = models.BooleanField(default=False, help_text="Whether this tier has access to the feature")
    limits = models.JSONField(default=dict, blank=True, help_text="Usage limits (e.g., max_entities, max_reports)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_feature_access'
        verbose_name = 'Subscription Feature Access'
        verbose_name_plural = 'Subscription Feature Access'
        unique_together = [['subscription_tier', 'feature_flag']]
        indexes = [
            models.Index(fields=['subscription_tier', 'is_enabled']),
        ]
    
    def __str__(self):
        return f"{self.subscription_tier} - {self.feature_flag.display_name} ({'Enabled' if self.is_enabled else 'Disabled'})"
