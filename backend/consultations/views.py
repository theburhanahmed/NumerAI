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
from .models import (
    Expert, Consultation, ConsultationReview, ExpertApplication,
    ExpertVerificationDocument, ExpertChatConversation, ExpertChatMessage,
    ExpertAvailability, ExpertUnavailability
)
from .serializers import (
    ExpertSerializer, ConsultationSerializer, ConsultationBookingSerializer,
    ConsultationReviewSerializer, ConsultationDetailSerializer,
    ConsultationRescheduleSerializer, ConsultationCancelSerializer,
    ExpertApplicationSerializer, ExpertVerificationDocumentSerializer,
    ExpertAvailabilitySerializer, ExpertChatConversationSerializer,
    ExpertChatMessageSerializer, SendMessageSerializer
)
from .services import JitsiService, SchedulingService
from rest_framework.permissions import IsAdminUser
import uuid


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_experts(request):
    """Get list of available experts."""
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get active and verified experts
    experts = Expert.objects.filter(
        is_active=True,
        verification_status='approved'
    ).order_by('-rating', '-experience_years')
    
    # Filter by specialty if provided
    specialty = request.query_params.get('specialty')
    if specialty:
        experts = experts.filter(specialty=specialty)
    
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
    
    # Check expert availability using SchedulingService
    scheduling_service = SchedulingService()
    if scheduling_service.check_conflict(expert, scheduled_at, duration_minutes):
        return Response({
            'error': 'Selected time slot is not available. Please choose another time.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate Jitsi meeting room if video consultation
        jitsi_service = JitsiService()
        meeting_room_id = None
        meeting_link = None
        
        if consultation_type == 'video':
            meeting_room_id = jitsi_service.create_meeting_room()
            meeting_link = jitsi_service.get_meeting_url(
                meeting_room_id,
                user_display_name=user.full_name,
                expert_display_name=expert.name
            )
        
        # Create consultation
        consultation = Consultation.objects.create(
            user=user,
            expert=expert,
            consultation_type=consultation_type,
            scheduled_at=scheduled_at,
            duration_minutes=duration_minutes,
            status='pending',
            meeting_room_id=meeting_room_id,
            meeting_link=meeting_link,
            notes=serializer.validated_data.get('notes', '')
        )
        
        # Create chat conversation if chat consultation
        if consultation_type == 'chat':
            ExpertChatConversation.objects.get_or_create(
                user=user,
                expert=expert,
                consultation=consultation,
                defaults={'status': 'active'}
            )
        
        # Send notifications (will be implemented in signals)
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
    
    # Get upcoming consultations (pending and confirmed) with optimized queries
    consultations = Consultation.objects.filter(
        user=user,
        scheduled_at__gte=timezone.now(),
        status__in=['pending', 'confirmed']
    ).select_related('expert', 'user').prefetch_related('reviews').order_by('scheduled_at')
    
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


# Expert Verification Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_as_expert(request):
    """Submit expert application."""
    user = request.user
    serializer = ExpertApplicationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already has an application
    existing = ExpertApplication.objects.filter(
        user=user,
        status__in=['pending', 'under_review']
    ).exists()
    
    if existing:
        return Response({
            'error': 'You already have a pending application'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        application = ExpertApplication.objects.create(
            user=user,
            **serializer.validated_data
        )
        serializer = ExpertApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': f'Failed to submit application: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_application(request):
    """Get user's expert application."""
    try:
        application = ExpertApplication.objects.filter(user=request.user).latest('submitted_at')
        serializer = ExpertApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ExpertApplication.DoesNotExist:
        return Response({
            'error': 'No application found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_verification_document(request):
    """Upload verification document."""
    user = request.user
    
    # Get or create application
    try:
        application = ExpertApplication.objects.filter(
            user=user,
            status__in=['pending', 'under_review']
        ).latest('submitted_at')
    except ExpertApplication.DoesNotExist:
        return Response({
            'error': 'No active application found. Please submit an application first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES.get('file')
    if not file:
        return Response({
            'error': 'No file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        document = ExpertVerificationDocument.objects.create(
            application=application,
            document_type=request.data.get('document_type', 'other'),
            document_name=request.data.get('document_name', file.name),
            description=request.data.get('description', ''),
            file=file,
            file_size=file.size
        )
        serializer = ExpertVerificationDocumentSerializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'error': f'Failed to upload document: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_verification_status(request):
    """Get expert verification status."""
    user = request.user
    
    # Check if user is an expert
    try:
        expert = Expert.objects.get(user=user)
        return Response({
            'verification_status': expert.verification_status,
            'is_verified': expert.is_verified,
            'verified_at': expert.verified_at,
            'verification_notes': expert.verification_notes
        }, status=status.HTTP_200_OK)
    except Expert.DoesNotExist:
        # Check if user has an application
        try:
            application = ExpertApplication.objects.filter(user=user).latest('submitted_at')
            return Response({
                'verification_status': 'application_pending',
                'application_status': application.status,
                'application_id': str(application.id)
            }, status=status.HTTP_200_OK)
        except ExpertApplication.DoesNotExist:
            return Response({
                'verification_status': 'not_applied'
            }, status=status.HTTP_200_OK)


# Admin views for expert verification

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_pending_verifications(request):
    """Admin: List pending expert applications."""
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    
    applications = ExpertApplication.objects.filter(
        status__in=['pending', 'under_review']
    ).order_by('-submitted_at')
    
    start = (page - 1) * page_size
    end = start + page_size
    paginated = applications[start:end]
    
    serializer = ExpertApplicationSerializer(paginated, many=True)
    return Response({
        'count': applications.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_review_expert(request, application_id):
    """Admin: Review and approve/reject expert application."""
    action = request.data.get('action')  # 'approve' or 'reject'
    notes = request.data.get('notes', '')
    
    if action not in ['approve', 'reject']:
        return Response({
            'error': 'Action must be "approve" or "reject"'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        application = ExpertApplication.objects.get(id=application_id)
    except ExpertApplication.DoesNotExist:
        return Response({
            'error': 'Application not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if action == 'approve':
        application.status = 'approved'
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        # Create or update expert
        expert, created = Expert.objects.get_or_create(
            email=application.email,
            defaults={
                'name': application.name,
                'specialty': application.specialty,
                'experience_years': application.experience_years,
                'bio': application.bio,
                'user': application.user,
                'verification_status': 'approved',
                'verified_at': timezone.now(),
                'verification_notes': notes
            }
        )
        
        if not created:
            expert.verification_status = 'approved'
            expert.verified_at = timezone.now()
            expert.verification_notes = notes
            expert.save()
        
        # Move documents to expert
        ExpertVerificationDocument.objects.filter(application=application).update(
            expert=expert
        )
        
        return Response({
            'message': 'Application approved',
            'expert_id': str(expert.id)
        }, status=status.HTTP_200_OK)
    
    else:  # reject
        application.status = 'rejected'
        application.rejection_reason = notes
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        return Response({
            'message': 'Application rejected'
        }, status=status.HTTP_200_OK)


# Consultation Management Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_consultation(request, consultation_id):
    """Get consultation details."""
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        if consultation.user != request.user:
            # Check if user is the expert
            if not (consultation.expert.user == request.user if consultation.expert.user else False):
                # Check if user is staff
                if not request.user.is_staff:
                    return Response({
                        'error': 'Permission denied'
                    }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ConsultationDetailSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_consultation(request, consultation_id):
    """Expert confirms consultation."""
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check if user is the expert
        if not (consultation.expert.user == request.user if consultation.expert.user else False):
            return Response({
                'error': 'Only the expert can confirm this consultation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if consultation.status != 'pending':
            return Response({
                'error': 'Consultation is not in pending status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        consultation.status = 'confirmed'
        consultation.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_consultation(request, consultation_id):
    """Cancel consultation."""
    serializer = ConsultationCancelSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        is_user = consultation.user == request.user
        is_expert = consultation.expert.user == request.user if consultation.expert.user else False
        
        if not (is_user or is_expert):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not consultation.can_be_cancelled():
            return Response({
                'error': 'Consultation cannot be cancelled at this time'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        consultation.status = 'cancelled'
        consultation.cancellation_reason = serializer.validated_data.get('cancellation_reason', '')
        consultation.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reschedule_consultation(request, consultation_id):
    """Reschedule consultation."""
    serializer = ConsultationRescheduleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        if consultation.user != request.user:
            return Response({
                'error': 'Only the user can reschedule this consultation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not consultation.can_be_rescheduled():
            return Response({
                'error': 'Consultation cannot be rescheduled at this time'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        new_scheduled_at = serializer.validated_data['scheduled_at']
        new_duration = serializer.validated_data.get('duration_minutes', consultation.duration_minutes)
        
        # Check for conflicts
        scheduling_service = SchedulingService()
        if scheduling_service.check_conflict(consultation.expert, new_scheduled_at, new_duration):
            return Response({
                'error': 'Selected time slot is not available'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create rescheduled consultation
        old_consultation = consultation
        consultation.status = 'rescheduled'
        consultation.save()
        
        new_consultation = Consultation.objects.create(
            user=old_consultation.user,
            expert=old_consultation.expert,
            consultation_type=old_consultation.consultation_type,
            scheduled_at=new_scheduled_at,
            duration_minutes=new_duration,
            status='pending',
            notes=old_consultation.notes,
            rescheduled_from=old_consultation,
            meeting_room_id=old_consultation.meeting_room_id,
            meeting_link=old_consultation.meeting_link
        )
        
        serializer = ConsultationSerializer(new_consultation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meeting_link(request, consultation_id):
    """Get meeting link for consultation."""
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        if consultation.user != request.user:
            if not (consultation.expert.user == request.user if consultation.expert.user else False):
                if not request.user.is_staff:
                    return Response({
                        'error': 'Permission denied'
                    }, status=status.HTTP_403_FORBIDDEN)
        
        if not consultation.meeting_link:
            # Generate meeting link if not exists
            jitsi_service = JitsiService()
            if consultation.meeting_room_id:
                consultation.meeting_link = jitsi_service.get_meeting_url(
                    consultation.meeting_room_id,
                    user_display_name=consultation.user.full_name,
                    expert_display_name=consultation.expert.name
                )
                consultation.save()
        
        return Response({
            'meeting_link': consultation.meeting_link,
            'meeting_room_id': consultation.meeting_room_id
        }, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_meeting(request, consultation_id):
    """Mark meeting as started."""
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        if consultation.user != request.user:
            if not (consultation.expert.user == request.user if consultation.expert.user else False):
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        consultation.meeting_started_at = timezone.now()
        consultation.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_meeting(request, consultation_id):
    """Mark meeting as ended and completed."""
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        
        # Check access
        if consultation.user != request.user:
            if not (consultation.expert.user == request.user if consultation.expert.user else False):
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        consultation.meeting_ended_at = timezone.now()
        consultation.status = 'completed'
        consultation.save()
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found'
        }, status=status.HTTP_404_NOT_FOUND)


# Expert Availability Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expert_availability(request, expert_id):
    """Get expert availability schedule."""
    try:
        expert = Expert.objects.get(id=expert_id, is_active=True)
        availability = ExpertAvailability.objects.filter(
            expert=expert,
            is_available=True
        ).order_by('day_of_week', 'start_time')
        
        serializer = ExpertAvailabilitySerializer(availability, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_time_slots(request, expert_id):
    """Get available time slots for an expert on a specific date."""
    date_str = request.query_params.get('date')
    duration = int(request.query_params.get('duration', 30))
    
    if not date_str:
        return Response({
            'error': 'Date parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        expert = Expert.objects.get(id=expert_id, is_active=True)
        scheduling_service = SchedulingService()
        slots = scheduling_service.get_available_slots(expert, date, duration)
        
        return Response({
            'date': date_str,
            'expert_id': str(expert_id),
            'duration_minutes': duration,
            'available_slots': [slot.isoformat() for slot in slots]
        }, status=status.HTTP_200_OK)
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_expert_availability(request):
    """Update expert availability schedule."""
    # Check if user is an expert
    try:
        expert = Expert.objects.get(user=request.user)
    except Expert.DoesNotExist:
        return Response({
            'error': 'You are not registered as an expert'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # This would typically accept a list of availability entries
    # For now, simplified version
    serializer = ExpertAvailabilitySerializer(data=request.data, many=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Delete existing availability
    ExpertAvailability.objects.filter(expert=expert).delete()
    
    # Create new availability entries
    for item in serializer.validated_data:
        ExpertAvailability.objects.create(
            expert=expert,
            **item
        )
    
    return Response({
        'message': 'Availability updated successfully'
    }, status=status.HTTP_200_OK)


# Expert Dashboard

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expert_dashboard(request):
    """Get expert dashboard data."""
    try:
        expert = Expert.objects.get(user=request.user)
    except Expert.DoesNotExist:
        return Response({
            'error': 'You are not registered as an expert'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get upcoming consultations
    upcoming = Consultation.objects.filter(
        expert=expert,
        scheduled_at__gte=timezone.now(),
        status__in=['pending', 'confirmed']
    ).order_by('scheduled_at')[:10]
    
    # Get pending confirmations
    pending = Consultation.objects.filter(
        expert=expert,
        status='pending'
    ).count()
    
    # Get stats
    total_consultations = Consultation.objects.filter(expert=expert).count()
    completed = Consultation.objects.filter(expert=expert, status='completed').count()
    
    return Response({
        'expert': ExpertSerializer(expert).data,
        'upcoming_consultations': ConsultationSerializer(upcoming, many=True).data,
        'pending_confirmations': pending,
        'stats': {
            'total_consultations': total_consultations,
            'completed': completed,
            'rating': float(expert.rating)
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expert_consultations(request):
    """Get expert's consultation history."""
    try:
        expert = Expert.objects.get(user=request.user)
    except Expert.DoesNotExist:
        return Response({
            'error': 'You are not registered as an expert'
        }, status=status.HTTP_403_FORBIDDEN)
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    status_filter = request.query_params.get('status')
    
    consultations = Consultation.objects.filter(expert=expert)
    
    if status_filter:
        consultations = consultations.filter(status=status_filter)
    
    consultations = consultations.order_by('-scheduled_at')
    
    start = (page - 1) * page_size
    end = start + page_size
    paginated = consultations[start:end]
    
    serializer = ConsultationSerializer(paginated, many=True)
    return Response({
        'count': consultations.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


# Chat Views

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_or_create_chat(request):
    """Get existing chat or create new one."""
    expert_id = request.query_params.get('expert_id') or request.data.get('expert_id')
    consultation_id = request.query_params.get('consultation_id') or request.data.get('consultation_id')
    
    if not expert_id:
        return Response({
            'error': 'expert_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        expert = Expert.objects.get(id=expert_id, is_active=True)
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    consultation = None
    if consultation_id:
        try:
            consultation = Consultation.objects.get(id=consultation_id)
            # Verify consultation belongs to user
            if consultation.user != request.user:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        except Consultation.DoesNotExist:
            pass
    
    # Get or create conversation
    conversation, created = ExpertChatConversation.objects.get_or_create(
        user=request.user,
        expert=expert,
        consultation=consultation,
        defaults={'status': 'active'}
    )
    
    serializer = ExpertChatConversationSerializer(conversation)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    """List all chats for user or expert."""
    user = request.user
    
    # Check if user is an expert
    try:
        expert = Expert.objects.get(user=user)
        # Get chats where user is the expert
        conversations = ExpertChatConversation.objects.filter(expert=expert)
    except Expert.DoesNotExist:
        # Get chats where user is the regular user
        conversations = ExpertChatConversation.objects.filter(user=user)
    
    status_filter = request.query_params.get('status', 'active')
    conversations = conversations.filter(status=status_filter)
    conversations = conversations.order_by('-last_message_at', '-created_at')
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    paginated = conversations[start:end]
    
    serializer = ExpertChatConversationSerializer(paginated, many=True)
    return Response({
        'count': conversations.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, conversation_id):
    """Get messages in a chat conversation."""
    try:
        conversation = ExpertChatConversation.objects.get(id=conversation_id)
        
        # Check access
        if conversation.user != request.user:
            if not (conversation.expert.user == request.user if conversation.expert.user else False):
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
    except ExpertChatConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 50))
    since = request.query_params.get('since')  # Get messages since timestamp
    
    messages = ExpertChatMessage.objects.filter(conversation=conversation)
    
    if since:
        try:
            since_dt = timezone.datetime.fromisoformat(since.replace('Z', '+00:00'))
            messages = messages.filter(created_at__gt=since_dt)
        except (ValueError, AttributeError):
            pass
    
    messages = messages.order_by('created_at')
    
    start = (page - 1) * page_size
    end = start + page_size
    paginated = messages[start:end]
    
    serializer = ExpertChatMessageSerializer(paginated, many=True)
    return Response({
        'count': messages.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, conversation_id):
    """Send message in chat conversation."""
    serializer = SendMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        conversation = ExpertChatConversation.objects.get(id=conversation_id)
        
        # Check access
        is_user = conversation.user == request.user
        is_expert = conversation.expert.user == request.user if conversation.expert.user else False
        
        if not (is_user or is_expert):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Determine sender type
        sender_type = 'user' if is_user else 'expert'
        
        # Handle file upload if present
        file_attachment = request.FILES.get('file')
        file_name = None
        file_size = None
        
        if file_attachment:
            file_name = file_attachment.name
            file_size = file_attachment.size
        
        # Get reply_to message if specified
        reply_to = None
        reply_to_id = serializer.validated_data.get('reply_to')
        if reply_to_id:
            try:
                reply_to = ExpertChatMessage.objects.get(id=reply_to_id, conversation=conversation)
            except ExpertChatMessage.DoesNotExist:
                pass
        
        # Create message
        message = ExpertChatMessage.objects.create(
            conversation=conversation,
            sender_type=sender_type,
            sender_user=request.user if sender_type == 'user' else None,
            message_content=serializer.validated_data['message_content'],
            message_type=serializer.validated_data.get('message_type', 'text'),
            file_attachment=file_attachment,
            file_name=file_name,
            file_size=file_size,
            reply_to=reply_to
        )
        
        # Update conversation
        conversation.last_message_at = timezone.now()
        conversation.last_message_preview = message.message_content[:200]
        
        # Update unread counts
        if sender_type == 'user':
            conversation.unread_count_expert += 1
        else:
            conversation.unread_count_user += 1
        
        conversation.save()
        
        serializer = ExpertChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ExpertChatConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """Mark messages as read in a conversation."""
    try:
        conversation = ExpertChatConversation.objects.get(id=conversation_id)
        
        # Check access
        is_user = conversation.user == request.user
        is_expert = conversation.expert.user == request.user if conversation.expert.user else False
        
        if not (is_user or is_expert):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mark messages as read
        sender_type_filter = 'expert' if is_user else 'user'
        unread_messages = ExpertChatMessage.objects.filter(
            conversation=conversation,
            sender_type=sender_type_filter,
            is_read=False
        )
        
        count = unread_messages.update(
            is_read=True,
            read_at=timezone.now()
        )
        
        # Update conversation unread count
        if is_user:
            conversation.unread_count_user = 0
        else:
            conversation.unread_count_expert = 0
        conversation.save()
        
        return Response({
            'message': f'{count} messages marked as read'
        }, status=status.HTTP_200_OK)
    except ExpertChatConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get total unread message count."""
    user = request.user
    
    # Check if user is an expert
    try:
        expert = Expert.objects.get(user=user)
        # Get unread count for expert
        conversations = ExpertChatConversation.objects.filter(expert=expert)
        total_unread = sum(conv.unread_count_expert for conv in conversations)
    except Expert.DoesNotExist:
        # Get unread count for regular user
        conversations = ExpertChatConversation.objects.filter(user=user)
        total_unread = sum(conv.unread_count_user for conv in conversations)
    
    return Response({
        'unread_count': total_unread
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_chat(request, conversation_id):
    """Archive a chat conversation."""
    try:
        conversation = ExpertChatConversation.objects.get(id=conversation_id)
        
        # Check access
        if conversation.user != request.user:
            if not (conversation.expert.user == request.user if conversation.expert.user else False):
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        conversation.status = 'archived'
        conversation.save()
        
        return Response({
            'message': 'Conversation archived'
        }, status=status.HTTP_200_OK)
    except ExpertChatConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_chat(request, conversation_id):
    """Block a chat conversation."""
    try:
        conversation = ExpertChatConversation.objects.get(id=conversation_id)
        
        # Check access
        if conversation.user != request.user:
            if not (conversation.expert.user == request.user if conversation.expert.user else False):
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        conversation.status = 'blocked'
        conversation.save()
        
        return Response({
            'message': 'Conversation blocked'
        }, status=status.HTTP_200_OK)
    except ExpertChatConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """Delete a message."""
    try:
        message = ExpertChatMessage.objects.get(id=message_id)
        
        # Check access - user can only delete their own messages
        if message.sender_user != request.user:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        message.delete()
        
        return Response({
            'message': 'Message deleted'
        }, status=status.HTTP_204_NO_CONTENT)
    except ExpertChatMessage.DoesNotExist:
        return Response({
            'error': 'Message not found'
        }, status=status.HTTP_404_NOT_FOUND)