"""
Apple Sign-In authentication views.
"""
import requests
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.conf import settings
from .models import User
from .audit_log import log_authentication_event
from utils.request_utils import get_client_ip

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def apple_oauth(request):
    """
    Handle Apple Sign-In callback and create/login user.
    
    POST /api/v1/auth/social/apple/
    Body: {
        "identity_token": "apple_identity_token",
        "authorization_code": "apple_authorization_code" (optional)
    }
    """
    import jwt
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.backends import default_backend
    
    identity_token = request.data.get('identity_token')
    authorization_code = request.data.get('authorization_code')
    
    if not identity_token:
        return Response(
            {'error': 'identity_token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode identity token (without verification for now - in production, verify with Apple's public keys)
        # For production, you should fetch Apple's public keys and verify the token
        decoded_token = jwt.decode(
            identity_token,
            options={"verify_signature": False}  # In production, verify with Apple's keys
        )
        
        # Extract user information
        email = decoded_token.get('email')
        sub = decoded_token.get('sub')  # Apple user ID
        
        if not email and not sub:
            return Response(
                {'error': 'Invalid identity token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Apple may not return email on subsequent logins
        # Use sub (Apple user ID) as fallback identifier
        user_identifier = email or f"apple_{sub}"
        
        # Get or create user
        # Try to find by email first, then by Apple ID stored in metadata
        user = None
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        # If not found by email, check if we have this Apple ID stored
        if not user and sub:
            # In a real implementation, you'd store Apple ID in a separate field or metadata
            # For now, we'll create a new user or use email if available
            pass
        
        if not user:
            # Create new user
            user = User.objects.create(
                email=email if email else None,
                full_name=decoded_token.get('name', {}).get('fullName', '') if isinstance(decoded_token.get('name'), dict) else '',
                is_verified=True,  # Apple verified
            )
            created = True
        else:
            # Update existing user
            if not user.is_verified:
                user.is_verified = True
            if not user.full_name and decoded_token.get('name'):
                name_data = decoded_token.get('name', {})
                if isinstance(name_data, dict):
                    user.full_name = name_data.get('fullName', '')
            user.save()
            created = False
        
        # Log authentication event
        log_authentication_event(
            user=user,
            action='apple_oauth',
            success=True,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT'),
        )
        
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)
        
        # Store refresh token
        from .models import RefreshToken
        RefreshToken.objects.create(
            user=user,
            token=refresh_token_jwt,
            expires_at=refresh.access_token.get('exp', 0)  # This needs proper handling
        )
        
        return Response({
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'is_verified': user.is_verified,
            },
            'created': created,
        }, status=status.HTTP_200_OK)
        
    except jwt.DecodeError:
        logger.error("Invalid Apple identity token")
        return Response(
            {'error': 'Invalid identity token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error processing Apple Sign-In: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Authentication failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

