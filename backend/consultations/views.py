"""
API views for NumerAI consultations application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, date, datetime
from .models import Expert, Consultation, ConsultationReview
from .serializers import (
    ExpertSerializer, ConsultationSerializer, ConsultationBookingSerializer,
    ConsultationReviewSerializer
)
import uuid


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_experts(request):
    """Get list of available experts."""
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get active experts
    experts = Expert.objects.filter(is_active=True).order_by('-rating', '-experience_years')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_experts = experts[start:end]
    
    serializer = ExpertSerializer(paginated_experts, many=True)
    
    return Response({
        'count': experts.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expert(request, expert_id):
    """Get details of a specific expert."""
    try:
        expert = Expert.objects.get(id=expert_id, is_active=True)
        serializer = ExpertSerializer(expert)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_consultation(request):
    """Book a consultation with an expert."""
    user = request.user
    serializer = ConsultationBookingSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Type checker issues are suppressed with # type: ignore comments
    expert_id = serializer.validated_data['expert_id']  # type: ignore
    consultation_type = serializer.validated_data['consultation_type']  # type: ignore
    scheduled_at = serializer.validated_data['scheduled_at']  # type: ignore
    duration_minutes = serializer.validated_data.get('duration_minutes', 30)  # type: ignore
    
    try:
        # Get expert
        expert = Expert.objects.get(id=expert_id, is_active=True)
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found or not available'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if scheduled time is in the future
    if scheduled_at <= timezone.now():
        return Response({
            'error': 'Scheduled time must be in the future'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check for scheduling conflicts
    conflict = Consultation.objects.filter(
        expert=expert,
        scheduled_at__date=scheduled_at.date(),
        status__in=['pending', 'confirmed']
    ).filter(
        scheduled_at__lt=scheduled_at + timedelta(minutes=duration_minutes),
        scheduled_at__gte=scheduled_at - timedelta(minutes=duration_minutes)
    ).exists()
    
    if conflict:
        return Response({
            'error': 'Selected time slot is not available. Please choose another time.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create consultation
        consultation = Consultation.objects.create(
            user=user,
            expert=expert,
            consultation_type=consultation_type,
            scheduled_at=scheduled_at,
            duration_minutes=duration_minutes,
            status='pending'
        )
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to book consultation: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upcoming_consultations(request):
    """Get user's upcoming consultations."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get upcoming consultations (pending and confirmed)
    consultations = Consultation.objects.filter(
        user=user,
        scheduled_at__gte=timezone.now(),
        status__in=['pending', 'confirmed']
    ).order_by('scheduled_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_consultations = consultations[start:end]
    
    serializer = ConsultationSerializer(paginated_consultations, many=True)
    
    return Response({
        'count': consultations.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_past_consultations(request):
    """Get user's past consultations."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get past consultations (completed, cancelled, rescheduled)
    consultations = Consultation.objects.filter(
        user=user,
        scheduled_at__lt=timezone.now()
    ).exclude(
        status='pending'
    ).order_by('-scheduled_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_consultations = consultations[start:end]
    
    serializer = ConsultationSerializer(paginated_consultations, many=True)
    
    return Response({
        'count': consultations.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_consultation(request, consultation_id):
    """Rate a completed consultation."""
    user = request.user
    rating = request.data.get('rating')
    review_text = request.data.get('review_text', '')
    is_anonymous = request.data.get('is_anonymous', False)
    
    # Validate rating
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return Response({
            'error': 'Rating must be an integer between 1 and 5'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get consultation
        consultation = Consultation.objects.get(
            id=consultation_id,
            user=user,
            status='completed'
        )
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found or not completed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already reviewed
    if hasattr(consultation, 'review'):
        return Response({
            'error': 'Consultation already reviewed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create review
        review = ConsultationReview.objects.create(
            consultation=consultation,
            rating=rating,
            review_text=review_text,
            is_anonymous=is_anonymous
        )
        
        # Update expert rating
        expert = consultation.expert
        # Recalculate average rating (simplified approach)
        expert_reviews = ConsultationReview.objects.filter(
            consultation__expert=expert
        ).select_related('consultation')
        
        if expert_reviews.exists():
            total_rating = sum(review.rating for review in expert_reviews)
            expert.rating = round(total_rating / expert_reviews.count(), 2)
            expert.save()
        
        serializer = ConsultationReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to create review: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)