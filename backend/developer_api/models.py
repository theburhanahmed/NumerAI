"""
Developer API models for API key management.
"""
import uuid
import secrets
from django.db import models


class APIKey(models.Model):
    """API keys for developers."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='developer_api_keys')
    key_name = models.CharField(max_length=200)
    api_key = models.CharField(max_length=64, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    rate_limit = models.IntegerField(default=100)  # Requests per hour
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'developer_api_keys'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.key_name} for {self.user}"
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)


class APIUsage(models.Model):
    """Track API usage."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE, related_name='usage_records')
    endpoint = models.CharField(max_length=200)
    method = models.CharField(max_length=10)
    response_status = models.IntegerField()
    response_time_ms = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'api_usage'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['api_key', 'created_at']),
            models.Index(fields=['endpoint', 'created_at']),
        ]
