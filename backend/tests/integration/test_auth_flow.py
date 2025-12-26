"""
Integration tests for authentication flow.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from accounts.models import OTPCode

User = get_user_model()


@pytest.mark.django_db
class TestAuthFlow:
    """Test complete authentication flow."""
    
    def test_register_verify_login_flow(self, api_client):
        """Test complete flow: register -> verify OTP -> login."""
        # Step 1: Register
        register_data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'full_name': 'New User',
        }
        response = api_client.post('/api/v1/auth/register/', register_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['message'] == 'Registration successful. Please verify your email.'
        
        # Step 2: Get OTP (in real scenario, OTP is sent via email)
        user = User.objects.get(email='newuser@example.com')
        otp_code = OTPCode.objects.filter(user=user, is_used=False).first()
        assert otp_code is not None
        
        # Step 3: Verify OTP
        verify_data = {
            'email': 'newuser@example.com',
            'otp': otp_code.code,
        }
        response = api_client.post('/api/v1/auth/verify-otp/', verify_data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access_token' in response.data
        assert 'refresh_token' in response.data
        
        # Step 4: Login with credentials
        login_data = {
            'email': 'newuser@example.com',
            'password': 'securepass123',
        }
        response = api_client.post('/api/v1/auth/login/', login_data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access_token' in response.data
        assert 'refresh_token' in response.data
    
    def test_login_without_verification_fails(self, api_client):
        """Test that unverified users cannot login."""
        # Register user
        register_data = {
            'email': 'unverified@example.com',
            'password': 'securepass123',
            'confirm_password': 'securepass123',
            'full_name': 'Unverified User',
        }
        api_client.post('/api/v1/auth/register/', register_data)
        
        # Try to login without verification
        login_data = {
            'email': 'unverified@example.com',
            'password': 'securepass123',
        }
        response = api_client.post('/api/v1/auth/login/', login_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_token_refresh_flow(self, api_client, authenticated_api_client):
        """Test token refresh flow."""
        # Get refresh token from login
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
        }
        response = api_client.post('/api/v1/auth/login/', login_data)
        refresh_token = response.data['refresh_token']
        
        # Use refresh token to get new access token
        refresh_data = {'refresh': refresh_token}
        response = api_client.post('/api/v1/auth/refresh-token/', refresh_data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access_token' in response.data

