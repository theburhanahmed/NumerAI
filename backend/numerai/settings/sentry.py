"""
Sentry configuration for error tracking and performance monitoring.
"""
import os
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from decouple import config


def init_sentry():
    """Initialize Sentry SDK."""
    sentry_dsn = config('SENTRY_DSN', default=None)
    
    if not sentry_dsn:
        return
    
    environment = config('ENVIRONMENT', default='development')
    release = config('GIT_COMMIT_SHA', default=None)
    
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
                signals_spans=True,
            ),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=config('SENTRY_TRACES_SAMPLE_RATE', default=0.1, cast=float),
        send_default_pii=False,  # Don't send PII
        environment=environment,
        release=release,
        before_send=before_send_handler,
    )


def before_send_handler(event, hint):
    """Filter or modify events before sending to Sentry."""
    # Don't send events in development unless explicitly enabled
    if os.getenv('ENVIRONMENT') == 'development' and not os.getenv('SENTRY_ENABLE_DEV'):
        return None
    
    # Filter out certain exceptions if needed
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        # Example: Don't send 404 errors
        if isinstance(exc_value, Exception) and '404' in str(exc_value):
            return None
    
    return event

