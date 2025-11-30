"""
Integration tests for payment API views.
"""
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from payments.models import Subscription


@pytest.mark.django_db
class TestPaymentViews:
    """Test payment API endpoints."""
    
    def setup_method(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            full_name='Test User',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_subscription_requires_auth(self):
        """Test that creating subscription requires authentication."""
        client = APIClient()
        response = client.post('/api/v1/payments/create-subscription/', {
            'plan': 'premium'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @patch('payments.views.create_subscription')
    def test_create_subscription_success(self, mock_create_sub):
        """Test successful subscription creation."""
        mock_create_sub.return_value = {
            'subscription_id': 'sub_test123',
            'client_secret': 'secret_test123',
            'status': 'active'
        }
        
        response = self.client.post('/api/v1/payments/create-subscription/', {
            'plan': 'premium'
        })
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'subscription_id' in response.data
    
    def test_get_subscription_status_no_subscription(self):
        """Test getting subscription status when user has no subscription."""
        response = self.client.get('/api/v1/payments/subscription-status/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['has_subscription'] is False
    
    def test_get_subscription_status_with_subscription(self):
        """Test getting subscription status when user has subscription."""
        Subscription.objects.create(
            user=self.user,
            plan='premium',
            status='active'
        )
        
        response = self.client.get('/api/v1/payments/subscription-status/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['has_subscription'] is True
        assert response.data['subscription']['plan'] == 'premium'
    
    def test_get_billing_history(self):
        """Test getting billing history."""
        response = self.client.get('/api/v1/payments/billing-history/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data or 'count' in response.data

