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
    # #region agent log
    request = context.get('request')
    if request:
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'none')
        logger.error(f'exception_handler_called', extra={
            'exception_type': type(exc).__name__,
            'exception_message': str(exc),
            'auth_header_present': bool(auth_header and auth_header != 'none'),
            'auth_header_prefix': auth_header[:20] if auth_header != 'none' else 'none',
            'view': context.get('view').__class__.__name__ if context.get('view') else 'unknown',
            'method': request.method if request else 'unknown'
        })
    # #endregion
    
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