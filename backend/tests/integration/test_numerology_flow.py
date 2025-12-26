"""
Integration tests for numerology calculation flow.
"""
import pytest
from datetime import date
from rest_framework import status
from numerology.models import NumerologyProfile, DailyReading


@pytest.mark.django_db
class TestNumerologyFlow:
    """Test complete numerology calculation flow."""
    
    def test_calculate_numerology_profile(self, authenticated_api_client, test_user):
        """Test calculating numerology profile."""
        # Update user with date of birth
        test_user.date_of_birth = date(1990, 5, 15)
        test_user.save()
        
        # Calculate numerology profile
        response = authenticated_api_client.post('/api/v1/numerology/calculate-profile/')
        assert response.status_code == status.HTTP_200_OK
        assert 'life_path_number' in response.data
        assert 'birth_chart' in response.data
        
        # Verify profile was created
        profile = NumerologyProfile.objects.get(user=test_user)
        assert profile.life_path_number is not None
    
    def test_get_birth_chart(self, authenticated_api_client, test_user):
        """Test getting birth chart."""
        # Create numerology profile first
        from numerology.models import NumerologyProfile
        NumerologyProfile.objects.create(
            user=test_user,
            life_path_number=5,
            expression_number=7,
            soul_number=3,
        )
        
        response = authenticated_api_client.get('/api/v1/numerology/birth-chart/')
        assert response.status_code == status.HTTP_200_OK
        assert 'life_path_number' in response.data
        assert 'interpretations' in response.data
    
    def test_get_daily_reading(self, authenticated_api_client, test_user):
        """Test getting daily reading."""
        # Create numerology profile
        from numerology.models import NumerologyProfile
        NumerologyProfile.objects.create(
            user=test_user,
            life_path_number=5,
        )
        
        response = authenticated_api_client.get('/api/v1/numerology/daily-reading/')
        assert response.status_code == status.HTTP_200_OK
        assert 'personal_day_number' in response.data
        assert 'reading' in response.data

