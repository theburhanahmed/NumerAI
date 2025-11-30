"""
API views for payments application.
"""
import json
import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
import stripe
from .models import Subscription, Payment, BillingHistory
from .serializers import (
    SubscriptionSerializer, CreateSubscriptionSerializer,
    PaymentSerializer, BillingHistorySerializer,
)
from .services import (
    create_subscription, create_payment_intent,
    handle_webhook_event, get_or_create_stripe_customer,
    update_subscription, cancel_subscription,
)

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription_view(request):
    """
    Create a new subscription for the authenticated user.
    
    POST /api/v1/payments/create-subscription/
    Body: {
        "plan": "basic|premium|elite",
        "payment_method_id": "pm_xxx" (optional)
    }
    """
    serializer = CreateSubscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    plan = serializer.validated_data['plan']
    payment_method_id = serializer.validated_data.get('payment_method_id')
    
    try:
        result = create_subscription(
            user=request.user,
            plan=plan,
            payment_method_id=payment_method_id,
        )
        
        return Response({
            'message': 'Subscription created successfully',
            'subscription_id': result['subscription_id'],
            'client_secret': result.get('client_secret'),
            'status': result['status'],
        }, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating subscription: {str(e)}")
        return Response(
            {'error': 'Payment processing failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    """
    Get the current subscription status for the authenticated user.
    
    GET /api/v1/payments/subscription-status/
    """
    try:
        subscription = getattr(request.user, 'subscription', None)
        if not subscription:
            return Response({
                'has_subscription': False,
                'subscription': None,
            }, status=status.HTTP_200_OK)
        
        serializer = SubscriptionSerializer(subscription)
        return Response({
            'has_subscription': True,
            'subscription': serializer.data,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting subscription status: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_subscription_view(request):
    """
    Update the authenticated user's subscription.
    
    POST /api/v1/payments/update-subscription/
    Body: {
        "plan": "basic|premium|elite" (optional),
        "cancel_at_period_end": true|false (optional)
    }
    """
    plan = request.data.get('plan')
    cancel_at_period_end = request.data.get('cancel_at_period_end')
    
    if plan and plan not in ['basic', 'premium', 'elite']:
        return Response(
            {'error': 'Invalid plan. Must be basic, premium, or elite.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = update_subscription(
            user=request.user,
            plan=plan,
            cancel_at_period_end=cancel_at_period_end,
        )
        
        return Response({
            'message': 'Subscription updated successfully',
            'subscription': result,
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error updating subscription: {str(e)}")
        return Response(
            {'error': 'Payment processing failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription_view(request):
    """
    Cancel the authenticated user's subscription.
    
    POST /api/v1/payments/cancel-subscription/
    """
    try:
        result = cancel_subscription(user=request.user)
        
        return Response({
            'message': 'Subscription canceled successfully',
            'subscription': result,
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error canceling subscription: {str(e)}")
        return Response(
            {'error': 'Payment processing failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_history(request):
    """
    Get billing history for the authenticated user.
    
    GET /api/v1/payments/billing-history/
    """
    try:
        history = BillingHistory.objects.filter(user=request.user).order_by('-created_at')
        
        paginator = PageNumberPagination()
        paginator.page_size = 20
        paginated_history = paginator.paginate_queryset(history, request)
        
        serializer = BillingHistorySerializer(paginated_history, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting billing history: {str(e)}")
        return Response(
            {'error': 'An error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Handle Stripe webhook events.
    
    POST /api/v1/payments/webhook/
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET
    
    if not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET not configured")
        return HttpResponse(status=400)
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        return HttpResponse(status=400)
    
    try:
        result = handle_webhook_event(event)
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return HttpResponse(status=500)
