"""
Integration test script to verify all features are properly wired up.
Run this with: python manage.py shell < integration_test.py
Or: python manage.py test
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerai.settings.development')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from feature_flags.models import FeatureFlag, SubscriptionFeatureAccess
from meus.models import EntityProfile
from numerology.models import NumerologyProfile

User = get_user_model()


class IntegrationTestCase(TestCase):
    """Comprehensive integration tests for all features."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_feature_flags_app_registered(self):
        """Test that feature_flags app is registered."""
        from django.apps import apps
        self.assertTrue(apps.is_installed('feature_flags'))
    
    def test_meus_app_registered(self):
        """Test that meus app is registered."""
        from django.apps import apps
        self.assertTrue(apps.is_installed('meus'))
    
    def test_feature_flags_api_endpoints(self):
        """Test feature flags API endpoints."""
        # Test list endpoint
        response = self.client.get('/api/v1/feature-flags/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test check endpoint
        response = self.client.post('/api/v1/feature-flags/check/', {
            'feature_name': 'birth_date_numerology'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('has_access', response.data)
        
        # Test user features endpoint
        response = self.client.get('/api/v1/users/features/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('subscription_tier', response.data)
        self.assertIn('features', response.data)
    
    def test_meus_api_endpoints(self):
        """Test MEUS API endpoints."""
        # Test entity list endpoint
        response = self.client.get('/api/v1/meus/entity/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test dashboard endpoint
        response = self.client.get('/api/v1/meus/universe/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_numerology_services_importable(self):
        """Test that all numerology services can be imported."""
        from numerology.services import (
            EssenceCycleCalculator,
            CycleVisualizationService,
            UniversalCycleCalculator,
            LoShuGridService,
            AssetNumerologyService,
            RelationshipNumerologyService,
            TimingNumerologyService,
            HealthNumerologyService,
            NameCorrectionService,
            SpiritualNumerologyService,
            PredictiveNumerologyService,
            GenerationalAnalyzer,
            FengShuiHybridService,
            MentalStateAIService,
        )
        self.assertTrue(True)  # If we get here, imports worked
    
    def test_numerology_api_endpoints(self):
        """Test numerology API endpoints."""
        # Create a numerology profile first
        NumerologyProfile.objects.create(
            user=self.user,
            full_name='Test User',
            birth_date='1990-01-01',
            life_path_number=1,
            destiny_number=1,
            soul_urge_number=1,
            personality_number=1
        )
        
        # Test essence cycles
        response = self.client.get('/api/v1/numerology/essence-cycles/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        
        # Test universal cycles
        response = self.client.get('/api/v1/numerology/universal-cycles/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        
        # Test Lo Shu Grid
        response = self.client.get('/api/v1/numerology/lo-shu-grid/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
    
    def test_feature_flag_service(self):
        """Test FeatureFlagService functionality."""
        from feature_flags.services import FeatureFlagService
        
        # Create a test feature flag
        flag = FeatureFlag.objects.create(
            name='test_feature',
            display_name='Test Feature',
            category='core',
            default_tier='free',
            is_active=True
        )
        
        # Create tier access
        SubscriptionFeatureAccess.objects.create(
            feature_flag=flag,
            subscription_tier='free',
            is_enabled=True
        )
        
        # Test access check
        has_access = FeatureFlagService.can_access(self.user, 'test_feature')
        self.assertIsInstance(has_access, bool)
        
        # Test user features
        user_features = FeatureFlagService.get_user_features(self.user)
        self.assertIsInstance(user_features, dict)
    
    def test_meus_services_importable(self):
        """Test that MEUS services can be imported."""
        from meus.services import (
            CompatibilityEngine,
            InfluenceScoringService,
            CycleSynchronizationService,
            GraphGeneratorService,
            RecommendationEngine
        )
        self.assertTrue(True)  # If we get here, imports worked
    
    def test_url_configuration(self):
        """Test that all URLs are properly configured."""
        from django.urls import reverse, NoReverseMatch
        
        # Test feature flags URLs
        try:
            reverse('feature_flags:feature-flag-list')
            reverse('feature_flags:user-features')
        except NoReverseMatch:
            self.fail("Feature flags URLs not configured")
        
        # Test MEUS URLs
        try:
            reverse('meus:entity-list-create')
            reverse('meus:universe-dashboard')
        except NoReverseMatch:
            self.fail("MEUS URLs not configured")
        
        # Test numerology URLs
        try:
            reverse('numerology:essence-cycles')
            reverse('numerology:universal-cycles')
        except NoReverseMatch:
            self.fail("Numerology URLs not configured")


if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    if not settings.configured:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerai.settings.development')
        django.setup()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['integration_test'])
    
    if failures:
        sys.exit(1)

