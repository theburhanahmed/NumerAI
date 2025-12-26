"""
Django admin configuration for numerology models.
"""
from django.contrib import admin
from .models import NumerologyProfile, DailyReading, CompatibilityCheck, Remedy, RemedyTracking, Person, PersonNumerologyProfile


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
    
    list_display = ['user', 'remedy_type', 'title', 'created_at']
    list_filter = ['remedy_type', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'title']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Remedy Details', {'fields': ('remedy_type', 'title', 'description', 'recommendation')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RemedyTracking)
class RemedyTrackingAdmin(admin.ModelAdmin):
    """Admin interface for RemedyTracking model."""
    
    list_display = ['user', 'remedy', 'date', 'is_completed']
    list_filter = ['is_completed', 'date']
    search_fields = ['user__email', 'user__full_name', 'remedy__title']
    ordering = ['-date']
    
    fieldsets = (
        ('User & Remedy', {'fields': ('user', 'remedy')}),
        ('Tracking', {'fields': ('date', 'is_completed', 'notes')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    """Admin interface for Person model."""
    
    list_display = ['user', 'name', 'relationship', 'created_at']
    list_filter = ['relationship', 'created_at']
    search_fields = ['user__email', 'user__full_name', 'name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Person Details', {'fields': ('name', 'birth_date', 'relationship')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PersonNumerologyProfile)
class PersonNumerologyProfileAdmin(admin.ModelAdmin):
    """Admin interface for PersonNumerologyProfile model."""
    
    list_display = ['person', 'life_path_number', 'destiny_number', 'calculation_system', 'calculated_at']
    list_filter = ['calculation_system', 'life_path_number', 'destiny_number']
    search_fields = ['person__user__email', 'person__user__full_name', 'person__name']
    ordering = ['-calculated_at']
    
    fieldsets = (
        ('Person', {'fields': ('person',)}),
        ('Core Numbers', {'fields': ('life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number', 'attitude_number', 'maturity_number', 'balance_number')}),
        ('Cycles', {'fields': ('personal_year_number', 'personal_month_number')}),
        ('Metadata', {'fields': ('calculation_system', 'calculated_at', 'updated_at')}),
    )
    
    readonly_fields = ['calculated_at', 'updated_at']