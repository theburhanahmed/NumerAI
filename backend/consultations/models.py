"""
Consultation models for NumerAI application.
"""
import uuid
from django.db import models


class Expert(models.Model):
    """Numerology experts for consultations."""
    
    EXPERT_SPECIALTIES = [
        ('relationship', 'Relationship & Compatibility'),
        ('career', 'Career & Business'),
        ('spiritual', 'Spiritual Growth'),
        ('health', 'Health & Wellness'),
        ('general', 'General Numerology'),
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
        ]
    
    def __str__(self):
        return f"Expert {self.name} - {self.specialty}"


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
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='consultations')
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='consultations')
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPES)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    meeting_link = models.URLField(max_length=500, null=True, blank=True)
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
        ]
    
    def __str__(self):
        return f"Consultation with {self.expert} for {self.user} on {self.scheduled_at}"


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