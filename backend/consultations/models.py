"""
Consultation models for NumerAI application.
"""
import uuid
from django.db import models
from django.utils import timezone


class Expert(models.Model):
    """Numerology experts for consultations."""
    
    EXPERT_SPECIALTIES = [
        ('relationship', 'Relationship & Compatibility'),
        ('career', 'Career & Business'),
        ('spiritual', 'Spiritual Growth'),
        ('health', 'Health & Wellness'),
        ('general', 'General Numerology'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    specialty = models.CharField(max_length=20, choices=EXPERT_SPECIALTIES)
    experience_years = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    bio = models.TextField()
    profile_picture_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Verification fields
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending'
    )
    verification_submitted_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, help_text="Admin comments on verification")
    user = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='expert_profile',
        help_text="Linked user account if expert is a user"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'experts'
        verbose_name = 'Expert'
        verbose_name_plural = 'Experts'
        ordering = ['-rating', '-experience_years']
        indexes = [
            models.Index(fields=['specialty', 'is_active']),
            models.Index(fields=['rating']),
            models.Index(fields=['verification_status']),
        ]
    
    def __str__(self):
        return f"Expert {self.name} - {self.specialty}"
    
    @property
    def is_verified(self):
        """Check if expert is verified."""
        return self.verification_status == 'approved'


class Consultation(models.Model):
    """Consultation bookings with experts."""
    
    CONSULTATION_TYPES = [
        ('video', 'Video Call'),
        ('chat', 'Chat'),
        ('phone', 'Phone Call'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='consultations')
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='consultations')
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPES)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    meeting_link = models.URLField(max_length=500, null=True, blank=True)
    
    # Enhanced fields
    meeting_room_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    meeting_started_at = models.DateTimeField(null=True, blank=True)
    meeting_ended_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)
    rescheduled_from = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rescheduled_to'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'consultations'
        verbose_name = 'Consultation'
        verbose_name_plural = 'Consultations'
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['user', 'scheduled_at']),
            models.Index(fields=['expert', 'scheduled_at']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['meeting_room_id']),
        ]
    
    def __str__(self):
        return f"Consultation with {self.expert} for {self.user} on {self.scheduled_at}"
    
    def can_be_cancelled(self):
        """Check if consultation can be cancelled."""
        if self.status in ['cancelled', 'completed']:
            return False
        # Allow cancellation up to 24 hours before scheduled time
        if self.scheduled_at:
            time_until = self.scheduled_at - timezone.now()
            return time_until.total_seconds() > 86400  # 24 hours
        return True
    
    def can_be_rescheduled(self):
        """Check if consultation can be rescheduled."""
        if self.status in ['cancelled', 'completed']:
            return False
        # Allow rescheduling up to 12 hours before scheduled time
        if self.scheduled_at:
            time_until = self.scheduled_at - timezone.now()
            return time_until.total_seconds() > 43200  # 12 hours
        return True
    
    def generate_meeting_link(self):
        """Generate meeting link (to be implemented in services)."""
        # This will be implemented in JitsiService
        return self.meeting_link


class ConsultationReview(models.Model):
    """Reviews for completed consultations."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='review')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    review_text = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'consultation_reviews'
        verbose_name = 'Consultation Review'
        verbose_name_plural = 'Consultation Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['consultation']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Review for {self.consultation}"


class ExpertApplication(models.Model):
    """Expert application for becoming a verified expert."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'accounts.User', 
        on_delete=models.CASCADE, 
        related_name='expert_applications'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Application details
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    specialty = models.CharField(max_length=20, choices=Expert.EXPERT_SPECIALTIES)
    experience_years = models.IntegerField()
    bio = models.TextField()
    application_notes = models.TextField(blank=True, help_text="Why they want to be an expert")
    rejection_reason = models.TextField(blank=True, help_text="Reason for rejection if rejected")
    
    # Review information
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        limit_choices_to={'is_staff': True}
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expert_applications'
        verbose_name = 'Expert Application'
        verbose_name_plural = 'Expert Applications'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Application from {self.name} - {self.status}"


class ExpertVerificationDocument(models.Model):
    """Documents submitted for expert verification."""
    
    DOCUMENT_TYPES = [
        ('certificate', 'Certificate'),
        ('license', 'License'),
        ('education', 'Education'),
        ('experience', 'Experience'),
        ('id_proof', 'ID Proof'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expert = models.ForeignKey(
        Expert, 
        on_delete=models.CASCADE, 
        related_name='verification_documents',
        null=True,
        blank=True
    )
    application = models.ForeignKey(
        ExpertApplication,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='expert_verification/%Y/%m/')
    file_size = models.IntegerField(null=True, blank=True, help_text="File size in bytes")
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expert_verification_documents'
        verbose_name = 'Expert Verification Document'
        verbose_name_plural = 'Expert Verification Documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['expert', 'document_type']),
            models.Index(fields=['application']),
        ]
    
    def __str__(self):
        return f"{self.document_type} - {self.document_name}"


class ExpertChatConversation(models.Model):
    """Chat conversation between user and expert."""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('blocked', 'Blocked'),
        ('closed', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='expert_chats')
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='user_chats')
    consultation = models.ForeignKey(
        'Consultation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_conversation'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_message_preview = models.CharField(max_length=200, blank=True)
    unread_count_user = models.IntegerField(default=0)
    unread_count_expert = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expert_chat_conversations'
        verbose_name = 'Expert Chat Conversation'
        verbose_name_plural = 'Expert Chat Conversations'
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['user', 'expert', 'status']),
            models.Index(fields=['expert', 'status']),
            models.Index(fields=['user', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'expert'],
                condition=models.Q(status='active'),
                name='unique_active_conversation'
            )
        ]
    
    def __str__(self):
        return f"Chat: {self.user} <-> {self.expert}"


class ExpertChatMessage(models.Model):
    """Messages in expert chat conversations."""
    
    SENDER_TYPES = [
        ('user', 'User'),
        ('expert', 'Expert'),
        ('system', 'System'),
    ]
    
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        ExpertChatConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPES)
    sender_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='sent_chat_messages',
        null=True,
        blank=True
    )
    message_content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    file_attachment = models.FileField(upload_to='chat_files/%Y/%m/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expert_chat_messages'
        verbose_name = 'Expert Chat Message'
        verbose_name_plural = 'Expert Chat Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['conversation', 'is_read']),
            models.Index(fields=['sender_user', 'created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender_type} in {self.conversation}"


class ExpertAvailability(models.Model):
    """Expert availability schedule."""
    
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='availability_schedule')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, default='UTC')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expert_availability'
        verbose_name = 'Expert Availability'
        verbose_name_plural = 'Expert Availabilities'
        ordering = ['day_of_week', 'start_time']
        indexes = [
            models.Index(fields=['expert', 'day_of_week']),
            models.Index(fields=['expert', 'is_available']),
        ]
        unique_together = [['expert', 'day_of_week', 'start_time']]
    
    def __str__(self):
        return f"{self.expert.name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class ExpertUnavailability(models.Model):
    """Date-specific unavailability for experts."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='unavailability_periods')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expert_unavailability'
        verbose_name = 'Expert Unavailability'
        verbose_name_plural = 'Expert Unavailabilities'
        ordering = ['start_date']
        indexes = [
            models.Index(fields=['expert', 'start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.expert.name} unavailable {self.start_date} to {self.end_date}"