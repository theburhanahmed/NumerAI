"""
Security middleware for adding security headers to responses.
"""
from django.utils.deprecation import MiddlewareMixin


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses.
    """
    
    def process_response(self, request, response):
        """Add security headers to response."""
        # Content Security Policy
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.stripe.com https://*.stripe.com; "
            "frame-src https://js.stripe.com https://hooks.stripe.com; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'self'; "
            "upgrade-insecure-requests;"
        )
        
        # X-Content-Type-Options
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options
        response['X-Frame-Options'] = 'SAMEORIGIN'
        
        # Referrer-Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions-Policy (formerly Feature-Policy)
        response['Permissions-Policy'] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(self 'https://js.stripe.com'), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=()"
        )
        
        # X-XSS-Protection (legacy but still useful)
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Strict-Transport-Security (HSTS) - only for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )
        
        return response

