"""
Django admin configuration for core models.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken


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