"""
Celery tasks for NumerAI core application.
"""
from celery import shared_task
from django.utils import timezone
from datetime import date
from .models import OTPCode, RefreshToken, User, DailyReading
from .numerology import NumerologyCalculator
from .reading_generator import DailyReadingGenerator
from .utils import send_push_notification
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_otps():
    """Clean up expired OTP codes."""
    expired_count = OTPCode.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()[0]
    
    logger.info(f'Deleted {expired_count} expired OTP codes')
    return f'Deleted {expired_count} expired OTP codes'


@shared_task
def cleanup_expired_tokens():
    """Clean up expired refresh tokens."""
    expired_count = RefreshToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()[0]
    
    logger.info(f'Deleted {expired_count} expired refresh tokens')
    return f'Deleted {expired_count} expired refresh tokens'


@shared_task
def generate_daily_readings():
    """
    Generate daily readings for all active users.
    Runs at 7:00 AM daily via Celery Beat.
    """
    today = date.today()
    calculator = NumerologyCalculator()
    generator = DailyReadingGenerator()
    
    # Get all active verified users with profiles
    users = User.objects.filter(
        is_active=True,
        is_verified=True,
        profile__date_of_birth__isnull=False
    ).select_related('profile')
    
    created_count = 0
    error_count = 0
    
    for user in users:
        try:
            # Check if reading already exists for today
            if DailyReading.objects.filter(user=user, reading_date=today).exists():
                continue
            
            # Calculate personal day number
            personal_day_number = calculator.calculate_personal_day_number(
                user.profile.date_of_birth,
                today
            )
            
            # Generate reading content
            reading_content = generator.generate_reading(personal_day_number)
            
            # Create daily reading
            DailyReading.objects.create(
                user=user,
                reading_date=today,
                personal_day_number=personal_day_number,
                **reading_content
            )
            
            created_count += 1
            logger.info(f'Created daily reading for user {user.id}')
            
        except Exception as e:
            error_count += 1
            logger.error(f'Error creating daily reading for user {user.id}: {str(e)}')
    
    result = f'Generated {created_count} daily readings, {error_count} errors'
    logger.info(result)
    return result


@shared_task
def send_daily_reading_notifications():
    """
    Send push notifications for daily readings.
    Runs after generate_daily_readings task.
    """
    today = date.today()
    sent_count = 0
    error_count = 0
    
    # Get users who have readings for today
    readings = DailyReading.objects.filter(reading_date=today).select_related('user')
    
    for reading in readings:
        try:
            user = reading.user
            # Send push notification
            success = send_push_notification(
                user=user,
                title="Your Daily Numerology Reading is Ready 🔮",
                body=f"Today is a {reading.personal_day_number} day. Tap to see your lucky number and guidance.",
                data={
                    "type": "daily_reading",
                    "reading_id": str(reading.id)
                }
            )
            
            if success:
                sent_count += 1
                logger.info(f'Sent daily reading notification to user {user.id}')
            else:
                error_count += 1
                logger.error(f'Failed to send daily reading notification to user {user.id}')
                
        except Exception as e:
            error_count += 1
            logger.error(f'Error sending daily reading notification to user {reading.user.id}: {str(e)}')
    
    result = f'Sent {sent_count} daily reading notifications, {error_count} errors'
    logger.info(result)
    return result