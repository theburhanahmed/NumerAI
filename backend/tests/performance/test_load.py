"""
Performance tests for NumerAI API.
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
import time

User = get_user_model()


@pytest.mark.django_db
class TestAPIPerformance:
    """Performance tests for API endpoints."""
    
    def test_birth_chart_response_time(self, authenticated_api_client, test_user):
        """Test that birth chart endpoint responds within acceptable time."""
        start_time = time.time()
        response = authenticated_api_client.get('/api/v1/numerology/birth-chart/')
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed_time < 2.0  # Should respond within 2 seconds
    
    def test_daily_reading_response_time(self, authenticated_api_client, test_user):
        """Test that daily reading endpoint responds within acceptable time."""
        start_time = time.time()
        response = authenticated_api_client.get('/api/v1/numerology/daily-reading/')
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed_time < 1.0  # Should respond within 1 second
    
    def test_subscription_status_response_time(self, authenticated_api_client, test_user):
        """Test that subscription status endpoint responds quickly."""
        start_time = time.time()
        response = authenticated_api_client.get('/api/v1/payments/subscription-status/')
        elapsed_time = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed_time < 0.5  # Should respond within 500ms

