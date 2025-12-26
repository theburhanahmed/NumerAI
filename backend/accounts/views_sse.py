"""
Server-Sent Events (SSE) for real-time notifications.
"""
import json
import logging
from django.http import StreamingHttpResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .models_notification_prefs import NotificationPreference

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stream(request):
    """
    Server-Sent Events stream for real-time notifications.
    
    GET /api/v1/notifications/stream/
    """
    def event_stream():
        """Generator function for SSE events."""
        import time
        last_notification_id = None
        
        # Send initial connection message
        yield f"data: {json.dumps({'type': 'connected', 'message': 'Notification stream connected'})}\n\n"
        
        while True:
            try:
                # Get unread notifications
                notifications = Notification.objects.filter(
                    user=request.user,
                    is_read=False
                ).order_by('-created_at')[:10]
                
                # Check for new notifications
                if notifications.exists():
                    latest = notifications.first()
                    if latest.id != last_notification_id:
                        notification_data = {
                            'type': 'notification',
                            'id': str(latest.id),
                            'title': latest.title,
                            'message': latest.message,
                            'notification_type': latest.notification_type,
                            'created_at': latest.created_at.isoformat() if latest.created_at else None,
                        }
                        yield f"data: {json.dumps(notification_data)}\n\n"
                        last_notification_id = latest.id
                
                # Get unread count
                unread_count = Notification.objects.filter(
                    user=request.user,
                    is_read=False
                ).count()
                
                count_data = {
                    'type': 'unread_count',
                    'count': unread_count,
                }
                yield f"data: {json.dumps(count_data)}\n\n"
                
                # Keep connection alive
                yield f": keepalive\n\n"
                
                time.sleep(5)  # Poll every 5 seconds
                
            except Exception as e:
                logger.error(f"Error in notification stream: {str(e)}", exc_info=True)
                error_data = {
                    'type': 'error',
                    'message': 'Stream error occurred',
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                break
    
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable buffering in nginx
    return response

