"""
Notification preferences views.
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models_notification_prefs import NotificationPreference
from .serializers_notification_prefs import (
    NotificationPreferenceSerializer,
    UpdateNotificationPreferenceSerializer,
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_preferences(request):
    """
    Get user's notification preferences.
    
    GET /api/v1/notifications/preferences/
    """
    try:
        preferences = NotificationPreference.objects.filter(user=request.user)
        serializer = NotificationPreferenceSerializer(preferences, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting notification preferences: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve notification preferences'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_notification_preference(request):
    """
    Update a notification preference.
    
    PUT /api/v1/notifications/preferences/
    PATCH /api/v1/notifications/preferences/
    Body: {
        "notification_type": "daily_reading",
        "channel": "push",
        "enabled": true
    }
    """
    try:
        serializer = UpdateNotificationPreferenceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        notification_type = serializer.validated_data['notification_type']
        channel = serializer.validated_data['channel']
        enabled = serializer.validated_data['enabled']
        
        preference, created = NotificationPreference.objects.update_or_create(
            user=request.user,
            notification_type=notification_type,
            channel=channel,
            defaults={'enabled': enabled}
        )
        
        response_serializer = NotificationPreferenceSerializer(preference)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating notification preference: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to update notification preference'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_notification_preferences(request):
    """
    Bulk update notification preferences.
    
    POST /api/v1/notifications/preferences/bulk-update/
    Body: {
        "preferences": [
            {
                "notification_type": "daily_reading",
                "channel": "push",
                "enabled": true
            },
            ...
        ]
    }
    """
    try:
        preferences_data = request.data.get('preferences', [])
        
        if not isinstance(preferences_data, list):
            return Response(
                {'error': 'preferences must be an array'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_preferences = []
        for pref_data in preferences_data:
            serializer = UpdateNotificationPreferenceSerializer(data=pref_data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            notification_type = serializer.validated_data['notification_type']
            channel = serializer.validated_data['channel']
            enabled = serializer.validated_data['enabled']
            
            preference, _ = NotificationPreference.objects.update_or_create(
                user=request.user,
                notification_type=notification_type,
                channel=channel,
                defaults={'enabled': enabled}
            )
            updated_preferences.append(preference)
        
        response_serializer = NotificationPreferenceSerializer(updated_preferences, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error bulk updating notification preferences: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to update notification preferences'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

