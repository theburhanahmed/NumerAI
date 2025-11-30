"""
Admin configuration for payments application.
"""
from django.contrib import admin
from .models import Subscription, Payment, BillingHistory, WebhookEvent


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for Subscription model."""
    list_display = ['user', 'plan', 'status', 'current_period_end', 'created_at']
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'stripe_subscription_id', 'stripe_customer_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for Payment model."""
    list_display = ['user', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['user__email', 'stripe_payment_intent_id', 'stripe_charge_id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    """Admin interface for BillingHistory model."""
    list_display = ['user', 'amount', 'currency', 'description', 'created_at']
    list_filter = ['currency', 'created_at']
    search_fields = ['user__email', 'description']
    readonly_fields = ['id', 'created_at']


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """Admin interface for WebhookEvent model."""
    list_display = ['stripe_event_id', 'event_type', 'processed', 'created_at']
    list_filter = ['event_type', 'processed', 'created_at']
    search_fields = ['stripe_event_id', 'event_type']
    readonly_fields = ['id', 'created_at', 'processed_at']
