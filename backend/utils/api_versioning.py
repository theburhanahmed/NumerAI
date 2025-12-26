"""
API versioning utilities for NumerAI.
"""
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from typing import Optional, Tuple
import re


class APIVersion:
    """API version representation."""
    
    def __init__(self, major: int, minor: int = 0, patch: int = 0):
        self.major = major
        self.minor = minor
        self.patch = patch
    
    @classmethod
    def from_string(cls, version_str: str) -> Optional['APIVersion']:
        """Parse version string (e.g., 'v1', 'v1.2', 'v1.2.3')."""
        match = re.match(r'v?(\d+)(?:\.(\d+))?(?:\.(\d+))?', version_str.lower())
        if not match:
            return None
        
        major = int(match.group(1))
        minor = int(match.group(2)) if match.group(2) else 0
        patch = int(match.group(3)) if match.group(3) else 0
        
        return cls(major, minor, patch)
    
    def __str__(self):
        return f"v{self.major}.{self.minor}.{self.patch}"
    
    def __eq__(self, other):
        if not isinstance(other, APIVersion):
            return False
        return (self.major, self.minor, self.patch) == (other.major, other.minor, other.patch)
    
    def __lt__(self, other):
        if not isinstance(other, APIVersion):
            return NotImplemented
        return (self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)
    
    def __le__(self, other):
        return self == other or self < other
    
    def __gt__(self, other):
        if not isinstance(other, APIVersion):
            return NotImplemented
        return (self.major, self.minor, self.patch) > (other.major, other.minor, other.patch)
    
    def __ge__(self, other):
        return self == other or self > other


class VersionNegotiationMixin:
    """Mixin for API version negotiation."""
    
    # Current API version
    CURRENT_VERSION = APIVersion(1, 0, 0)
    
    # Minimum supported version
    MIN_VERSION = APIVersion(1, 0, 0)
    
    # Deprecated versions (will be removed in future)
    DEPRECATED_VERSIONS = []
    
    # Versions that are no longer supported
    UNSUPPORTED_VERSIONS = []
    
    def get_api_version(self, request: Request) -> Optional[APIVersion]:
        """
        Extract API version from request.
        Checks headers, URL path, and query parameters.
        """
        # Check Accept header
        accept_header = request.META.get('HTTP_ACCEPT', '')
        version_match = re.search(r'version=([\d.]+)', accept_header)
        if version_match:
            version = APIVersion.from_string(version_match.group(1))
            if version:
                return version
        
        # Check custom header
        version_header = request.META.get('HTTP_X_API_VERSION')
        if version_header:
            version = APIVersion.from_string(version_header)
            if version:
                return version
        
        # Check URL path (e.g., /api/v1/...)
        path = request.path
        path_match = re.search(r'/v(\d+)(?:\.(\d+))?(?:\.(\d+))?/', path)
        if path_match:
            major = int(path_match.group(1))
            minor = int(path_match.group(2)) if path_match.group(2) else 0
            patch = int(path_match.group(3)) if path_match.group(3) else 0
            return APIVersion(major, minor, patch)
        
        # Check query parameter
        # Handle both DRF Request and Django WSGIRequest
        if hasattr(request, 'query_params'):
            version_param = request.query_params.get('version')
        else:
            version_param = request.GET.get('version')
        if version_param:
            version = APIVersion.from_string(version_param)
            if version:
                return version
        
        # Default to current version
        return self.CURRENT_VERSION
    
    def validate_version(self, version: APIVersion) -> Tuple[bool, Optional[str]]:
        """
        Validate if version is supported.
        Returns (is_valid, error_message).
        """
        if version in self.UNSUPPORTED_VERSIONS:
            return False, f"API version {version} is no longer supported. Please upgrade to {self.CURRENT_VERSION} or later."
        
        if version < self.MIN_VERSION:
            return False, f"API version {version} is too old. Minimum supported version is {self.MIN_VERSION}."
        
        if version > self.CURRENT_VERSION:
            return False, f"API version {version} is not yet available. Current version is {self.CURRENT_VERSION}."
        
        return True, None
    
    def get_version_response_headers(self, version: APIVersion) -> dict:
        """Get response headers for API version."""
        headers = {
            'X-API-Version': str(version),
            'X-API-Current-Version': str(self.CURRENT_VERSION),
        }
        
        if version in self.DEPRECATED_VERSIONS:
            headers['X-API-Deprecated'] = 'true'
            headers['X-API-Sunset-Date'] = '2025-12-31'  # Example sunset date
        
        return headers


def version_required(min_version: Optional[APIVersion] = None):
    """
    Decorator to require minimum API version for a view.
    
    Usage:
        @version_required(APIVersion(1, 2, 0))
        def my_view(request):
            ...
    """
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):
            if not isinstance(self, VersionNegotiationMixin):
                return func(self, request, *args, **kwargs)
            
            version = self.get_api_version(request)
            if not version:
                version = self.CURRENT_VERSION
            
            # Check minimum version requirement
            if min_version and version < min_version:
                return Response(
                    {
                        'error': f'This endpoint requires API version {min_version} or higher. Your version: {version}',
                        'required_version': str(min_version),
                        'current_version': str(version),
                    },
                    status=status.HTTP_426_UPGRADE_REQUIRED,
                    headers=self.get_version_response_headers(version)
                )
            
            # Validate version
            is_valid, error_message = self.validate_version(version)
            if not is_valid:
                return Response(
                    {'error': error_message},
                    status=status.HTTP_400_BAD_REQUEST,
                    headers=self.get_version_response_headers(version)
                )
            
            # Add version to request
            request.api_version = version
            
            # Call original function
            response = func(self, request, *args, **kwargs)
            
            # Add version headers to response
            if isinstance(response, Response):
                version_headers = self.get_version_response_headers(version)
                for key, value in version_headers.items():
                    response.headers[key] = value
            
            return response
        
        return wrapper
    return decorator

