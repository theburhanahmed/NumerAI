"""
Query monitoring utilities for performance tracking.
"""
import logging
from django.db import connection
from django.conf import settings

logger = logging.getLogger(__name__)


class QueryCountMiddleware:
    """
    Middleware to log slow queries and query counts.
    Only active in development or when explicitly enabled.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Reset query count
        initial_queries = len(connection.queries)
        
        response = self.get_response(request)
        
        # Count queries
        query_count = len(connection.queries) - initial_queries
        
        # Log if query count is high (potential N+1 issue)
        if query_count > 20 and settings.DEBUG:
            logger.warning(
                f"High query count detected: {query_count} queries for {request.path}",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'query_count': query_count,
                }
            )
        
        # Log slow queries
        if settings.DEBUG:
            for query in connection.queries[initial_queries:]:
                duration = float(query.get('time', 0))
                if duration > 0.1:  # Log queries taking more than 100ms
                    logger.warning(
                        f"Slow query detected: {duration}s",
                        extra={
                            'path': request.path,
                            'query': query.get('sql', '')[:200],  # Truncate for logging
                            'duration': duration,
                        }
                    )
        
        return response


def get_query_count():
    """Get current query count for the request."""
    return len(connection.queries)

