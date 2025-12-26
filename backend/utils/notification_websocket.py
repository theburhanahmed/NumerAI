"""
Utility functions for sending notifications via WebSocket.
"""
from realtime.utils import send_notification_to_user
from accounts.models import Notification
import logging

logger = logging.getLogger(__name__)


def send_realtime_notification(user, notification_type, title, message, data=None):
    """
    Create a notification and send it via WebSocket in real-time.
    
    Args:
        user: User instance
        notification_type: Type of notification
        title: Notification title
        message: Notification message
        data: Additional data dictionary
    
    Returns:
        Notification instance
    """
    try:
        # Create notification in database
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {}
        )
        
        # Send via WebSocket
        send_notification_to_user(
            str(user.id),
            {
                'id': str(notification.id),
                'title': title,
                'message': message,
                'notification_type': notification_type,
                'is_read': False,
                'created_at': notification.created_at.isoformat(),
                'data': data or {}
            }
        )
        
        return notification
    except Exception as e:
        logger.error(f"Failed to send real-time notification: {str(e)}", exc_info=True)
        return None

