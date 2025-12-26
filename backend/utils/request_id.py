"""
Request ID middleware for tracking requests across the system.
"""
import uuid
from django.utils.deprecation import MiddlewareMixin


class RequestIDMiddleware(MiddlewareMixin):
    """
    Middleware to add a unique request ID to each request.
    """
    
    def process_request(self, request):
        """Add request ID to request."""
        request_id = request.META.get('HTTP_X_REQUEST_ID') or str(uuid.uuid4())
        request.id = request_id
        return None
    
    def process_response(self, request, response):
        """Add request ID to response headers."""
        if hasattr(request, 'id'):
            response['X-Request-ID'] = request.id
        return response

