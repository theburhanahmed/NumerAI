"""
Custom exception handlers for NumerAI.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error responses."""
    request = context.get('request')
    
    # Get request ID if available
    request_id = getattr(request, 'id', None) if request else None
    
    # Log exception with proper context
    if request:
        logger.error(
            f'Exception in {context.get("view").__class__.__name__ if context.get("view") else "unknown"}: {type(exc).__name__}',
            extra={
                'exception_type': type(exc).__name__,
                'exception_message': str(exc),
                'view': context.get('view').__class__.__name__ if context.get('view') else 'unknown',
                'method': request.method if request else 'unknown',
                'path': request.path if request else 'unknown',
                'request_id': request_id,
            },
            exc_info=True
        )
    
    response = exception_handler(exc, context)
    
    # Ensure authentication errors return 401, not 400
    if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
        if response is None:
            response = Response(status=status.HTTP_401_UNAUTHORIZED)
        if response.status_code != status.HTTP_401_UNAUTHORIZED:
            response.status_code = status.HTTP_401_UNAUTHORIZED
    
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = custom_response_data
    
    return response