"""
Custom middleware for NumerAI.
"""
from utils.api_versioning import APIVersion, VersionNegotiationMixin


class APIVersionMiddleware(VersionNegotiationMixin):
    """
    Middleware to handle API version negotiation.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Extract API version from request
        version = self.get_api_version(request)
        
        # Validate version
        is_valid, error_message = self.validate_version(version)
        if not is_valid and request.path.startswith('/api/'):
            from django.http import JsonResponse
            from rest_framework import status
            return JsonResponse(
                {'error': error_message},
                status=status.HTTP_400_BAD_REQUEST,
                headers=self.get_version_response_headers(version)
            )
        
        # Add version to request
        request.api_version = version
        
        # Process request
        response = self.get_response(request)
        
        # Add version headers to response
        if hasattr(request, 'api_version') and request.path.startswith('/api/'):
            version_headers = self.get_version_response_headers(request.api_version)
            for key, value in version_headers.items():
                response.headers[key] = value
        
        return response

