"""
Django admin configuration for core models.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, UserProfile, NumerologyProfile, DailyReading, AIConversation, AIMessage,
    OTPCode, RefreshToken, DeviceToken, CompatibilityCheck, Remedy, RemedyTracking,
    Expert, Consultation, ConsultationReview, Person, PersonNumerologyProfile,
    ReportTemplate, GeneratedReport
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = ['email', 'phone', 'full_name', 'is_verified', 'is_premium', 'is_active', 'created_at']
    list_filter = ['is_verified', 'is_premium', 'is_active', 'subscription_plan', 'created_at']
    search_fields = ['email', 'phone', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'phone', 'password')}),
        ('Personal Info', {'fields': ('full_name',)}),
        ('Status', {'fields': ('is_active', 'is_verified', 'is_premium', 'subscription_plan', 'premium_expiry')}),
        ('Security', {'fields': ('failed_login_attempts', 'locked_until', 'last_login')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone', 'full_name', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model."""
    
    list_display = ['user', 'date_of_birth', 'gender', 'timezone', 'profile_completed_at']
    list_filter = ['gender', 'timezone', 'profile_completed_at']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Personal Information', {'fields': ('date_of_birth', 'gender', 'timezone', 'location')}),
        ('Profile', {'fields': ('profile_picture_url', 'bio')}),
        ('Completion', {'fields': ('profile_completed_at',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['profile_completed_at', 'created_at', 'updated_at']


@admin.register(NumerologyProfile)
class NumerologyProfileAdmin(admin.ModelAdmin):
    """Admin interface for NumerologyProfile model."""
    
    list_display = ['user', 'life_path_number', 'destiny_number', 'calculation_system', 'updated_at']
    list_filter = ['calculation_system', 'life_path_number', 'destiny_number']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Core Numbers', {'fields': ('life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number', 'attitude_number', 'maturity_number', 'balance_number')}),
        ('Cycles', {'fields': ('personal_year_number', 'personal_month_number')}),
        ('Enhanced Numbers', {'fields': ('karmic_debt_number', 'hidden_passion_number', 'subconscious_self_number')}),
        ('Metadata', {'fields': ('calculation_system', 'calculated_at', 'updated_at')}),
    )
    
    readonly_fields = ['calculated_at', 'updated_at']


@admin.register(DailyReading)
class DailyReadingAdmin(admin.ModelAdmin):
    """Admin interface for DailyReading model."""
    
    list_display = ['user', 'reading_date', 'personal_day_number', 'lucky_number']
    list_filter = ['reading_date', 'personal_day_number']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['-reading_date']
    
    fieldsets = (
        ('User & Date', {'fields': ('user', 'reading_date')}),
        ('Numbers', {'fields': ('personal_day_number', 'lucky_number')}),
        ('Content', {'fields': ('lucky_color', 'auspicious_time', 'activity_recommendation', 'warning', 'affirmation', 'actionable_tip')}),
        ('Metadata', {'fields': ('generated_at',)}),
    )
    
    readonly_fields = ['generated_at']


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    """Admin interface for AIConversation model."""
    
    list_display = ['user', 'started_at', 'message_count', 'is_active']
    list_filter = ['is_active', 'started_at']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['-started_at']
    
    readonly_fields = ['started_at', 'last_message_at']


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    """Admin interface for AIMessage model."""
    
    list_display = ['conversation', 'role', 'created_at', 'tokens_used']
    list_filter = ['role', 'created_at']
    search_fields = ['content']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    """Admin interface for OTPCode model."""
    
    list_display = ['user', 'code', 'type', 'is_used', 'attempts', 'expires_at', 'created_at']
    list_filter = ['type', 'is_used', 'created_at']
    search_fields = ['user__email', 'user__phone', 'code']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('OTP Details', {'fields': ('code', 'type', 'attempts', 'is_used')}),
        ('Expiration', {'fields': ('expires_at',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin interface for RefreshToken model."""
    
    list_display = ['user', 'is_blacklisted', 'expires_at', 'created_at']
    list_filter = ['is_blacklisted', 'created_at']
    search_fields = ['user__email', 'token']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Token', {'fields': ('token', 'is_blacklisted')}),
        ('Expiration', {'fields': ('expires_at',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    """Admin interface for DeviceToken model."""
    
    list_display = ['user', 'device_type', 'device_name', 'is_active', 'registered_at']
    list_filter = ['device_type', 'is_active', 'registered_at']
    search_fields = ['user__email', 'device_name', 'fcm_token']
    ordering = ['-registered_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Device', {'fields': ('fcm_token', 'device_type', 'device_name', 'is_active')}),
        ('Timestamps', {'fields': ('registered_at', 'last_used')}),
    )
    
    readonly_fields = ['registered_at', 'last_used']


@admin.register(CompatibilityCheck)
class CompatibilityCheckAdmin(admin.ModelAdmin):
    """Admin interface for CompatibilityCheck model."""
    
    list_display = ['user', 'partner_name', 'relationship_type', 'compatibility_score', 'created_at']
    list_filter = ['relationship_type', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'partner_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Partner Information', {'fields': ('partner_name', 'partner_birth_date', 'relationship_type')}),
        ('Compatibility Results', {'fields': ('compatibility_score', 'strengths', 'challenges', 'advice')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(Remedy)
class RemedyAdmin(admin.ModelAdmin):
    """Admin interface for Remedy model."""
    
    list_display = ['user', 'remedy_type', 'title', 'is_active', 'created_at']
    list_filter = ['remedy_type', 'is_active', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'title']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Remedy Details', {'fields': ('remedy_type', 'title', 'description', 'recommendation', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RemedyTracking)
class RemedyTrackingAdmin(admin.ModelAdmin):
    """Admin interface for RemedyTracking model."""
    
    list_display = ['user', 'remedy', 'date', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'date', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'remedy__title']
    ordering = ['-date']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Remedy Tracking', {'fields': ('remedy', 'date', 'is_completed', 'notes')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(Expert)
class ExpertAdmin(admin.ModelAdmin):
    """Admin interface for Expert model."""
    
    list_display = ['name', 'email', 'specialty', 'experience_years', 'rating', 'is_active', 'created_at']
    list_filter = ['specialty', 'is_active', 'created_at']
    search_fields = ['name', 'email']
    ordering = ['-rating', '-experience_years']
    
    fieldsets = (
        ('Expert Information', {'fields': ('name', 'email', 'specialty', 'experience_years', 'rating', 'bio', 'profile_picture_url', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    """Admin interface for Consultation model."""
    
    list_display = ['user', 'expert', 'consultation_type', 'scheduled_at', 'status', 'created_at']
    list_filter = ['consultation_type', 'status', 'scheduled_at']
    search_fields = ['user__email', 'user__full_name', 'expert__name']
    ordering = ['-scheduled_at']
    
    fieldsets = (
        ('Participants', {'fields': ('user', 'expert')}),
        ('Consultation Details', {'fields': ('consultation_type', 'scheduled_at', 'duration_minutes', 'status', 'notes', 'meeting_link')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ConsultationReview)
class ConsultationReviewAdmin(admin.ModelAdmin):
    """Admin interface for ConsultationReview model."""
    
    list_display = ['consultation', 'rating', 'is_anonymous', 'created_at']
    list_filter = ['rating', 'is_anonymous', 'created_at']
    search_fields = ['consultation__user__email', 'consultation__expert__name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Consultation', {'fields': ('consultation',)}),
        ('Review Details', {'fields': ('rating', 'review_text', 'is_anonymous')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    """Admin interface for Person model."""
    
    list_display = ['name', 'user', 'relationship', 'birth_date', 'is_active', 'created_at']
    list_filter = ['relationship', 'is_active', 'created_at']
    search_fields = ['name', 'user__email', 'user__full_name']
    ordering = ['name']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Person Details', {'fields': ('name', 'birth_date', 'relationship', 'notes', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PersonNumerologyProfile)
class PersonNumerologyProfileAdmin(admin.ModelAdmin):
    """Admin interface for PersonNumerologyProfile model."""
    
    list_display = ['person', 'life_path_number', 'destiny_number', 'calculation_system', 'updated_at']
    list_filter = ['calculation_system', 'life_path_number', 'destiny_number']
    search_fields = ['person__name', 'person__user__email']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('Person', {'fields': ('person',)}),
        ('Core Numbers', {'fields': ('life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number', 'attitude_number', 'maturity_number', 'balance_number')}),
        ('Cycles', {'fields': ('personal_year_number', 'personal_month_number')}),
        ('Metadata', {'fields': ('calculation_system', 'calculated_at', 'updated_at')}),
    )
    
    readonly_fields = ['calculated_at', 'updated_at']


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    """Admin interface for ReportTemplate model."""
    
    list_display = ['name', 'report_type', 'is_premium', 'is_active', 'created_at']
    list_filter = ['report_type', 'is_premium', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Template Details', {'fields': ('name', 'description', 'report_type')}),
        ('Settings', {'fields': ('is_premium', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    """Admin interface for GeneratedReport model."""
    
    list_display = ['title', 'user', 'person', 'template', 'generated_at', 'expires_at']
    list_filter = ['template__report_type', 'generated_at']
    search_fields = ['title', 'user__email', 'person__name']
    ordering = ['-generated_at']
    
    fieldsets = (
        ('Context', {'fields': ('user', 'person', 'template')}),
        ('Report Content', {'fields': ('title', 'content')}),
        ('Metadata', {'fields': ('generated_at', 'expires_at')}),
    )
    
    readonly_fields = ['generated_at']
