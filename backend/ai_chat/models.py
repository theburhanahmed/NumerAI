"""
AI Chat models for NumerAI application.
"""
import uuid
from django.db import models


class AIConversation(models.Model):
    """AI conversation between user and AI numerologist."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='ai_conversations')
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    message_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'ai_conversations'
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"AI Conversation with {self.user} started at {self.started_at}"


class AIMessage(models.Model):
    """Individual message in an AI conversation."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_messages'
        verbose_name = 'AI Message'
        verbose_name_plural = 'AI Messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role.title()} message in {self.conversation}"