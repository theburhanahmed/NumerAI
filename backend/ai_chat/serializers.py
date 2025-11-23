"""
Serializers for NumerAI ai_chat application.
"""
from rest_framework import serializers
from .models import AIConversation, AIMessage


class AIConversationSerializer(serializers.ModelSerializer):
    """Serializer for AI conversation."""
    
    class Meta:
        model = AIConversation
        fields = [
            'id', 'started_at', 'last_message_at', 'message_count', 'is_active'
        ]
        read_only_fields = ['id', 'started_at', 'last_message_at', 'message_count']


class AIMessageSerializer(serializers.ModelSerializer):
    """Serializer for AI message."""
    
    class Meta:
        model = AIMessage
        fields = [
            'id', 'conversation', 'role', 'content', 'tokens_used', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for chat message."""
    message = serializers.CharField(max_length=1000)