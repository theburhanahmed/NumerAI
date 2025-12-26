"""
Internationalization utilities for backend API responses.
Supports multiple languages for error messages and user-facing content.
"""
from django.conf import settings
from django.utils import translation
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

# Supported languages
SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te']
DEFAULT_LANGUAGE = 'en'

def get_user_language(request):
    """
    Get the user's preferred language from request.
    Checks Accept-Language header, user preference, or defaults to 'en'.
    """
    # Check Accept-Language header
    accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    if accept_language:
        # Parse Accept-Language header (e.g., "en-US,en;q=0.9,hi;q=0.8")
        languages = []
        for lang_item in accept_language.split(','):
            lang = lang_item.split(';')[0].strip().lower()
            # Extract base language code (e.g., 'en' from 'en-US')
            base_lang = lang.split('-')[0]
            if base_lang in SUPPORTED_LANGUAGES:
                languages.append(base_lang)
        
        if languages:
            return languages[0]
    
    # Check user preference if authenticated
    if hasattr(request, 'user') and request.user.is_authenticated:
        # You can add a language preference field to User model
        # user_lang = getattr(request.user, 'preferred_language', None)
        # if user_lang and user_lang in SUPPORTED_LANGUAGES:
        #     return user_lang
        pass
    
    return DEFAULT_LANGUAGE

def activate_language(language_code):
    """Activate translation for a specific language."""
    if language_code in SUPPORTED_LANGUAGES:
        translation.activate(language_code)
    else:
        translation.activate(DEFAULT_LANGUAGE)

def get_translated_error(error_key, language='en', **kwargs):
    """
    Get translated error message.
    
    Args:
        error_key: Key for the error message
        language: Language code (default: 'en')
        **kwargs: Format arguments for the message
    
    Returns:
        Translated error message string
    """
    # Activate language
    old_language = translation.get_language()
    activate_language(language)
    
    try:
        # Error message mappings
        error_messages = {
            'invalid_credentials': _('Invalid email or password. Please try again.'),
            'email_exists': _('An account with this email already exists.'),
            'phone_exists': _('An account with this phone number already exists.'),
            'invalid_otp': _('Invalid OTP. Please check and try again.'),
            'otp_expired': _('OTP has expired. Please request a new one.'),
            'subscription_required': _('This feature requires an active subscription.'),
            'profile_not_found': _('Profile not found. Please contact support.'),
            'invalid_date': _('Invalid date format. Please use YYYY-MM-DD.'),
            'rate_limit_exceeded': _('Too many requests. Please try again later.'),
            'server_error': _('An error occurred. Please try again later.'),
        }
        
        message = error_messages.get(error_key, _('An error occurred.'))
        
        # Format message with kwargs if provided
        if kwargs:
            try:
                message = message.format(**kwargs)
            except (KeyError, ValueError):
                logger.warning(f"Failed to format error message: {error_key} with kwargs: {kwargs}")
        
        return str(message)
    finally:
        # Restore previous language
        translation.activate(old_language)

def get_translated_success(success_key, language='en', **kwargs):
    """
    Get translated success message.
    
    Args:
        success_key: Key for the success message
        language: Language code (default: 'en')
        **kwargs: Format arguments for the message
    
    Returns:
        Translated success message string
    """
    old_language = translation.get_language()
    activate_language(language)
    
    try:
        success_messages = {
            'registration_success': _('Registration successful. Please check your email for OTP.'),
            'login_success': _('Login successful.'),
            'profile_updated': _('Profile updated successfully.'),
            'subscription_created': _('Subscription created successfully.'),
            'report_generated': _('Report generated successfully.'),
        }
        
        message = success_messages.get(success_key, _('Operation successful.'))
        
        if kwargs:
            try:
                message = message.format(**kwargs)
            except (KeyError, ValueError):
                logger.warning(f"Failed to format success message: {success_key} with kwargs: {kwargs}")
        
        return str(message)
    finally:
        translation.activate(old_language)

