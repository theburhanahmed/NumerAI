"""
Utility functions for notifications in NumerAI.
"""
import os
import firebase_admin
from firebase_admin import messaging
from django.conf import settings
from django.utils import timezone
from accounts.models import DeviceToken, Notification


# Initialize Firebase Admin SDK if credentials exist
if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
    firebase_admin.initialize_app()


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


def create_notification(user, title, message, notification_type='info', data=None, send_push=True):
    """
    Create an in-app notification and optionally send push notification.
    
    Args:
        user: User object
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        data: Additional data for deep linking
        send_push: Whether to send push notification
    """
    # Create in-app notification
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        data=data or {}
    )
    
    # Send push notification if requested
    if send_push:
        send_push_notification(user, title, message, data)
        notification.is_sent = True
        notification.save()
    
    return notification


def send_report_ready_notification(user, report_title, report_id):
    """Send notification when a report is ready."""
    data = {
        'type': 'report_ready',
        'report_id': str(report_id),
        'action': 'view_report'
    }
    
    return create_notification(
        user=user,
        title="Report Ready",
        message=f"Your {report_title} is ready to view!",
        notification_type='report_ready',
        data=data
    )


def send_daily_reading_notification(user, reading_date):
    """Send notification for daily reading."""
    data = {
        'type': 'daily_reading',
        'date': str(reading_date),
        'action': 'view_reading'
    }
    
    return create_notification(
        user=user,
        title="Daily Reading Available",
        message=f"Your numerology reading for today is ready!",
        notification_type='daily_reading',
        data=data
    )


def send_consultation_reminder(user, consultation_title, consultation_time):
    """Send reminder for upcoming consultation."""
    data = {
        'type': 'consultation_reminder',
        'action': 'view_consultation'
    }
    
    return create_notification(
        user=user,
        title="Consultation Reminder",
        message=f"Reminder: Your consultation '{consultation_title}' is scheduled for {consultation_time}",
        notification_type='consultation_reminder',
        data=data
    )