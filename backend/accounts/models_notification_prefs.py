"""
Notification preferences models.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationPreference(models.Model):
    """User notification preferences."""
    
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('success', 'Success'),
        ('error', 'Error'),
        ('report_ready', 'Report Ready'),
        ('daily_reading', 'Daily Reading'),
        ('compatibility_match', 'Compatibility Match'),
        ('consultation_reminder', 'Consultation Reminder'),
        ('new_message', 'New Message'),
        ('subscription', 'Subscription Updates'),
        ('payment', 'Payment Notifications'),
    ]
    
    CHANNEL_TYPES = [
        ('in_app', 'In-App'),
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('sms', 'SMS'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_preferences')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNEL_TYPES)
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
        unique_together = ['user', 'notification_type', 'channel']
        indexes = [
            models.Index(fields=['user', 'notification_type']),
            models.Index(fields=['user', 'enabled']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.notification_type} - {self.channel} ({'enabled' if self.enabled else 'disabled'})"

