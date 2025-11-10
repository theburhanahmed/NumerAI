"""
Utility functions for NumerAI core application.
"""
import random
import string
from django.core.mail import send_mail
from django.conf import settings


def generate_otp(length=6):
    """Generate a random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email, otp_code, is_password_reset=False):
    """Send OTP via email."""
    if is_password_reset:
        subject = 'NumerAI - Password Reset OTP'
        message = f'''
        Hello,
        
        Your password reset OTP is: {otp_code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        NumerAI Team
        '''
    else:
        subject = 'NumerAI - Verify Your Account'
        message = f'''
        Welcome to NumerAI!
        
        Your verification OTP is: {otp_code}
        
        This code will expire in 10 minutes.
        
        Best regards,
        NumerAI Team
        '''
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def send_welcome_email(email, full_name):
    """Send welcome email to new user."""
    subject = 'Welcome to NumerAI!'
    message = f'''
    Hello {full_name},
    
    Welcome to NumerAI! Your account has been successfully verified.
    
    You can now:
    - View your personalized numerology birth chart
    - Get daily numerology readings
    - Chat with our AI numerologist
    - And much more!
    
    Start exploring your numerology journey today.
    
    Best regards,
    NumerAI Team
    '''
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )