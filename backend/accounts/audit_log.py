"""
Audit logging for sensitive operations in NumerAI.
"""
import logging
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import AuditLog

User = get_user_model()
logger = logging.getLogger(__name__)


def log_audit_event(
    user,
    action,
    resource_type,
    resource_id=None,
    details=None,
    ip_address=None,
    user_agent=None,
):
    """
    Log an audit event for sensitive operations.
    
    Args:
        user: User instance or user ID
        action: Action performed (e.g., 'login', 'payment', 'subscription_change')
        resource_type: Type of resource (e.g., 'user', 'subscription', 'payment')
        resource_id: ID of the resource (optional)
        details: Additional details as dict (optional)
        ip_address: IP address of the request (optional)
        user_agent: User agent string (optional)
    """
    try:
        # Convert user to User instance if needed
        if isinstance(user, str):
            user = User.objects.get(id=user)
        elif user is None:
            user = None
        
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=timezone.now(),
        )
    except Exception as e:
        logger.error(f"Failed to log audit event: {str(e)}", exc_info=True)


def log_authentication_event(user, action, success=True, ip_address=None, user_agent=None):
    """Log authentication-related events."""
    log_audit_event(
        user=user,
        action=f'auth_{action}',
        resource_type='user',
        resource_id=str(user.id) if user else None,
        details={'success': success},
        ip_address=ip_address,
        user_agent=user_agent,
    )


def log_payment_event(user, action, payment_id, amount=None, details=None, ip_address=None):
    """Log payment-related events."""
    log_details = details or {}
    if amount:
        log_details['amount'] = str(amount)
    
    log_audit_event(
        user=user,
        action=f'payment_{action}',
        resource_type='payment',
        resource_id=payment_id,
        details=log_details,
        ip_address=ip_address,
    )


def log_subscription_event(user, action, subscription_id, plan=None, details=None, ip_address=None):
    """Log subscription-related events."""
    log_details = details or {}
    if plan:
        log_details['plan'] = plan
    
    log_audit_event(
        user=user,
        action=f'subscription_{action}',
        resource_type='subscription',
        resource_id=subscription_id,
        details=log_details,
        ip_address=ip_address,
    )


def log_profile_update(user, fields_changed, ip_address=None):
    """Log profile update events."""
    log_audit_event(
        user=user,
        action='profile_update',
        resource_type='user',
        resource_id=str(user.id),
        details={'fields_changed': fields_changed},
        ip_address=ip_address,
    )


def log_data_access(user, resource_type, resource_id, ip_address=None):
    """Log data access events."""
    log_audit_event(
        user=user,
        action='data_access',
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
    )

