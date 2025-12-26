"""
Custom authentication backends for NumerAI.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from accounts.models_api_key import APIKey
from django.contrib.auth import get_user_model

User = get_user_model()


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom authentication using API keys for mobile apps.
    """
    
    def authenticate(self, request):
        """Authenticate using API key from header."""
        api_key = request.META.get('HTTP_X_API_KEY') or request.META.get('HTTP_AUTHORIZATION')
        
        if not api_key:
            return None
        
        # Remove 'Bearer ' prefix if present
        if api_key.startswith('Bearer '):
            api_key = api_key[7:]
        elif api_key.startswith('ApiKey '):
            api_key = api_key[7:]
        
        try:
            key_obj = APIKey.objects.get(key=api_key, is_active=True)
            
            if not key_obj.is_valid():
                raise AuthenticationFailed('API key is expired or inactive')
            
            # Mark key as used
            key_obj.mark_used()
            
            return (key_obj.user, None)
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API key')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def authenticate_header(self, request):
        """Return header name for API key authentication."""
        return 'X-API-Key'

