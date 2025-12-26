"""
Privacy settings models for GDPR compliance.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PrivacySettings(models.Model):
    """User privacy settings for GDPR compliance."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='privacy_settings')
    
    # Data sharing preferences
    share_analytics = models.BooleanField(default=True, help_text="Share anonymous usage analytics")
    share_marketing = models.BooleanField(default=False, help_text="Receive marketing emails")
    share_third_party = models.BooleanField(default=False, help_text="Share data with third-party services")
    
    # Visibility settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
            ('friends', 'Friends Only'),
        ],
        default='private',
    )
    
    # Data retention
    data_retention_consent = models.BooleanField(default=True, help_text="Consent to data retention")
    data_retention_period_days = models.IntegerField(default=365, help_text="Data retention period in days")
    
    # GDPR specific
    gdpr_consent = models.BooleanField(default=False, help_text="GDPR consent given")
    gdpr_consent_date = models.DateTimeField(null=True, blank=True)
    privacy_policy_accepted = models.BooleanField(default=False)
    privacy_policy_version = models.CharField(max_length=20, null=True, blank=True)
    privacy_policy_accepted_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'privacy_settings'
        verbose_name = 'Privacy Settings'
        verbose_name_plural = 'Privacy Settings'
    
    def __str__(self):
        return f"Privacy settings for {self.user}"

