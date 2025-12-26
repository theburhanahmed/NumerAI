"""
API Key model for mobile app authentication.
"""
import uuid
import secrets
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()


class APIKey(models.Model):
    """API key for mobile app authentication."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100, help_text="Name/description for this API key")
    key = models.CharField(max_length=64, unique=True, db_index=True, editable=False)
    key_prefix = models.CharField(max_length=8, editable=False, help_text="First 8 chars of key for display")
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'api_keys'
        verbose_name = 'API Key'
        verbose_name_plural = 'API Keys'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['key']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.key_prefix}... ({self.user})"
    
    @classmethod
    def generate_key(cls):
        """Generate a new API key."""
        key = f"napi_{secrets.token_urlsafe(32)}"
        return key, key[:8]
    
    def save(self, *args, **kwargs):
        """Generate key on first save."""
        if not self.key:
            self.key, self.key_prefix = self.generate_key()
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """Check if API key is valid."""
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True
    
    def mark_used(self):
        """Mark API key as used."""
        self.last_used = timezone.now()
        self.save(update_fields=['last_used'])

