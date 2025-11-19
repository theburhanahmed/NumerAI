"""
Utility functions for NumerAI core application.
"""
import random
import os
import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import firebase_admin
from firebase_admin import messaging

# Initialize Firebase Admin SDK if credentials exist
if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
    firebase_admin.initialize_app()

def generate_otp(length=6):
    """Generate a random OTP."""
    return ''.join(random.choices('0123456789', k=length))

def generate_secure_token(length=32):
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(length)

def send_otp_email(email, otp):
    """Send OTP via email."""
    subject = 'NumerAI - Your Verification Code'
    message = f"""
    Hello,
    
    Your verification code is: {otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    The NumerAI Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        return True
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
        return False

def send_password_reset_email(user, token):
    """Send password reset email with secure token."""
    # In a real application, you would use the actual frontend URL
    # For now, we'll use a placeholder that will be replaced with the actual frontend URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password/confirm/{token}"
    
    subject = 'NumerAI - Password Reset Request'
    message = f"""
    Hello {user.full_name},
    
    You have requested to reset your password. Click the link below to reset your password:
    
    {reset_url}
    
    This link will expire in 24 hours.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The NumerAI Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False

def send_push_notification(user, title, body, data=None):
    """
    Send push notification to user's devices.
    
    Args:
        user: User object
        title: Notification title
        body: Notification body
        data: Additional data payload
    """
    # Get active device tokens for the user
    from .models import DeviceToken
    device_tokens = DeviceToken.objects.filter(
        user=user,
        is_active=True
    ).values_list('fcm_token', flat=True)
    
    if not device_tokens:
        return False
    
    # Create notification message
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        tokens=list(device_tokens),
    )
    
    # Send notification
    try:
        response = messaging.send_multicast(message)
        # Deactivate tokens that failed
        if response.failure_count > 0:
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    token = device_tokens[idx]
                    DeviceToken.objects.filter(fcm_token=token).update(is_active=False)
        return True
    except Exception as e:
        print(f"Failed to send push notification: {e}")
        return False