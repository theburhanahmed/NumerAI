"""
Utility functions for numerology application.
"""
import random
import string
from django.core.mail import send_mail
from django.conf import settings
from accounts.email_service import send_templated_email


def generate_otp(length=6):
    """Generate a random OTP."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email, otp):
    """Send OTP to user's email using email template."""
    try:
        # Try to use email template first
        context = {
            'otp': otp,
            'email': email,
            'app_name': 'NumerAI',
        }
        
        success = send_templated_email(
            template_type='otp',
            recipient=email,
            context=context,
            fail_silently=True  # Fallback to plain email if template not found
        )
        
        if success:
            return True
        
        # Fallback to plain email if template not found
        send_mail(
            subject='NumerAI - OTP Verification',
            message=f'Your OTP for account verification is: {otp}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception:
        return False


def generate_secure_token(length=32):
    """Generate a secure random token."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))