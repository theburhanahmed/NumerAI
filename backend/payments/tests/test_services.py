"""
Unit tests for payment services.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from decimal import Decimal
from django.utils import timezone
from accounts.models import User
from payments.models import Subscription, Payment, BillingHistory
from payments.services import (
    get_or_create_stripe_customer,
    create_subscription,
    handle_webhook_event,
)


@pytest.mark.django_db
class TestPaymentServices:
    """Test payment service functions."""
    
    def test_get_or_create_stripe_customer_new(self):
        """Test creating a new Stripe customer."""
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        
        with patch('payments.services.stripe.Customer.create') as mock_create:
            mock_customer = Mock()
            mock_customer.id = 'cus_test123'
            mock_create.return_value = mock_customer
            
            customer_id = get_or_create_stripe_customer(user)
            
            assert customer_id == 'cus_test123'
            mock_create.assert_called_once()
    
    def test_get_or_create_stripe_customer_existing(self):
        """Test getting existing Stripe customer from subscription."""
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        
        subscription = Subscription.objects.create(
            user=user,
            stripe_customer_id='cus_existing123',
            plan='premium',
            status='active'
        )
        
        customer_id = get_or_create_stripe_customer(user)
        
        assert customer_id == 'cus_existing123'
    
    @patch('payments.services.stripe.Subscription.create')
    @patch('payments.services.get_or_create_stripe_customer')
    def test_create_subscription(self, mock_get_customer, mock_create_sub):
        """Test creating a subscription."""
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        
        mock_get_customer.return_value = 'cus_test123'
        
        mock_subscription = Mock()
        mock_subscription.id = 'sub_test123'
        mock_subscription.status = 'active'
        mock_subscription.current_period_start = 1609459200
        mock_subscription.current_period_end = 1612137600
        mock_subscription.latest_invoice = None
        mock_create_sub.return_value = mock_subscription
        
        with patch('payments.services.settings.STRIPE_PRICE_IDS', {'premium': 'price_test123'}):
            result = create_subscription(user, 'premium')
            
            assert 'subscription_id' in result
            assert result['status'] == 'active'
            assert Subscription.objects.filter(user=user).exists()
    
    def test_handle_webhook_event_payment_succeeded(self):
        """Test handling payment_intent.succeeded webhook."""
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        
        event = {
            'id': 'evt_test123',
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_test123',
                    'customer': 'cus_test123',
                    'amount': 999,
                    'currency': 'usd',
                    'description': 'Test payment',
                    'metadata': {
                        'user_id': str(user.id)
                    }
                }
            }
        }
        
        with patch('payments.services._handle_payment_intent_succeeded') as mock_handler:
            result = handle_webhook_event(event)
            
            assert result['status'] == 'processed'
            assert result['event_id'] == 'evt_test123'
            mock_handler.assert_called_once()


@pytest.mark.django_db
class TestPaymentModels:
    """Test payment models."""
    
    def test_subscription_is_active(self):
        """Test subscription is_active method."""
        user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        
        subscription = Subscription.objects.create(
            user=user,
            plan='premium',
            status='active',
            current_period_end=timezone.now() + timezone.timedelta(days=30)
        )
        
        assert subscription.is_active() is True
        
        subscription.status = 'canceled'
        subscription.save()
        assert subscription.is_active() is False

