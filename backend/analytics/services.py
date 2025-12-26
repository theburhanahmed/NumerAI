"""
Analytics services for tracking and analyzing user behavior.
"""
from django.utils import timezone
from django.db.models import Count, Q, Avg, Sum, F
from django.db.models.functions import TruncDate, TruncHour
from datetime import timedelta
from .models import (
    UserActivityLog, EventTracking, UserJourney,
    ABTest, ConversionFunnel, BusinessMetric
)
from accounts.models import User
import logging

logger = logging.getLogger(__name__)


def track_activity(user, activity_type, activity_data=None, request=None, **kwargs):
    """
    Track a user activity.
    
    Args:
        user: User instance or None for anonymous
        activity_type: Type of activity (e.g., 'page_view', 'button_click', 'feature_used')
        activity_data: Additional data about the activity
        request: Django request object (optional)
        **kwargs: Additional fields (page_path, feature_name, session_id)
    """
    try:
        log_entry = UserActivityLog.objects.create(
            user=user if user and user.is_authenticated else None,
            activity_type=activity_type,
            activity_data=activity_data or {},
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
            session_id=kwargs.get('session_id', ''),
            page_path=kwargs.get('page_path', ''),
            feature_name=kwargs.get('feature_name', ''),
        )
        return log_entry
    except Exception as e:
        logger.error(f"Failed to track activity: {str(e)}", exc_info=True)
        return None


def track_event(user, event_name, event_category='engagement', event_properties=None, 
                funnel_name=None, funnel_step=None, experiment_id=None, variant_id=None,
                request=None, **kwargs):
    """
    Track a specific event for conversion funnels and A/B testing.
    
    Args:
        user: User instance or None
        event_name: Name of the event
        event_category: Category (e.g., 'conversion', 'engagement', 'error')
        event_properties: Additional event properties
        funnel_name: Name of the funnel (if part of a funnel)
        funnel_step: Step in the funnel
        experiment_id: A/B test experiment ID
        variant_id: A/B test variant ID
        request: Django request object
        **kwargs: Additional fields
    """
    try:
        # Determine funnel position if funnel_name is provided
        funnel_position = None
        if funnel_name:
            funnel = ConversionFunnel.objects.filter(name=funnel_name, is_active=True).first()
            if funnel and funnel_step:
                try:
                    funnel_position = funnel.steps.index(funnel_step) + 1
                except ValueError:
                    pass
        
        event = EventTracking.objects.create(
            user=user if user and user.is_authenticated else None,
            event_name=event_name,
            event_category=event_category,
            event_properties=event_properties or {},
            funnel_name=funnel_name or '',
            funnel_step=funnel_step or '',
            funnel_position=funnel_position,
            experiment_id=experiment_id or '',
            variant_id=variant_id or '',
            session_id=kwargs.get('session_id', ''),
            page_path=kwargs.get('page_path', ''),
            referrer=kwargs.get('referrer', ''),
        )
        return event
    except Exception as e:
        logger.error(f"Failed to track event: {str(e)}", exc_info=True)
        return None


