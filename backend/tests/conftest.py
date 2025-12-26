"""
Pytest configuration and fixtures for integration tests.
"""
import pytest
from django.contrib.auth import get_user_model
from accounts.models import User
from numerology.models import NumerologyProfile

User = get_user_model()


@pytest.fixture
def test_user(db):
    """Create a test user."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        full_name='Test User',
        is_verified=True,
    )


@pytest.fixture
def test_user_unverified(db):
    """Create an unverified test user."""
    return User.objects.create_user(
        email='unverified@example.com',
        password='testpass123',
        full_name='Unverified User',
        is_verified=False,
    )


@pytest.fixture
def authenticated_client(client, test_user):
    """Create an authenticated client."""
    client.force_login(test_user)
    return client


@pytest.fixture
def api_client():
    """Create an API client for testing."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_api_client(api_client, test_user):
    """Create an authenticated API client."""
    api_client.force_authenticate(user=test_user)
    return api_client

