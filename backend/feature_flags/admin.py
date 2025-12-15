"""
Django admin configuration for feature flags.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import FeatureFlag, SubscriptionFeatureAccess
from .services import FeatureFlagManager


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    """Admin interface for FeatureFlag model."""
    
    list_display = ['name', 'display_name', 'category', 'is_active', 'default_tier', 'tier_access_summary', 'created_at']
    list_filter = ['category', 'is_active', 'default_tier', 'created_at']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'display_name', 'description', 'category')
        }),
        ('Configuration', {
            'fields': ('is_active', 'default_tier')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def tier_access_summary(self, obj):
        """Display tier access summary."""
        accesses = obj.tier_access.all()
        enabled_tiers = [acc.subscription_tier for acc in accesses if acc.is_enabled]
        disabled_tiers = [acc.subscription_tier for acc in accesses if not acc.is_enabled]
        
        html = '<div style="display: flex; gap: 8px; flex-wrap: wrap;">'
        for tier in ['free', 'basic', 'premium', 'elite']:
            if tier in enabled_tiers:
                html += f'<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{tier.upper()}</span>'
            elif tier in disabled_tiers:
                html += f'<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{tier.upper()}</span>'
            else:
                html += f'<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{tier.upper()}</span>'
        html += '</div>'
        return format_html(html)
    
    tier_access_summary.short_description = 'Tier Access'
    
    actions = ['enable_all_tiers', 'disable_all_tiers', 'enable_premium_plus', 'disable_free_tier']
    
    def enable_all_tiers(self, request, queryset):
        """Enable feature for all tiers."""
        for flag in queryset:
            for tier in ['free', 'basic', 'premium', 'elite']:
                FeatureFlagManager.toggle_tier_access(flag, tier, True)
        self.message_user(request, f"Enabled {queryset.count()} feature(s) for all tiers.")
    enable_all_tiers.short_description = "Enable for all tiers"
    
    def disable_all_tiers(self, request, queryset):
        """Disable feature for all tiers."""
        for flag in queryset:
            for tier in ['free', 'basic', 'premium', 'elite']:
                FeatureFlagManager.toggle_tier_access(flag, tier, False)
        self.message_user(request, f"Disabled {queryset.count()} feature(s) for all tiers.")
    disable_all_tiers.short_description = "Disable for all tiers"
    
    def enable_premium_plus(self, request, queryset):
        """Enable feature for premium and elite tiers only."""
        for flag in queryset:
            FeatureFlagManager.toggle_tier_access(flag, 'free', False)
            FeatureFlagManager.toggle_tier_access(flag, 'basic', False)
            FeatureFlagManager.toggle_tier_access(flag, 'premium', True)
            FeatureFlagManager.toggle_tier_access(flag, 'elite', True)
        self.message_user(request, f"Enabled {queryset.count()} feature(s) for premium+ tiers.")
    enable_premium_plus.short_description = "Enable for Premium+ only"
    
    def disable_free_tier(self, request, queryset):
        """Disable feature for free tier only."""
        for flag in queryset:
            FeatureFlagManager.toggle_tier_access(flag, 'free', False)
        self.message_user(request, f"Disabled {queryset.count()} feature(s) for free tier.")
    disable_free_tier.short_description = "Disable for Free tier"


@admin.register(SubscriptionFeatureAccess)
class SubscriptionFeatureAccessAdmin(admin.ModelAdmin):
    """Admin interface for SubscriptionFeatureAccess model."""
    
    list_display = ['feature_flag', 'subscription_tier', 'is_enabled', 'limits_preview', 'updated_at']
    list_filter = ['subscription_tier', 'is_enabled', 'feature_flag__category']
    search_fields = ['feature_flag__name', 'feature_flag__display_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Access Control', {
            'fields': ('feature_flag', 'subscription_tier', 'is_enabled')
        }),
        ('Limits', {
            'fields': ('limits',),
            'description': 'JSON format: {"max_entities": 10, "max_reports": 5}'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def limits_preview(self, obj):
        """Display limits preview."""
        if obj.limits:
            return format_html('<code>{}</code>', str(obj.limits))
        return '-'
    limits_preview.short_description = 'Limits'
