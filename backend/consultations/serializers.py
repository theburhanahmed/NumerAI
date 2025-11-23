"""
Serializers for NumerAI consultations application.
"""
from rest_framework import serializers
from .models import Expert, Consultation, ConsultationReview


class ExpertSerializer(serializers.ModelSerializer):
    """Serializer for expert."""
    
    class Meta:
        model = Expert
        fields = [
            'id', 'name', 'email', 'specialty', 'experience_years',
            'rating', 'bio', 'profile_picture_url', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultation."""
    expert = ExpertSerializer(read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'expert', 'consultation_type', 'scheduled_at',
            'duration_minutes', 'status', 'notes', 'meeting_link',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConsultationBookingSerializer(serializers.Serializer):
    """Serializer for consultation booking."""
    expert_id = serializers.UUIDField()
    consultation_type = serializers.ChoiceField(choices=[
        ('video', 'Video Call'),
        ('chat', 'Chat'),
        ('phone', 'Phone Call'),
    ])
    scheduled_at = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField(default=30, min_value=15, max_value=120)


class ConsultationReviewSerializer(serializers.ModelSerializer):
    """Serializer for consultation review."""
    
    class Meta:
        model = ConsultationReview
        fields = [
            'id', 'consultation', 'rating', 'review_text',
            'is_anonymous', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']