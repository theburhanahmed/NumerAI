"""
Django admin configuration for consultations models.
"""
from django.contrib import admin
from django.utils import timezone
from .models import (
    Expert, Consultation, ConsultationReview, ExpertApplication,
    ExpertVerificationDocument, ExpertChatConversation, ExpertChatMessage,
    ExpertAvailability, ExpertUnavailability
)


@admin.register(Expert)
class ExpertAdmin(admin.ModelAdmin):
    """Admin interface for Expert model."""
    
    list_display = ['name', 'email', 'specialty', 'experience_years', 'verification_status', 'is_active', 'created_at']
    list_filter = ['specialty', 'is_active', 'verification_status', 'created_at']
    search_fields = ['name', 'email', 'bio']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'email', 'specialty', 'experience_years', 'user')}),
        ('Profile', {'fields': ('bio', 'profile_picture_url')}),
        ('Status', {'fields': ('is_active', 'rating', 'verification_status', 'verification_notes')}),
        ('Verification', {'fields': ('verification_submitted_at', 'verified_at')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['approve_verification', 'reject_verification']
    
    def approve_verification(self, request, queryset):
        """Approve expert verification."""
        count = queryset.update(
            verification_status='approved',
            verified_at=timezone.now()
        )
        self.message_user(request, f'{count} experts approved.')
    approve_verification.short_description = 'Approve selected experts'
    
    def reject_verification(self, request, queryset):
        """Reject expert verification."""
        count = queryset.update(verification_status='rejected')
        self.message_user(request, f'{count} experts rejected.')
    reject_verification.short_description = 'Reject selected experts'


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    """Admin interface for Consultation model."""
    
    list_display = ['user', 'expert', 'consultation_type', 'scheduled_at', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'consultation_type', 'payment_status', 'scheduled_at', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'expert__name', 'meeting_room_id']
    ordering = ['-scheduled_at']
    
    fieldsets = (
        ('Participants', {'fields': ('user', 'expert')}),
        ('Schedule', {'fields': ('consultation_type', 'scheduled_at', 'duration_minutes')}),
        ('Status', {'fields': ('status', 'notes', 'cancellation_reason')}),
        ('Meeting', {'fields': ('meeting_room_id', 'meeting_link', 'meeting_started_at', 'meeting_ended_at')}),
        ('Payment', {'fields': ('price', 'payment_status')}),
        ('Rescheduling', {'fields': ('rescheduled_from',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ConsultationReview)
class ConsultationReviewAdmin(admin.ModelAdmin):
    """Admin interface for ConsultationReview model."""
    
    list_display = ['get_user_email', 'get_expert_name', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['consultation__user__email', 'consultation__user__full_name', 'consultation__expert__name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Review', {'fields': ('consultation', 'rating', 'review_text', 'is_anonymous')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']
    
    @admin.display(description='User Email', ordering='consultation__user__email')
    def get_user_email(self, obj):
        return obj.consultation.user.email
    
    @admin.display(description='Expert Name', ordering='consultation__expert__name')
    def get_expert_name(self, obj):
        return obj.consultation.expert.name


@admin.register(ExpertApplication)
class ExpertApplicationAdmin(admin.ModelAdmin):
    """Admin interface for ExpertApplication model."""
    
    list_display = ['name', 'email', 'specialty', 'status', 'submitted_at', 'reviewed_at']
    list_filter = ['status', 'specialty', 'submitted_at']
    search_fields = ['name', 'email', 'user__email']
    ordering = ['-submitted_at']
    
    fieldsets = (
        ('Application Details', {'fields': ('user', 'name', 'email', 'phone', 'specialty', 'experience_years', 'bio', 'application_notes')}),
        ('Review', {'fields': ('status', 'rejection_reason', 'reviewed_by', 'reviewed_at')}),
        ('Timestamps', {'fields': ('submitted_at', 'updated_at')}),
    )
    
    readonly_fields = ['submitted_at', 'updated_at', 'reviewed_at']
    
    actions = ['approve_application', 'reject_application']
    
    def approve_application(self, request, queryset):
        """Approve applications."""
        from .views import admin_review_expert
        from django.http import HttpRequest
        
        count = 0
        for application in queryset.filter(status__in=['pending', 'under_review']):
            # Create a mock request object
            mock_request = type('Request', (), {'user': request.user, 'data': {'action': 'approve', 'notes': 'Bulk approved'}})()
            try:
                admin_review_expert(mock_request, application.id)
                count += 1
            except:
                pass
        self.message_user(request, f'{count} applications approved.')
    approve_application.short_description = 'Approve selected applications'
    
    def reject_application(self, request, queryset):
        """Reject applications."""
        count = queryset.filter(status__in=['pending', 'under_review']).update(
            status='rejected',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{count} applications rejected.')
    reject_application.short_description = 'Reject selected applications'


@admin.register(ExpertVerificationDocument)
class ExpertVerificationDocumentAdmin(admin.ModelAdmin):
    """Admin interface for ExpertVerificationDocument model."""
    
    list_display = ['document_name', 'document_type', 'expert', 'application', 'is_verified', 'uploaded_at']
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['document_name', 'expert__name', 'application__name']
    ordering = ['-uploaded_at']
    
    readonly_fields = ['uploaded_at']


@admin.register(ExpertChatConversation)
class ExpertChatConversationAdmin(admin.ModelAdmin):
    """Admin interface for ExpertChatConversation model."""
    
    list_display = ['user', 'expert', 'status', 'last_message_at', 'unread_count_user', 'unread_count_expert']
    list_filter = ['status', 'last_message_at']
    search_fields = ['user__email', 'expert__name']
    ordering = ['-last_message_at']
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ExpertChatMessage)
class ExpertChatMessageAdmin(admin.ModelAdmin):
    """Admin interface for ExpertChatMessage model."""
    
    list_display = ['conversation', 'sender_type', 'message_type', 'is_read', 'created_at']
    list_filter = ['sender_type', 'message_type', 'is_read', 'created_at']
    search_fields = ['message_content', 'conversation__user__email', 'conversation__expert__name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']


@admin.register(ExpertAvailability)
class ExpertAvailabilityAdmin(admin.ModelAdmin):
    """Admin interface for ExpertAvailability model."""
    
    list_display = ['expert', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available', 'expert']
    search_fields = ['expert__name']
    ordering = ['expert', 'day_of_week', 'start_time']


@admin.register(ExpertUnavailability)
class ExpertUnavailabilityAdmin(admin.ModelAdmin):
    """Admin interface for ExpertUnavailability model."""
    
    list_display = ['expert', 'start_date', 'end_date', 'reason']
    list_filter = ['start_date', 'end_date']
    search_fields = ['expert__name', 'reason']
    ordering = ['-start_date']
