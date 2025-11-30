"""
Serializers for payments application.
"""
from rest_framework import serializers
from .models import Subscription, Payment, BillingHistory


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model."""
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'current_period_start', 'current_period_end',
            'cancel_at_period_end', 'canceled_at', 'trial_start', 'trial_end',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'current_period_start', 'current_period_end',
            'cancel_at_period_end', 'canceled_at', 'trial_start', 'trial_end',
            'created_at', 'updated_at',
        ]


class CreateSubscriptionSerializer(serializers.Serializer):
    """Serializer for creating a subscription."""
    plan = serializers.ChoiceField(choices=['basic', 'premium', 'elite'])
    payment_method_id = serializers.CharField(required=False, allow_blank=True)


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'status', 'description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BillingHistorySerializer(serializers.ModelSerializer):
    """Serializer for BillingHistory model."""
    
    class Meta:
        model = BillingHistory
        fields = [
            'id', 'amount', 'currency', 'description', 'invoice_url',
            'period_start', 'period_end', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

