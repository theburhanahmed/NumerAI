"""
Enhanced rate limiting utilities for NumerAI.
"""
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta


class PremiumUserRateThrottle(UserRateThrottle):
    """Rate throttle for premium users with higher limits."""
    
    def get_rate(self):
        user = self.scope.get('user')
        if user and hasattr(user, 'subscription_plan'):
            plan = user.subscription_plan
            if plan in ['premium', 'elite']:
                return '1000/hour'  # Higher limit for premium users
            elif plan == 'basic':
                return '500/hour'  # Medium limit for basic users
        return '300/hour'  # Default limit for free users


class EndpointRateThrottle(UserRateThrottle):
    """Rate throttle with per-endpoint limits."""
    
    def __init__(self, rate='100/hour', scope=None):
        self.rate = rate
        self.scope = scope or 'endpoint'
        super().__init__()
    
    def get_rate(self):
        return self.rate
    
    def get_cache_key(self, request, view):
        """Generate cache key based on user and endpoint."""
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        endpoint = f"{request.method}:{request.path}"
        return self.cache_format % {
            'scope': self.scope,
            'ident': f"{ident}:{endpoint}"
        }


class RateLimitHeadersMixin:
    """Mixin to add rate limit headers to responses."""
    
    def finalize_response(self, request, response, *args, **kwargs):
        """Add rate limit headers to response."""
        response = super().finalize_response(request, response, *args, **kwargs)
        
        if hasattr(self, 'throttle_classes') and self.throttle_classes:
            # Get throttle instance
            throttle_instance = None
            for throttle_class in self.throttle_classes:
                throttle_instance = throttle_class()
                break
            
            if throttle_instance:
                # Calculate remaining requests
                key = throttle_instance.get_cache_key(request, self)
                if key:
                    history = cache.get(key, [])
                    now = timezone.now()
                    
                    # Filter history to last hour
                    history = [h for h in history if h > now - timedelta(hours=1)]
                    
                    # Get rate limit
                    rate = throttle_instance.get_rate()
                    if '/' in rate:
                        num_requests, period = rate.split('/')
                        num_requests = int(num_requests)
                        
                        # Calculate remaining
                        remaining = max(0, num_requests - len(history))
                        
                        # Add headers
                        response['X-RateLimit-Limit'] = str(num_requests)
                        response['X-RateLimit-Remaining'] = str(remaining)
                        response['X-RateLimit-Reset'] = str(int((now + timedelta(hours=1)).timestamp()))
        
        return response

