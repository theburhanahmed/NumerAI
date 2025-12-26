"""
Utilities for real-time features.
"""
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import logging

logger = logging.getLogger(__name__)


def send_notification_to_user(user_id, notification_data):
    """
    Send real-time notification to a user via WebSocket.
    
    Args:
        user_id: User ID (UUID string)
        notification_data: Notification data dictionary
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user_id}',
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )
    except Exception as e:
        logger.error(f"Failed to send notification via WebSocket: {str(e)}")


def send_chat_message(consultation_id, message_data):
    """
    Send chat message to consultation room via WebSocket.
    
    Args:
        consultation_id: Consultation ID (UUID string)
        message_data: Message data dictionary
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'chat_{consultation_id}',
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )
    except Exception as e:
        logger.error(f"Failed to send chat message via WebSocket: {str(e)}")


def broadcast_presence_update(user_id, user_name, is_online=True):
    """
    Broadcast user presence update.
    
    Args:
        user_id: User ID (UUID string)
        user_name: User's name
        is_online: True if user is online, False if offline
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            event_type = 'user_online' if is_online else 'user_offline'
            async_to_sync(channel_layer.group_send)(
                'presence',
                {
                    'type': event_type,
                    'user_id': str(user_id),
                    'user_name': user_name if is_online else None,
                }
            )
    except Exception as e:
        logger.error(f"Failed to broadcast presence update: {str(e)}")

