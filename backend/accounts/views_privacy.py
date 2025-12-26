"""
Privacy settings views for GDPR compliance.
"""
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models_privacy import PrivacySettings
from .serializers_privacy import PrivacySettingsSerializer, UpdatePrivacySettingsSerializer
from .audit_log import log_audit_event
from utils.request_utils import get_client_ip

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_privacy_settings(request):
    """
    Get user's privacy settings.
    
    GET /api/v1/users/privacy-settings/
    """
    try:
        privacy_settings, created = PrivacySettings.objects.get_or_create(
            user=request.user,
            defaults={
                'gdpr_consent': False,
                'privacy_policy_accepted': False,
            }
        )
        serializer = PrivacySettingsSerializer(privacy_settings)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting privacy settings: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve privacy settings'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_privacy_settings(request):
    """
    Update user's privacy settings.
    
    PUT /api/v1/users/privacy-settings/
    PATCH /api/v1/users/privacy-settings/
    """
    try:
        privacy_settings, created = PrivacySettings.objects.get_or_create(
            user=request.user
        )
        
        serializer = UpdatePrivacySettingsSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields
        for field, value in serializer.validated_data.items():
            setattr(privacy_settings, field, value)
        
        privacy_settings.save()
        
        # Log privacy settings update
        log_audit_event(
            user=request.user,
            action='privacy_settings_update',
            resource_type='user',
            resource_id=str(request.user.id),
            details={'fields_updated': list(serializer.validated_data.keys())},
            ip_address=get_client_ip(request),
        )
        
        response_serializer = PrivacySettingsSerializer(privacy_settings)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error updating privacy settings: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to update privacy settings'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_privacy_policy(request):
    """
    Accept privacy policy (GDPR requirement).
    
    POST /api/v1/users/privacy-settings/accept-policy/
    Body: {
        "version": "1.0" (optional)
    }
    """
    try:
        privacy_settings, created = PrivacySettings.objects.get_or_create(
            user=request.user
        )
        
        version = request.data.get('version', '1.0')
        
        privacy_settings.privacy_policy_accepted = True
        privacy_settings.privacy_policy_version = version
        privacy_settings.privacy_policy_accepted_date = timezone.now()
        privacy_settings.gdpr_consent = True
        privacy_settings.gdpr_consent_date = timezone.now()
        privacy_settings.save()
        
        # Log consent
        log_audit_event(
            user=request.user,
            action='privacy_policy_accepted',
            resource_type='user',
            resource_id=str(request.user.id),
            details={'version': version},
            ip_address=get_client_ip(request),
        )
        
        return Response({
            'message': 'Privacy policy accepted',
            'version': version,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error accepting privacy policy: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to accept privacy policy'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

