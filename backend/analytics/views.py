"""
Analytics API views for tracking and retrieving analytics data.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import json
import logging

from .services import (
    track_activity, track_event, get_user_behavior_metrics,
    get_conversion_funnel_metrics, get_business_metrics, get_ab_test_results
)
from .models import ABTest, ConversionFunnel
from utils.request_utils import get_client_ip

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_activity_view(request):
    """
    Track a user activity.
    
    POST /api/v1/analytics/track-activity/
    Body: {
        "activity_type": "page_view",
        "activity_data": {...},
        "page_path": "/dashboard",
        "feature_name": "dashboard",
        "session_id": "session_123"
    }
    """
    try:
        user = request.user if request.user.is_authenticated else None
        activity_type = request.data.get('activity_type')
        
        if not activity_type:
            return Response(
                {'error': 'activity_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        log_entry = track_activity(
            user=user,
            activity_type=activity_type,
            activity_data=request.data.get('activity_data'),
            request=request,
            page_path=request.data.get('page_path', ''),
            feature_name=request.data.get('feature_name', ''),
            session_id=request.data.get('session_id', ''),
        )
        
        if log_entry:
            return Response({
                'success': True,
                'message': 'Activity tracked successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Failed to track activity'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        logger.error(f"Error tracking activity: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to track activity'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def track_event_view(request):
    """
    Track a specific event.
    
    POST /api/v1/analytics/track-event/
    Body: {
        "event_name": "subscription_started",
        "event_category": "conversion",
        "event_properties": {...},
        "funnel_name": "subscription",
        "funnel_step": "payment_form",
        "experiment_id": "exp_123",
        "variant_id": "variant_a"
    }
    """
    try:
        user = request.user if request.user.is_authenticated else None
        event_name = request.data.get('event_name')
        
        if not event_name:
            return Response(
                {'error': 'event_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event = track_event(
            user=user,
            event_name=event_name,
            event_category=request.data.get('event_category', 'engagement'),
            event_properties=request.data.get('event_properties'),
            funnel_name=request.data.get('funnel_name'),
            funnel_step=request.data.get('funnel_step'),
            experiment_id=request.data.get('experiment_id'),
            variant_id=request.data.get('variant_id'),
            request=request,
            session_id=request.data.get('session_id', ''),
            page_path=request.data.get('page_path', ''),
            referrer=request.data.get('referrer', ''),
        )
        
        if event:
            return Response({
                'success': True,
                'message': 'Event tracked successfully',
                'event_id': str(event.id)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Failed to track event'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        logger.error(f"Error tracking event: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to track event'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_personal_analytics(request):
    """
    Get personal analytics for the authenticated user.
    
    GET /api/v1/analytics/personal/?days=30
    """
    try:
        days = int(request.query_params.get('days', 30))
        metrics = get_user_behavior_metrics(request.user, days=days)
        
        return Response(metrics, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting personal analytics: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve analytics'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_business_analytics(request):
    """
    Get business metrics (admin/staff only).
    
    GET /api/v1/analytics/business/?days=30&category=user
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        days = int(request.query_params.get('days', 30))
        category = request.query_params.get('category')
        metrics = get_business_metrics(days=days, metric_category=category)
        
        return Response(metrics, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting business analytics: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve analytics'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_funnel_analytics(request, funnel_name):
    """
    Get conversion funnel metrics.
    
    GET /api/v1/analytics/funnels/{funnel_name}/?days=30
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        days = int(request.query_params.get('days', 30))
        metrics = get_conversion_funnel_metrics(funnel_name, days=days)
        
        if not metrics:
            return Response(
                {'error': 'Funnel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(metrics, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting funnel analytics: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve funnel analytics'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ab_test_results_view(request, experiment_id):
    """
    Get A/B test results.
    
    GET /api/v1/analytics/ab-tests/{experiment_id}/
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        results = get_ab_test_results(experiment_id)
        
        if not results:
            return Response(
                {'error': 'Experiment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(results, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting A/B test results: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to retrieve A/B test results'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
