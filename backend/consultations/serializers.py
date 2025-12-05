"""
Serializers for NumerAI consultations application.
"""
from rest_framework import serializers
from .models import (
    Expert, Consultation, ConsultationReview, ExpertApplication,
    ExpertVerificationDocument, ExpertChatConversation, ExpertChatMessage,
    ExpertAvailability, ExpertUnavailability
)


class ExpertSerializer(serializers.ModelSerializer):
    """Serializer for expert."""
    is_verified = serializers.BooleanField(read_only=True)
    verification_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Expert
        fields = [
            'id', 'name', 'email', 'specialty', 'experience_years',
            'rating', 'bio', 'profile_picture_url', 'is_active',
            'verification_status', 'is_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified']


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultation."""
    expert = ExpertSerializer(read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)
    can_be_rescheduled = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'expert', 'consultation_type', 'scheduled_at',
            'duration_minutes', 'status', 'notes', 'meeting_link',
            'meeting_room_id', 'meeting_started_at', 'meeting_ended_at',
            'price', 'payment_status', 'cancellation_reason',
            'can_be_cancelled', 'can_be_rescheduled',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'can_be_cancelled', 'can_be_rescheduled'
        ]


class ConsultationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for consultation with full user and expert details."""
    expert = ExpertSerializer(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)
    can_be_rescheduled = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'expert', 'user_name', 'user_email', 'consultation_type',
            'scheduled_at', 'duration_minutes', 'status', 'notes',
            'meeting_link', 'meeting_room_id', 'meeting_started_at',
            'meeting_ended_at', 'price', 'payment_status',
            'cancellation_reason', 'can_be_cancelled', 'can_be_rescheduled',
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
    notes = serializers.CharField(required=False, allow_blank=True)


class ConsultationRescheduleSerializer(serializers.Serializer):
    """Serializer for rescheduling consultation."""
    scheduled_at = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField(required=False, min_value=15, max_value=120)


class ConsultationCancelSerializer(serializers.Serializer):
    """Serializer for cancelling consultation."""
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)


class ConsultationReviewSerializer(serializers.ModelSerializer):
    """Serializer for consultation review."""
    
    class Meta:
        model = ConsultationReview
        fields = [
            'id', 'consultation', 'rating', 'review_text',
            'is_anonymous', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ExpertApplicationSerializer(serializers.ModelSerializer):
    """Serializer for expert application."""
    
    class Meta:
        model = ExpertApplication
        fields = [
            'id', 'user', 'status', 'name', 'email', 'phone',
            'specialty', 'experience_years', 'bio', 'application_notes',
            'rejection_reason', 'reviewed_by', 'reviewed_at',
            'submitted_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'reviewed_by', 'reviewed_at',
            'submitted_at', 'updated_at', 'rejection_reason'
        ]


class ExpertVerificationDocumentSerializer(serializers.ModelSerializer):
    """Serializer for expert verification documents."""
    
    class Meta:
        model = ExpertVerificationDocument
        fields = [
            'id', 'expert', 'application', 'document_type',
            'document_name', 'description', 'file', 'file_size',
            'is_verified', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'is_verified']


class ExpertAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for expert availability."""
    
    class Meta:
        model = ExpertAvailability
        fields = [
            'id', 'expert', 'day_of_week', 'start_time', 'end_time',
            'timezone', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExpertChatConversationSerializer(serializers.ModelSerializer):
    """Serializer for expert chat conversation."""
    expert = ExpertSerializer(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = ExpertChatConversation
        fields = [
            'id', 'user', 'user_name', 'expert', 'consultation',
            'status', 'last_message_at', 'last_message_preview',
            'unread_count_user', 'unread_count_expert',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExpertChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for expert chat message."""
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ExpertChatMessage
        fields = [
            'id', 'conversation', 'sender_type', 'sender_user',
            'sender_name', 'message_content', 'message_type',
            'file_attachment', 'file_name', 'file_size',
            'is_read', 'read_at', 'is_edited', 'edited_at',
            'reply_to', 'created_at'
        ]
        read_only_fields = [
            'id', 'sender_name', 'is_read', 'read_at',
            'is_edited', 'edited_at', 'created_at'
        ]
    
    def get_sender_name(self, obj):
        """Get sender name."""
        if obj.sender_type == 'user' and obj.sender_user:
            return obj.sender_user.full_name
        elif obj.sender_type == 'expert' and obj.conversation.expert:
            return obj.conversation.expert.name
        return obj.sender_type


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending a chat message."""
    message_content = serializers.CharField()
    message_type = serializers.ChoiceField(
        choices=ExpertChatMessage.MESSAGE_TYPES,
        default='text'
    )
    reply_to = serializers.UUIDField(required=False, allow_null=True)
