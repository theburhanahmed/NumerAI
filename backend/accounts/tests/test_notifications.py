"""
Tests for the notification system.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Notification

User = get_user_model()


class NotificationModelTest(TestCase):
    """Test cases for the Notification model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create(
            email='test@example.com',
            full_name='Test User'
        )
        self.user.set_password('testpass123')
        self.user.save()
    
    def test_create_notification(self):
        """Test creating a notification."""
        notification = Notification.objects.create(
            user=self.user,
            title='Test Notification',
            message='This is a test notification',
            notification_type='info'
        )
        
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.title, 'Test Notification')
        self.assertEqual(notification.message, 'This is a test notification')
        self.assertEqual(notification.notification_type, 'info')
        self.assertFalse(notification.is_read)
        self.assertFalse(notification.is_sent)
        self.assertIsNotNone(notification.created_at)
    
    def test_mark_as_read(self):
        """Test marking a notification as read."""
        notification = Notification.objects.create(
            user=self.user,
            title='Test Notification',
            message='This is a test notification',
            notification_type='info'
        )
        
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)
        
        notification.mark_as_read()
        
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
    
    def test_mark_as_unread(self):
        """Test marking a notification as unread."""
        notification = Notification.objects.create(
            user=self.user,
            title='Test Notification',
            message='This is a test notification',
            notification_type='info'
        )
        
        # Mark as read first
        notification.mark_as_read()
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
        
        # Then mark as unread
        notification.mark_as_unread()
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)
    
    def test_notification_str_representation(self):
        """Test notification string representation."""
        notification = Notification.objects.create(
            user=self.user,
            title='Test Notification',
            message='This is a test notification',
            notification_type='info'
        )
        
        expected_str = f"Test Notification - {self.user}"
        self.assertEqual(str(notification), expected_str)