def get_user_behavior_metrics(user, days=30):
    """
    Get user behavior metrics for a specific user.
    
    Returns:
        dict: User behavior metrics
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # Activity counts
    activities = UserActivityLog.objects.filter(
        user=user,
        created_at__gte=start_date
    )
    
    activity_counts = activities.values('activity_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Feature usage
    feature_usage = activities.filter(
        feature_name__isnull=False
    ).exclude(feature_name='').values('feature_name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Daily activity
    daily_activity = activities.annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    return {
        'total_activities': activities.count(),
        'activity_breakdown': list(activity_counts),
        'feature_usage': list(feature_usage),
        'daily_activity': list(daily_activity),
        'period_days': days,
    }


def get_conversion_funnel_metrics(funnel_name, days=30):
    """
    Get conversion funnel metrics.
    
    Returns:
        dict: Funnel metrics with conversion rates
    """
    try:
        funnel = ConversionFunnel.objects.get(name=funnel_name, is_active=True)
    except ConversionFunnel.DoesNotExist:
        return None
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # Get events for this funnel
    events = EventTracking.objects.filter(
        funnel_name=funnel_name,
        created_at__gte=start_date
    )
    
    # Count users at each step
    step_counts = {}
    for i, step in enumerate(funnel.steps, 1):
        step_events = events.filter(funnel_position=i)
        unique_users = step_events.values('user').distinct().count()
        step_counts[step] = {
            'position': i,
            'users': unique_users,
            'events': step_events.count(),
        }
    
    # Calculate conversion rates
    if step_counts:
        first_step_count = list(step_counts.values())[0]['users']
        if first_step_count > 0:
            for step_name, step_data in step_counts.items():
                step_data['conversion_rate'] = (step_data['users'] / first_step_count) * 100
        else:
            for step_data in step_counts.values():
                step_data['conversion_rate'] = 0
    
    return {
        'funnel_name': funnel_name,
        'steps': step_counts,
        'total_users_entered': list(step_counts.values())[0]['users'] if step_counts else 0,
        'total_users_completed': list(step_counts.values())[-1]['users'] if step_counts else 0,
        'overall_conversion_rate': (
            (list(step_counts.values())[-1]['users'] / list(step_counts.values())[0]['users'] * 100)
            if step_counts and list(step_counts.values())[0]['users'] > 0 else 0
        ),
        'period_days': days,
    }


def get_business_metrics(days=30, metric_category=None):
    """
    Get aggregated business metrics.
    
    Returns:
        dict: Business metrics
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # User metrics
    total_users = User.objects.filter(is_active=True).count()
    new_users = User.objects.filter(
        date_joined__gte=start_date,
        is_active=True
    ).count()
    
    # Active users
    dau = User.objects.filter(
        last_login__date=timezone.now().date(),
        is_active=True
    ).count()
    
    mau = User.objects.filter(
        last_login__gte=start_date,
        is_active=True
    ).distinct().count()
    
    # Engagement metrics
    activities_count = UserActivityLog.objects.filter(
        created_at__gte=start_date
    ).count()
    
    events_count = EventTracking.objects.filter(
        created_at__gte=start_date
    ).count()
    
    # Feature usage
    feature_usage = UserActivityLog.objects.filter(
        created_at__gte=start_date,
        feature_name__isnull=False
    ).exclude(feature_name='').values('feature_name').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return {
        'users': {
            'total': total_users,
            'new': new_users,
            'dau': dau,
            'mau': mau,
            'retention_rate': (dau / mau * 100) if mau > 0 else 0,
        },
        'engagement': {
            'total_activities': activities_count,
            'total_events': events_count,
            'avg_activities_per_user': activities_count / mau if mau > 0 else 0,
        },
        'feature_usage': list(feature_usage),
        'period_days': days,
    }


def get_ab_test_results(experiment_id):
    """
    Get A/B test results.
    
    Returns:
        dict: A/B test results with statistical significance
    """
    try:
        test = ABTest.objects.get(id=experiment_id)
    except ABTest.DoesNotExist:
        return None
    
    # Get events for each variant
    variant_results = {}
    for variant in test.variants:
        variant_id = variant.get('id', '')
        events = EventTracking.objects.filter(
            experiment_id=str(test.id),
            variant_id=variant_id
        )
        
        # Calculate metrics
        unique_users = events.values('user').distinct().count()
        total_events = events.count()
        
        # Get primary metric value
        primary_metric_value = 0
        if test.primary_metric == 'conversion_rate':
            # Count conversions (events with specific name)
            conversions = events.filter(
                event_name__icontains='conversion'
            ).count()
            primary_metric_value = (conversions / total_events * 100) if total_events > 0 else 0
        elif test.primary_metric == 'engagement_score':
            # Calculate engagement score
            primary_metric_value = total_events / unique_users if unique_users > 0 else 0
        
        variant_results[variant_id] = {
            'variant_name': variant.get('name', variant_id),
            'users': unique_users,
            'events': total_events,
            'primary_metric': primary_metric_value,
        }
    
    return {
        'experiment_id': str(test.id),
        'experiment_name': test.name,
        'primary_metric': test.primary_metric,
        'variants': variant_results,
        'is_active': test.is_active,
    }
