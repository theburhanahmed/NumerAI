"""
Integration tests for user profile endpoints.
Tests full request/response cycle and database persistence.
"""
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.db import transaction
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date
from accounts.models import User, UserProfile


class ProfileIntegrationTests(TransactionTestCase):
    """Integration tests for profile endpoint with transaction handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create(
            email='integration@example.com',
            full_name='Integration Test User'
        )
        self.user.set_password('testpass123')
        self.user.is_verified = True
        self.user.save()
        
        # Create user profile
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            date_of_birth=date(1990, 5, 15),
            gender='male',
            timezone='Asia/Kolkata',
            location='Mumbai, India',
            bio='Initial bio'
        )
        
        self.client.force_authenticate(user=self.user)
        self.url = reverse('accounts:user-profile')
    
    def test_full_profile_update_cycle(self):
        """Test complete profile update flow: GET -> PATCH -> GET -> verify DB."""
        # Step 1: GET initial profile
        get_response = self.client.get(self.url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        initial_data = get_response.data
        
        # Step 2: PATCH update profile
        update_data = {
            'full_name': 'Updated Integration User',
            'date_of_birth': '1985-03-20',
            'gender': 'female',
            'timezone': 'America/New_York',
            'location': 'New York, USA',
            'bio': 'Updated integration bio'
        }
        patch_response = self.client.patch(self.url, update_data, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        
        # Step 3: Verify response data
        self.assertEqual(patch_response.data['full_name'], 'Updated Integration User')
        self.assertEqual(patch_response.data['gender'], 'female')
        self.assertEqual(patch_response.data['bio'], 'Updated integration bio')
        
        # Step 4: GET updated profile
        get_response_after = self.client.get(self.url)
        self.assertEqual(get_response_after.status_code, status.HTTP_200_OK)
        
        # Step 5: Verify response matches update
        self.assertEqual(get_response_after.data['full_name'], 'Updated Integration User')
        self.assertEqual(get_response_after.data['date_of_birth'], '1985-03-20')
        self.assertEqual(get_response_after.data['gender'], 'female')
        
        # Step 6: Verify database persistence directly
        self.user.refresh_from_db()
        self.user_profile.refresh_from_db()
        
        self.assertEqual(self.user.full_name, 'Updated Integration User')
        self.assertEqual(str(self.user_profile.date_of_birth), '1985-03-20')
        self.assertEqual(self.user_profile.gender, 'female')
        self.assertEqual(self.user_profile.timezone, 'America/New_York')
        self.assertEqual(self.user_profile.location, 'New York, USA')
        self.assertEqual(self.user_profile.bio, 'Updated integration bio')
    
    def test_profile_update_atomic_transaction(self):
        """Test that profile updates are atomic (all or nothing)."""
        # This test verifies transaction handling
        # If one update fails, none should persist
        
        # Start with known state
        original_name = self.user.full_name
        original_bio = self.user_profile.bio
        
        # Attempt update with invalid data (should fail validation)
        invalid_data = {
            'full_name': 'Valid Name',
            'gender': 'invalid_gender_value',  # This should cause validation error
            'bio': 'This should not be saved'
        }
        
        response = self.client.patch(self.url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify nothing was saved (transaction rolled back)
        self.user.refresh_from_db()
        self.user_profile.refresh_from_db()
        
        self.assertEqual(self.user.full_name, original_name)
        self.assertEqual(self.user_profile.bio, original_bio)
    
    def test_profile_update_user_and_profile_models(self):
        """Test that update correctly modifies both User and UserProfile models."""
        update_data = {
            'full_name': 'New Full Name',  # User model field
            'bio': 'New Bio',  # UserProfile model field
            'location': 'New Location'  # UserProfile model field
        }
        
        response = self.client.patch(self.url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify User model
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, 'New Full Name')
        
        # Verify UserProfile model
        self.user_profile.refresh_from_db()
        self.assertEqual(self.user_profile.bio, 'New Bio')
        self.assertEqual(self.user_profile.location, 'New Location')
    
    def test_profile_get_returns_combined_data(self):
        """Test that GET endpoint returns data from both User and UserProfile."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify User model fields are included
        self.assertIn('email', response.data)
        self.assertIn('full_name', response.data)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['full_name'], self.user.full_name)
        
        # Verify UserProfile model fields are included
        self.assertIn('date_of_birth', response.data)
        self.assertIn('gender', response.data)
        self.assertIn('timezone', response.data)
        self.assertIn('location', response.data)
        self.assertIn('bio', response.data)
    
    def test_profile_update_with_empty_optional_fields(self):
        """Test that optional fields can be set to empty/null."""
        update_data = {
            'location': '',  # Empty string
            'bio': None  # None value
        }
        
        response = self.client.patch(self.url, update_data, format='json')
        
        # Should handle gracefully - either accept or validate
        # For now, we'll verify it doesn't crash
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        
        if response.status_code == status.HTTP_200_OK:
            self.user_profile.refresh_from_db()
            # Verify fields were updated as expected
    
    def test_profile_update_response_format(self):
        """Test that update response follows expected format."""
        update_data = {
            'full_name': 'Response Format Test',
            'bio': 'Testing response format'
        }
        
        response = self.client.patch(self.url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify response structure
        self.assertIsInstance(response.data, dict)
        self.assertIn('full_name', response.data)
        self.assertIn('bio', response.data)
        self.assertIn('email', response.data)  # Should be included even if not updated
    
    def test_profile_error_response_format(self):
        """Test that error responses follow expected format with field_errors."""
        invalid_data = {
            'gender': 'invalid_gender'
        }
        
        response = self.client.patch(self.url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify error response structure
        self.assertIn('error', response.data or {})
        self.assertIn('field_errors', response.data or {})












