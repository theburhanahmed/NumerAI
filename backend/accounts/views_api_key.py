"""
API views for API key management.
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models_api_key import APIKey
from .serializers_api_key import APIKeySerializer, CreateAPIKeySerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_api_keys(request):
    """
    List all API keys for the authenticated user.
    
    GET /api/v1/users/api-keys/
    """
    keys = APIKey.objects.filter(user=request.user).order_by('-created_at')
    serializer = APIKeySerializer(keys, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_api_key(request):
    """
    Create a new API key for the authenticated user.
    
    POST /api/v1/users/api-keys/
    Body: {
        "name": "Mobile App Key",
        "expires_in_days": 365 (optional)
    }
    """
    serializer = CreateAPIKeySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    name = serializer.validated_data['name']
    expires_in_days = serializer.validated_data.get('expires_in_days')
    
    from django.utils import timezone
    from datetime import timedelta
    
    expires_at = None
    if expires_in_days:
        expires_at = timezone.now() + timedelta(days=expires_in_days)
    
    api_key = APIKey.objects.create(
        user=request.user,
        name=name,
        expires_at=expires_at,
    )
    
    # Return full key only on creation
    serializer = APIKeySerializer(api_key)
    response_data = serializer.data
    response_data['key'] = api_key.key  # Include full key only once
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def revoke_api_key(request, key_id):
    """
    Revoke (delete) an API key.
    
    DELETE /api/v1/users/api-keys/{key_id}/
    """
    try:
        api_key = APIKey.objects.get(id=key_id, user=request.user)
        api_key.delete()
        return Response(
            {'message': 'API key revoked successfully'},
            status=status.HTTP_200_OK
        )
    except APIKey.DoesNotExist:
        return Response(
            {'error': 'API key not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_api_key(request, key_id):
    """
    Deactivate an API key (can be reactivated later).
    
    POST /api/v1/users/api-keys/{key_id}/deactivate/
    """
    try:
        api_key = APIKey.objects.get(id=key_id, user=request.user)
        api_key.is_active = False
        api_key.save(update_fields=['is_active'])
        return Response(
            {'message': 'API key deactivated successfully'},
            status=status.HTTP_200_OK
        )
    except APIKey.DoesNotExist:
        return Response(
            {'error': 'API key not found'},
            status=status.HTTP_404_NOT_FOUND
        )

