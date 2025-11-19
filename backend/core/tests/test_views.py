"""
Unit tests for new API views.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, datetime
from core.models import (
    NumerologyProfile, CompatibilityCheck, Remedy, Expert, Consultation,
    Person, PersonNumerologyProfile, ReportTemplate, GeneratedReport
)

User = get_user_model()


class NewAPIViewTests(TestCase):
    """Test cases for new API views."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        self.user.is_verified = True
        self.user.save()
        
        # Create user profile with birth date
        self.user.profile.date_of_birth = date(1990, 5, 15)
        self.user.profile.save()
        
        # Create numerology profile
        self.numerology_profile = NumerologyProfile.objects.create(
            user=self.user,
            life_path_number=1,
            destiny_number=2,
            soul_urge_number=3,
            personality_number=4,
            attitude_number=5,
            maturity_number=6,
            balance_number=7,
            personal_year_number=8,
            personal_month_number=9
        )
        
        # Create test expert
        self.expert = Expert.objects.create(
            name='Test Expert',
            email='expert@example.com',
            specialty='general',
            experience_years=5,
            bio='Test expert bio'
        )
        
        self.client.force_authenticate(user=self.user)
        
        # Create test person
        self.person = Person.objects.create(
            user=self.user,
            name='Test Person',
            birth_date=date(1990, 5, 15),
            relationship='friend'
        )
        
        # Create person numerology profile
        self.person_profile = PersonNumerologyProfile.objects.create(
            person=self.person,
            life_path_number=1,
            destiny_number=2,
            soul_urge_number=3,
            personality_number=4,
            attitude_number=5,
            maturity_number=6,
            balance_number=7,
            personal_year_number=8,
            personal_month_number=9,
            calculation_system='pythagorean'
        )
        
        # Create test report template
        self.report_template = ReportTemplate.objects.create(
            name='Basic Birth Chart',
            description='A basic numerology birth chart report',
            report_type='basic',
            is_premium=False,
            is_active=True
        )
    
    def test_get_life_path_analysis(self):
        """Test getting life path analysis."""
        url = reverse('core:life-path-analysis')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('number', response.data)
        self.assertIn('title', response.data)
        self.assertIn('description', response.data)
    
    def test_get_life_path_analysis_without_profile(self):
        """Test getting life path analysis without numerology profile."""
        # Delete numerology profile
        self.numerology_profile.delete()
        
        url = reverse('core:life-path-analysis')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_check_compatibility(self):
        """Test compatibility check."""
        url = reverse('core:compatibility-check')
        data = {
            'partner_name': 'Test Partner',
            'partner_birth_date': '1995-03-20',
            'relationship_type': 'romantic'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('compatibility_score', response.data)
        self.assertEqual(response.data['partner_name'], 'Test Partner')
    
    def test_check_compatibility_invalid_data(self):
        """Test compatibility check with invalid data."""
        url = reverse('core:compatibility-check')
        data = {
            'partner_name': '',  # Missing required field
            'partner_birth_date': 'invalid-date'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_compatibility_history(self):
        """Test getting compatibility check history."""
        # Create a compatibility check
        CompatibilityCheck.objects.create(
            user=self.user,
            partner_name='Test Partner',
            partner_birth_date=date(1995, 3, 20),
            relationship_type='romantic',
            compatibility_score=85,
            strengths=['Good communication'],
            challenges=['Different approaches'],
            advice='Focus on understanding each other'
        )
        
        url = reverse('core:compatibility-history')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
    
    def test_get_personalized_remedies(self):
        """Test getting personalized remedies."""
        url = reverse('core:personalized-remedies')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsInstance(response.data, list)
        self.assertGreater(len(response.data), 0)
    
    def test_get_personalized_remedies_existing(self):
        """Test getting existing personalized remedies."""
        # Create a remedy
        Remedy.objects.create(
            user=self.user,
            remedy_type='gemstone',
            title='Test Remedy',
            description='Test description',
            recommendation='Test recommendation'
        )
        
        url = reverse('core:personalized-remedies')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
    
    def test_track_remedy(self):
        """Test tracking remedy practice."""
        # Create a remedy
        remedy = Remedy.objects.create(
            user=self.user,
            remedy_type='gemstone',
            title='Test Remedy',
            description='Test description',
            recommendation='Test recommendation'
        )
        
        url = reverse('core:track-remedy', kwargs={'remedy_id': remedy.id})
        data = {
            'date': '2025-11-17',
            'is_completed': True,
            'notes': 'Test notes'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertTrue(response.data['is_completed'])
    
    def test_get_experts(self):
        """Test getting list of experts."""
        url = reverse('core:experts')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Expert')
    
    def test_get_expert(self):
        """Test getting specific expert details."""
        url = reverse('core:expert-detail', kwargs={'expert_id': self.expert.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertEqual(response.data['name'], 'Test Expert')
    
    def test_get_expert_not_found(self):
        """Test getting non-existent expert."""
        url = reverse('core:expert-detail', kwargs={'expert_id': '00000000-0000-0000-0000-000000000000'})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_book_consultation(self):
        """Test booking a consultation."""
        url = reverse('core:book-consultation')
        data = {
            'expert': str(self.expert.id),
            'consultation_type': 'video',
            'scheduled_at': '2025-11-20T10:00:00',
            'duration_minutes': 30,
            'notes': 'Test consultation'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['status'], 'pending')
    
    def test_book_consultation_invalid_data(self):
        """Test booking a consultation with invalid data."""
        url = reverse('core:book-consultation')
        data = {
            'expert': '',  # Missing required field
            'consultation_type': 'video',
            'scheduled_at': 'invalid-date'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_upcoming_consultations(self):
        """Test getting upcoming consultations."""
        # Create a consultation
        Consultation.objects.create(
            user=self.user,
            expert=self.expert,
            consultation_type='video',
            scheduled_at=datetime(2025, 11, 20, 10, 0, 0),
            status='confirmed'
        )
        
        url = reverse('core:upcoming-consultations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_get_past_consultations(self):
        """Test getting past consultations."""
        # Create a past consultation
        Consultation.objects.create(
            user=self.user,
            expert=self.expert,
            consultation_type='video',
            scheduled_at=datetime(2020, 11, 20, 10, 0, 0),
            status='completed'
        )
        
        url = reverse('core:past-consultations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_get_full_numerology_report(self):
        """Test getting full numerology report."""
        url = reverse('core:full-numerology-report')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('full_name', response.data)
        self.assertIn('life_path_number', response.data)
        self.assertIn('destiny_number', response.data)
    
    def test_people_list_create_get(self):
        """Test getting list of people."""
        url = reverse('core:people-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)  # We created one person in setUp
        self.assertEqual(response.data[0]['name'], 'Test Person')
    
    def test_people_list_create_post(self):
        """Test creating a new person."""
        url = reverse('core:people-list-create')
        data = {
            'name': 'New Test Person',
            'birth_date': '1995-03-20',
            'relationship': 'colleague',
            'notes': 'Test notes'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['name'], 'New Test Person')
        self.assertEqual(response.data['relationship'], 'colleague')
    
    def test_people_list_create_post_duplicate(self):
        """Test creating a duplicate person."""
        url = reverse('core:people-list-create')
        data = {
            'name': 'Test Person',  # Same as existing person
            'birth_date': '1990-05-15',  # Same as existing person
            'relationship': 'friend'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_person_detail_get(self):
        """Test getting person details."""
        url = reverse('core:person-detail', kwargs={'person_id': self.person.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['name'], 'Test Person')
    
    def test_person_detail_get_not_found(self):
        """Test getting non-existent person."""
        url = reverse('core:person-detail', kwargs={'person_id': '00000000-0000-0000-0000-000000000000'})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_person_detail_put(self):
        """Test updating person details."""
        url = reverse('core:person-detail', kwargs={'person_id': self.person.id})
        data = {
            'name': 'Updated Test Person',
            'relationship': 'spouse'
        }
        response = self.client.put(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Test Person')
        self.assertEqual(response.data['relationship'], 'spouse')
    
    def test_person_detail_delete(self):
        """Test deleting a person."""
        url = reverse('core:person-detail', kwargs={'person_id': self.person.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify person is soft deleted
        self.person.refresh_from_db()
        self.assertFalse(self.person.is_active)
    
    def test_calculate_person_numerology(self):
        """Test calculating numerology for a person."""
        url = reverse('core:calculate-person-numerology', kwargs={'person_id': self.person.id})
        data = {
            'system': 'pythagorean'
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('profile', response.data)
        self.assertIn('life_path_number', response.data['profile'])
    
    def test_get_person_numerology_profile(self):
        """Test getting numerology profile for a person."""
        url = reverse('core:person-numerology-profile', kwargs={'person_id': self.person.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('life_path_number', response.data)
        self.assertEqual(response.data['life_path_number'], 1)
    
    def test_get_person_numerology_profile_not_found(self):
        """Test getting numerology profile for non-existent person."""
        url = reverse('core:person-numerology-profile', kwargs={'person_id': '00000000-0000-0000-0000-000000000000'})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_report_templates_list(self):
        """Test getting list of report templates."""
        url = reverse('core:report-templates-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Basic Birth Chart')
    
    def test_generate_report(self):
        """Test generating a report for a person."""
        url = reverse('core:generate-report')
        data = {
            'person_id': str(self.person.id),
            'template_id': str(self.report_template.id)
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('title', response.data)
        self.assertIn('content', response.data)
    
    def test_generate_report_missing_data(self):
        """Test generating a report with missing data."""
        url = reverse('core:generate-report')
        data = {
            'person_id': str(self.person.id)
            # Missing template_id
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_get_generated_reports(self):
        """Test getting list of generated reports."""
        # Create a generated report
        GeneratedReport.objects.create(
            user=self.user,
            person=self.person,
            template=self.report_template,
            title='Test Report',
            content={'test': 'content'}
        )
        
        url = reverse('core:get-generated-reports')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Report')
    
    def test_get_generated_report(self):
        """Test getting a specific generated report."""
        # Create a generated report
        report = GeneratedReport.objects.create(
            user=self.user,
            person=self.person,
            template=self.report_template,
            title='Test Report',
            content={'test': 'content'}
        )
        
        url = reverse('core:get-generated-report', kwargs={'report_id': report.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['title'], 'Test Report')
    
    def test_get_generated_report_not_found(self):
        """Test getting non-existent generated report."""
        url = reverse('core:get-generated-report', kwargs={'report_id': '00000000-0000-0000-0000-000000000000'})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_bulk_generate_reports(self):
        """Test bulk generating reports."""
        url = reverse('core:bulk-generate-reports')
        data = {
            'person_ids': [str(self.person.id)],
            'template_ids': [str(self.report_template.id)]
        }
        response = self.client.post(url, data, content_type='application/json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('reports', response.data)
        self.assertIn('errors', response.data)