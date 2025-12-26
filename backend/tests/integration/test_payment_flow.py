"""
Integration tests for payment flow.
"""
import pytest
from unittest.mock import patch, MagicMock
from rest_framework import status
from payments.models import Subscription, Payment, BillingHistory


@pytest.mark.django_db
class TestPaymentFlow:
    """Test complete payment and subscription flow."""
    
    @patch('payments.services.stripe.Subscription.create')
    @patch('payments.services.stripe.Customer.create')
    def test_create_subscription_flow(self, mock_customer, mock_subscription, authenticated_api_client, test_user):
        """Test subscription creation flow."""
        # Mock Stripe responses
        mock_customer.return_value = MagicMock(id='cus_test123')
        mock_subscription.return_value = MagicMock(
            id='sub_test123',
            status='active',
            current_period_start=1609459200,
            current_period_end=1612137600,
            latest_invoice=MagicMock(
                payment_intent=MagicMock(client_secret='pi_test_secret')
            )
        )
        
        # Create subscription
        subscription_data = {
            'plan': 'premium',
        }
        response = authenticated_api_client.post('/api/v1/payments/create-subscription/', subscription_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'subscription_id' in response.data
        assert 'client_secret' in response.data
        
        # Verify subscription was created in database
        subscription = Subscription.objects.get(user=test_user)
        assert subscription.plan == 'premium'
        assert subscription.status == 'active'
        
        # Verify user premium status updated
        test_user.refresh_from_db()
        assert test_user.is_premium is True
        assert test_user.subscription_plan == 'premium'
    
    def test_get_subscription_status(self, authenticated_api_client, test_user):
        """Test getting subscription status."""
        # Create subscription first
        from payments.models import Subscription
        Subscription.objects.create(
            user=test_user,
            plan='premium',
            status='active',
            stripe_subscription_id='sub_test123',
            stripe_customer_id='cus_test123',
        )
        
        response = authenticated_api_client.get('/api/v1/payments/subscription-status/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['has_subscription'] is True
        assert response.data['subscription']['plan'] == 'premium'
    
    def test_billing_history(self, authenticated_api_client, test_user):
        """Test getting billing history."""
        # Create billing history entry
        from payments.models import Subscription, BillingHistory
        subscription = Subscription.objects.create(
            user=test_user,
            plan='premium',
            status='active',
        )
        BillingHistory.objects.create(
            user=test_user,
            subscription=subscription,
            amount=19.99,
            currency='usd',
            description='Premium subscription',
        )
        
        response = authenticated_api_client.get('/api/v1/payments/billing-history/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['amount'] == '19.99'

