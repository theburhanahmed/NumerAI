"""
Middleware for tracking user activities.
"""
from django.utils.deprecation import MiddlewareMixin
from utils.activity_logger import log_page_view
import logging

logger = logging.getLogger(__name__)


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware to track user page views and activities.
    """
    
    # Pages that should be tracked
    TRACKED_PATHS = [
        '/dashboard',
        '/birth-chart',
        '/daily-reading',
        '/compatibility',
        '/remedies',
        '/ai-chat',
        '/reports',
        '/people',
        '/consultations',
    ]
    
    def process_request(self, request):
        """Process request and log activity if applicable."""
        if not request.user or not request.user.is_authenticated:
            return None
        
        path = request.path
        
        # Check if this is a tracked path
        for tracked_path in self.TRACKED_PATHS:
            if path.startswith(tracked_path):
                # Extract page name from path
                page_name = tracked_path.replace('/', '').replace('-', '_')
                if not page_name:
                    page_name = 'dashboard'
                
                # Log the activity
                try:
                    log_page_view(
                        request.user,
                        page_name,
                        metadata={
                            'path': path,
                            'method': request.method,
                        }
                    )
                except Exception as e:
                    logger.error(f'Failed to log page view: {str(e)}', exc_info=True)
                
                break
        
        return None

