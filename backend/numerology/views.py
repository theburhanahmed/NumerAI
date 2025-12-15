"""
API views for NumerAI numerology application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.views.decorators.cache import cache_page
from django.http import HttpResponse
from django.conf import settings
from datetime import timedelta, date, datetime
from .models import (
    NumerologyProfile, DailyReading, CompatibilityCheck, Remedy, RemedyTracking,
    Person, PersonNumerologyProfile, RajYogDetection, Explanation, NameReport,
    WeeklyReport, YearlyReport, PhoneReport, HealthNumerologyProfile, NameCorrection,
    SpiritualNumerologyProfile, PredictiveCycle, GenerationalAnalysis, KarmicContract,
    FengShuiAnalysis, SpaceOptimization, MentalStateTracking, MentalStateAnalysis
)
from .serializers import (
    NumerologyProfileSerializer, DailyReadingSerializer, BirthChartSerializer,
    LifePathAnalysisSerializer, CompatibilityCheckSerializer, RemedySerializer, RemedyTrackingSerializer,
    PersonSerializer, PersonNumerologyProfileSerializer, NumerologyReportSerializer,
    RajYogDetectionSerializer, ExplanationSerializer, NameNumerologyGenerateSerializer, NameReportSerializer,
    WeeklyReportSerializer, YearlyReportSerializer, PhoneNumerologyGenerateSerializer, PhoneReportSerializer,
    FullNumerologyReportSerializer, HealthNumerologyProfileSerializer, NameCorrectionSerializer,
    NameCorrectionRequestSerializer, SpiritualNumerologyProfileSerializer, PredictiveCycleSerializer
)
from .utils import generate_otp, send_otp_email, generate_secure_token
from .numerology import NumerologyCalculator, validate_name, validate_birth_date
from .compatibility import CompatibilityAnalyzer
from .interpretations import get_interpretation, get_all_interpretations
from .reading_generator import DailyReadingGenerator
from .cache import NumerologyCache
from .name_numerology import compute_name_numbers
from .tasks import generate_name_report, generate_phone_report
from .phone_numerology import sanitize_and_validate_phone, compute_phone_numerology, compute_compatibility_score
from .services.lo_shu_service import LoShuGridService
from .services.health_numerology import HealthNumerologyService
from .services.asset_numerology import AssetNumerologyService
from .services.relationship_numerology import RelationshipNumerologyService
from .services.timing_numerology import TimingNumerologyService
from .services.name_correction import NameCorrectionService
from .services.spiritual_numerology import SpiritualNumerologyService
from .services.predictive_numerology import PredictiveNumerologyService
import os
import traceback
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_numerology_profile(request):
    """Calculate and save user's numerology profile."""
    user = request.user
    
    # Get full name from request data or user profile
    full_name = request.data.get('full_name')
    if not full_name:
        # Try to get full name from user object
        if hasattr(user, 'full_name') and user.full_name:
            full_name = user.full_name
        # Try to get full name from user profile
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            full_name = user.profile.full_name
    
    birth_date_str = request.data.get('birth_date')
    system = request.data.get('system', 'pythagorean')
    
    # Validate input
    if not full_name:
        return Response({
            'error': 'Full name is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not birth_date_str:
        # Try to get birth date from user profile
        if not (hasattr(user, 'profile') and hasattr(user.profile, 'date_of_birth') and user.profile.date_of_birth):
            return Response({
                'error': 'Birth date is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        birth_date = user.profile.date_of_birth
    else:
        try:
            # Import datetime module correctly
            from datetime import datetime as dt
            birth_date = dt.strptime(birth_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate name and birth date
    if not validate_name(full_name):
        return Response({
            'error': 'Invalid name format'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not validate_birth_date(birth_date):
        return Response({
            'error': 'Invalid birth date'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Calculate all numbers
        calculator = NumerologyCalculator(system=system)
        numbers = calculator.calculate_all(full_name, birth_date)
        
        # Calculate Lo Shu Grid
        lo_shu_grid = calculator.calculate_lo_shu_grid(full_name, birth_date)
        
        # Update or create profile
        profile, created = NumerologyProfile.objects.update_or_create(
            user=user,
            defaults={
                'life_path_number': numbers['life_path_number'],
                'destiny_number': numbers['destiny_number'],
                'soul_urge_number': numbers['soul_urge_number'],
                'personality_number': numbers['personality_number'],
                'attitude_number': numbers['attitude_number'],
                'maturity_number': numbers['maturity_number'],
                'balance_number': numbers['balance_number'],
                'personal_year_number': numbers['personal_year_number'],
                'personal_month_number': numbers['personal_month_number'],
                'karmic_debt_number': numbers.get('karmic_debt_number'),
                'hidden_passion_number': numbers.get('hidden_passion_number'),
                'subconscious_self_number': numbers.get('subconscious_self_number'),
                'lo_shu_grid': lo_shu_grid,
                'calculation_system': system
            }
        )
        
        serializer = NumerologyProfileSerializer(profile)
        
        # Trigger async AI reading generation (if Celery is available)
        try:
            from .tasks import generate_detailed_readings_for_profile
            generate_detailed_readings_for_profile.delay(str(user.id))
            logger.info(f'Queued AI reading generation for user {user.id}')
        except Exception as e:
            logger.warning(f'Failed to queue AI reading generation: {str(e)}')
            # Continue without AI generation - it's not critical
        
        return Response({
            'message': 'Profile calculated successfully',
            'profile': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': f'Calculation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_numerology_profile(request):
    """Get user's numerology profile."""
    # #region agent log
    user_id = str(request.user.id) if hasattr(request.user, 'id') else 'anonymous'
    auth_header = request.META.get('HTTP_AUTHORIZATION', 'none')
    logger.info(f'numerology_profile_get_request', extra={'user_id': user_id, 'auth_header_present': bool(auth_header and auth_header != 'none'), 'auth_header_prefix': auth_header[:20] if auth_header != 'none' else 'none', 'is_authenticated': request.user.is_authenticated})
    # #endregion
    user = request.user
    
    # Check cache first
    cached_profile = NumerologyCache.get_profile(str(user.id))
    if cached_profile:
        return Response(cached_profile, status=status.HTTP_200_OK)
    
    # Get from database
    try:
        profile = NumerologyProfile.objects.get(user=user)
        serializer = NumerologyProfileSerializer(profile)
        
        # Cache the result
        # Convert serializer data to dict to satisfy type checker
        profile_data = dict(serializer.data) if not isinstance(serializer.data, dict) else serializer.data
        NumerologyCache.set_profile(str(user.id), profile_data)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_birth_chart(request):
    """Get birth chart with interpretations."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
        
        # Get interpretations for all numbers
        interpretations = {}
        numbers = [
            ('life_path_number', profile.life_path_number),
            ('destiny_number', profile.destiny_number),
            ('soul_urge_number', profile.soul_urge_number),
            ('personality_number', profile.personality_number),
            ('attitude_number', profile.attitude_number),
            ('maturity_number', profile.maturity_number),
            ('balance_number', profile.balance_number),
            ('personal_year_number', profile.personal_year_number),
            ('personal_month_number', profile.personal_month_number),
        ]
        
        for field_name, number in numbers:
            try:
                interpretations[field_name] = get_interpretation(number)
            except ValueError:
                interpretations[field_name] = None
        
        serializer = BirthChartSerializer({
            'profile': profile,
            'interpretations': interpretations,
            'lo_shu_grid': profile.lo_shu_grid
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lo_shu_grid(request):
    """Get Lo Shu Grid for user with enhanced visualization."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'lo_shu_grid'):
        return Response({
            'error': 'Lo Shu Grid is available for Basic plan and above. Please upgrade your subscription.',
            'required_tier': 'basic',
            'feature': 'lo_shu_grid'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
        
        # Get user info
        user_full_name = None
        if hasattr(user, 'full_name') and user.full_name:
            user_full_name = user.full_name
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        if not user_full_name or not user.profile.date_of_birth:
            return Response({
                'error': 'Full name and birth date are required for Lo Shu Grid calculation.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if enhanced visualization is requested
        enhanced = request.query_params.get('enhanced', 'false').lower() == 'true'
        
        if enhanced:
            # Use enhanced service with arrows
            if not can_access_feature(user, 'numerology_lo_shu_visualization'):
                return Response({
                    'error': 'Enhanced Lo Shu Grid visualization is available for Premium plan and above.',
                    'required_tier': 'premium',
                    'feature': 'numerology_lo_shu_visualization'
                }, status=status.HTTP_403_FORBIDDEN)
            
            service = LoShuGridService(profile.calculation_system)
            lo_shu_grid = service.calculate_enhanced_grid(user_full_name, user.profile.date_of_birth)
        else:
            # Use basic calculation
            calculator = NumerologyCalculator(profile.calculation_system)
            lo_shu_grid = calculator.calculate_lo_shu_grid(user_full_name, user.profile.date_of_birth)
        
        # Save to profile (store basic version)
        if not profile.lo_shu_grid:
            profile.lo_shu_grid = {
                'grid': lo_shu_grid.get('grid', {}),
                'missing_numbers': lo_shu_grid.get('missing_numbers', []),
                'strong_numbers': lo_shu_grid.get('strong_numbers', []),
                'number_frequency': lo_shu_grid.get('number_frequency', {}),
                'interpretation': lo_shu_grid.get('interpretation', '')
            }
            profile.save()
        
        return Response(lo_shu_grid, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def compare_lo_shu_grids(request):
    """Compare Lo Shu Grids between two people."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'numerology_lo_shu_visualization'):
        return Response({
            'error': 'Grid comparison is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_lo_shu_visualization'
        }, status=status.HTTP_403_FORBIDDEN)
    
    person1_id = request.data.get('person1_id')
    person2_id = request.data.get('person2_id')
    
    if not person1_id or not person2_id:
        return Response({
            'error': 'Both person1_id and person2_id are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get person 1 (can be user or a Person)
        if person1_id == 'self':
            profile1 = NumerologyProfile.objects.get(user=user)
            person1_name = user.full_name or user.email
        else:
            person1 = Person.objects.get(id=person1_id, user=user, is_active=True)
            profile1 = PersonNumerologyProfile.objects.get(person=person1)
            person1_name = person1.name
        
        # Get person 2
        if person2_id == 'self':
            profile2 = NumerologyProfile.objects.get(user=user)
            person2_name = user.full_name or user.email
        else:
            person2 = Person.objects.get(id=person2_id, user=user, is_active=True)
            profile2 = PersonNumerologyProfile.objects.get(person=person2)
            person2_name = person2.name
        
        # Get grid data
        grid1_data = profile1.lo_shu_grid if hasattr(profile1, 'lo_shu_grid') and profile1.lo_shu_grid else None
        grid2_data = profile2.lo_shu_grid if hasattr(profile2, 'lo_shu_grid') and profile2.lo_shu_grid else None
        
        # Calculate grids if not stored
        service = LoShuGridService(profile1.calculation_system)
        
        if not grid1_data:
            # Need to calculate grid1
            if person1_id == 'self':
                user_full_name = user.full_name or (user.profile.full_name if hasattr(user, 'profile') else None)
                user_birth_date = user.profile.date_of_birth if hasattr(user, 'profile') else None
            else:
                user_full_name = person1.name
                user_birth_date = person1.birth_date
            
            if not user_full_name or not user_birth_date:
                return Response({
                    'error': 'Person 1 name and birth date are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            grid1_data = service.calculate_enhanced_grid(user_full_name, user_birth_date)
        
        if not grid2_data:
            # Need to calculate grid2
            if person2_id == 'self':
                user_full_name = user.full_name or (user.profile.full_name if hasattr(user, 'profile') else None)
                user_birth_date = user.profile.date_of_birth if hasattr(user, 'profile') else None
            else:
                user_full_name = person2.name
                user_birth_date = person2.birth_date
            
            if not user_full_name or not user_birth_date:
                return Response({
                    'error': 'Person 2 name and birth date are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            grid2_data = service.calculate_enhanced_grid(user_full_name, user_birth_date)
        
        # Compare grids
        comparison = service.compare_grids(
            grid1_data,
            grid2_data,
            person1_name,
            person2_name
        )
        
        return Response(comparison, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'One or both profiles not found. Please calculate profiles first.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Person.DoesNotExist:
        return Response({
            'error': 'One or both persons not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except PersonNumerologyProfile.DoesNotExist:
        return Response({
            'error': 'One or both person profiles not found. Please calculate profiles first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_birth_chart_pdf(request):
    """Export birth chart as PDF."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get user's full name safely
    user_full_name = "User"
    if hasattr(user, 'full_name') and user.full_name:
        user_full_name = user.full_name
    elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
        user_full_name = user.profile.full_name
    
    # Create PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="birth_chart_{user_full_name.replace(" ", "_")}.pdf"'
    
    # Create PDF document
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, f"Numerology Birth Chart for {user_full_name}")
    
    # User info
    p.setFont("Helvetica", 12)
    if hasattr(user, 'profile') and hasattr(user.profile, 'date_of_birth'):
        p.drawString(50, height - 80, f"Date of Birth: {user.profile.date_of_birth}")
    p.drawString(50, height - 100, f"Calculation Date: {profile.calculated_at.strftime('%Y-%m-%d')}")
    
    # Numbers table
    data = [
        ['Number Type', 'Value', 'Category'],
        ['Life Path', str(profile.life_path_number), 'Life'],
        ['Destiny', str(profile.destiny_number), 'Life'],
        ['Soul Urge', str(profile.soul_urge_number), 'Life'],
        ['Personality', str(profile.personality_number), 'Compatibility'],
        ['Attitude', str(profile.attitude_number), 'Compatibility'],
        ['Maturity', str(profile.maturity_number), 'Challenge'],
        ['Balance', str(profile.balance_number), 'Challenge'],
        ['Personal Year', str(profile.personal_year_number), 'Timing'],
        ['Personal Month', str(profile.personal_month_number), 'Timing'],
    ]
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    table.wrapOn(p, width, height)
    table.drawOn(p, 50, height - 300)
    
    # Footer
    p.setFont("Helvetica", 10)
    p.drawString(50, 50, "Generated by NumerAI - Your Personal Numerology Guide")
    
    p.showPage()
    p.save()
    
    # Get the value of the BytesIO buffer and write it to the response
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_reading(request):
    """Get daily numerology reading for user."""
    user = request.user
    reading_date_str = request.query_params.get('date')
    
    # Parse date or use today
    if reading_date_str:
        try:
            # Import datetime module correctly
            from datetime import datetime as dt
            reading_date = dt.strptime(reading_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        reading_date = date.today()
    
    # Check cache first
    cached_reading = NumerologyCache.get_daily_reading(str(user.id), str(reading_date))
    if cached_reading:
        return Response(cached_reading, status=status.HTTP_200_OK)
    
    try:
        # Get or create daily reading
        try:
            reading = DailyReading.objects.get(user=user, reading_date=reading_date)
        except DailyReading.DoesNotExist:
            # Validate user has profile with birth date
            if not user.profile.date_of_birth:
                return Response({
                    'error': 'Please complete your profile with birth date first'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate personal day number
            try:
                calculator = NumerologyCalculator()
                personal_day_number = calculator.calculate_personal_day_number(
                    user.profile.date_of_birth,
                    reading_date
                )
            except Exception as e:
                return Response({
                    'error': f'Failed to calculate personal day number: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's numerology profile for personalization
            try:
                numerology_profile = NumerologyProfile.objects.get(user=user)
                user_profile = {
                    'life_path_number': numerology_profile.life_path_number,
                    'destiny_number': numerology_profile.destiny_number,
                    'soul_urge_number': numerology_profile.soul_urge_number,
                    'personality_number': numerology_profile.personality_number,
                    'personal_year_number': numerology_profile.personal_year_number,
                }
                
                # Generate personalized reading
                try:
                    generator = DailyReadingGenerator()
                    reading_content = generator.generate_personalized_reading(personal_day_number, user_profile)
                except Exception as e:
                    return Response({
                        'error': f'Failed to generate personalized reading: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except NumerologyProfile.DoesNotExist:
                # Fall back to basic reading if no numerology profile
                try:
                    generator = DailyReadingGenerator()
                    reading_content = generator.generate_reading(personal_day_number)
                except Exception as e:
                    return Response({
                        'error': f'Failed to generate basic reading: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Create the reading in database
            try:
                reading = DailyReading.objects.create(
                    user=user,
                    reading_date=reading_date,
                    personal_day_number=personal_day_number,
                    lucky_number=reading_content['lucky_number'],
                    lucky_color=reading_content['lucky_color'],
                    auspicious_time=reading_content['auspicious_time'],
                    activity_recommendation=reading_content['activity_recommendation'],
                    warning=reading_content['warning'],
                    affirmation=reading_content['affirmation'],
                    actionable_tip=reading_content['actionable_tip']
                )
            except Exception as e:
                return Response({
                    'error': f'Failed to save reading to database: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
    except Exception as e:
        return Response({
            'error': f'Unexpected error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Serialize and return the reading
    try:
        serializer = DailyReadingSerializer(reading)
        
        # Cache the result
        try:
            # Convert serializer data to dict to satisfy type checker
            reading_data = dict(serializer.data) if not isinstance(serializer.data, dict) else serializer.data
            NumerologyCache.set_daily_reading(str(user.id), str(reading_date), reading_data)
        except Exception:
            # Don't fail if caching fails
            pass
            
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Failed to serialize reading: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reading_history(request):
    """Get paginated reading history."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get readings
    readings = DailyReading.objects.filter(user=user).order_by('-reading_date')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_readings = readings[start:end]
    
    serializer = DailyReadingSerializer(paginated_readings, many=True)
    
    return Response({
        'count': readings.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_life_path_analysis(request):
    """Get detailed life path number analysis."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get life path interpretation
        interpretation = get_interpretation(profile.life_path_number)
        
        # Calculate pinnacle cycles
        calculator = NumerologyCalculator()
        pinnacle_data = calculator.calculate_pinnacles(user.profile.date_of_birth)
        
        serializer = LifePathAnalysisSerializer({
            'life_path_number': profile.life_path_number,
            'interpretation': interpretation,
            'pinnacle_cycles': pinnacle_data
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Failed to generate life path analysis: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_compatibility(request):
    """Check compatibility between user and another person."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'compatibility_insights'):
        return Response({
            'error': 'Compatibility Analysis is available for Premium plan and above. Please upgrade your subscription.',
            'required_tier': 'premium',
            'feature': 'compatibility_insights'
        }, status=status.HTTP_403_FORBIDDEN)
    
    partner_name = request.data.get('partner_name')
    partner_birth_date_str = request.data.get('partner_birth_date')
    
    # Validate input
    if not partner_name or not partner_birth_date_str:
        return Response({
            'error': 'Partner name and birth date are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        partner_birth_date = datetime.strptime(partner_birth_date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate birth dates
    if not validate_birth_date(partner_birth_date):
        return Response({
            'error': 'Invalid partner birth date'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get user's numerology profile
        user_profile = NumerologyProfile.objects.get(user=user)
        
        # Calculate partner's numerology profile
        calculator = NumerologyCalculator()
        partner_numbers = calculator.calculate_all(partner_name, partner_birth_date)
        
        # Get user's full name - try multiple sources
        user_full_name = None
        if hasattr(user, 'full_name') and user.full_name:
            user_full_name = user.full_name
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        # Validate that user has a full name
        if not user_full_name:
            return Response({
                'error': 'User full name is required. Please update your profile.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate that user has a birth date
        user_birth_date = None
        if hasattr(user, 'profile') and hasattr(user.profile, 'date_of_birth') and user.profile.date_of_birth:
            user_birth_date = user.profile.date_of_birth
        # Fallback to user profile's date_of_birth if it exists
        elif hasattr(user_profile, 'user') and hasattr(user_profile.user, 'profile') and hasattr(user_profile.user.profile, 'date_of_birth') and user_profile.user.profile.date_of_birth:
            user_birth_date = user_profile.user.profile.date_of_birth
        else:
            return Response({
                'error': 'User birth date is required. Please update your profile.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure user_birth_date is a date object, not datetime
        if hasattr(user_birth_date, 'date') and callable(getattr(user_birth_date, 'date', None)):
            user_birth_date = user_birth_date.date()
        
        # Analyze compatibility
        analyzer = CompatibilityAnalyzer()
        compatibility_result = analyzer.analyze_compatibility(
            user_full_name,
            user_birth_date,
            partner_name,
            partner_birth_date
        )
        
        # Save compatibility check
        compatibility_check = CompatibilityCheck.objects.create(
            user=user,
            partner_name=partner_name,
            partner_birth_date=partner_birth_date,
            relationship_type=request.data.get('relationship_type', 'romantic'),
            compatibility_score=compatibility_result['compatibility_score'],
            strengths=compatibility_result['strengths'],
            challenges=compatibility_result['challenges'],
            advice=compatibility_result['advice']
        )
        
        serializer = CompatibilityCheckSerializer(compatibility_check)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except AttributeError as e:
        # Handle case where user profile attributes are missing
        return Response({
            'error': f'Missing required user profile information: {str(e)}. Please update your profile.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the full traceback for debugging
        error_details = traceback.format_exc()
        print(f"Compatibility check error: {str(e)}")
        print(f"Traceback: {error_details}")
        
        return Response({
            'error': f'Compatibility check failed: {str(e)}',
            'details': error_details
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_compatibility_history(request):
    """Get compatibility check history."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get compatibility checks
    checks = CompatibilityCheck.objects.filter(user=user).order_by('-created_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_checks = checks[start:end]
    
    serializer = CompatibilityCheckSerializer(paginated_checks, many=True)
    
    return Response({
        'count': checks.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_personalized_remedies(request):
    """Get personalized remedies based on user's numerology profile."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'rectification_suggestions'):
        return Response({
            'error': 'Personalized Remedies are available for Premium plan and above. Please upgrade your subscription.',
            'required_tier': 'premium',
            'feature': 'rectification_suggestions'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if remedies already exist
    existing_remedies = Remedy.objects.filter(user=user, is_active=True)
    if existing_remedies.exists():
        serializer = RemedySerializer(existing_remedies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    try:
        # Generate new remedies based on numerology profile
        remedies = []
        
        # Gemstone remedy
        gemstone_remedies = {
            1: {"title": "Ruby for Leadership", "description": "Enhances leadership qualities and confidence", "recommendation": "Wear as a ring on the right hand on Sunday"},
            2: {"title": "Pearl for Harmony", "description": "Promotes peace and emotional balance", "recommendation": "Wear as a pendant on Monday"},
            3: {"title": "Yellow Sapphire for Creativity", "description": "Boosts creativity and communication", "recommendation": "Wear as a ring on Thursday"},
            4: {"title": "Emerald for Stability", "description": "Brings stability and growth", "recommendation": "Wear as a pendant on Wednesday"},
            5: {"title": "Peridot for Freedom", "description": "Enhances adaptability and freedom", "recommendation": "Wear as a ring on Wednesday"},
            6: {"title": "Pink Tourmaline for Love", "description": "Attracts love and harmony", "recommendation": "Wear as a pendant on Friday"},
            7: {"title": "Amethyst for Wisdom", "description": "Enhances intuition and wisdom", "recommendation": "Wear as a ring on Saturday"},
            8: {"title": "Diamond for Power", "description": "Brings success and abundance", "recommendation": "Wear as a ring on Saturday"},
            9: {"title": "Bloodstone for Compassion", "description": "Enhances compassion and healing", "recommendation": "Wear as a pendant on Tuesday"},
            11: {"title": "White Sapphire for Illumination", "description": "Enhances spiritual insight", "recommendation": "Wear as a ring on Sunday"},
            22: {"title": "Blue Sapphire for Mastery", "description": "Enhances leadership and vision", "recommendation": "Wear as a pendant on Saturday"},
            33: {"title": "Clear Quartz for Teaching", "description": "Enhances healing and teaching abilities", "recommendation": "Wear as a pendant on Sunday"}
        }
        
        if profile.life_path_number in gemstone_remedies:
            gemstone_data = gemstone_remedies[profile.life_path_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='gemstone',
                title=gemstone_data['title'],
                description=gemstone_data['description'],
                recommendation=gemstone_data['recommendation']
            )
            remedies.append(remedy)
        
        # Color remedy
        color_remedies = {
            1: {"title": "Red for Energy", "description": "Boosts energy and vitality", "recommendation": "Incorporate red in clothing or home decor on Sundays"},
            2: {"title": "Silver for Harmony", "description": "Promotes peace and balance", "recommendation": "Incorporate silver in clothing or accessories on Mondays"},
            3: {"title": "Yellow for Creativity", "description": "Enhances creativity and joy", "recommendation": "Incorporate yellow in clothing or home decor on Thursdays"},
            4: {"title": "Green for Growth", "description": "Brings stability and growth", "recommendation": "Incorporate green in clothing or home decor on Wednesdays"},
            5: {"title": "Orange for Freedom", "description": "Enhances adaptability and change", "recommendation": "Incorporate orange in clothing or home decor on Wednesdays"},
            6: {"title": "Pink for Love", "description": "Attracts love and harmony", "recommendation": "Incorporate pink in clothing or home decor on Fridays"},
            7: {"title": "Purple for Wisdom", "description": "Enhances intuition and spirituality", "recommendation": "Incorporate purple in clothing or home decor on Saturdays"},
            8: {"title": "White for Power", "description": "Brings success and clarity", "recommendation": "Incorporate white in clothing or home decor on Saturdays"},
            9: {"title": "Blue for Compassion", "description": "Enhances compassion and healing", "recommendation": "Incorporate blue in clothing or home decor on Tuesdays"},
            11: {"title": "White for Illumination", "description": "Enhances spiritual insight", "recommendation": "Incorporate white in clothing or home decor on Sundays"},
            22: {"title": "Blue for Mastery", "description": "Enhances leadership and vision", "recommendation": "Incorporate blue in clothing or home decor on Saturdays"},
            33: {"title": "Clear for Teaching", "description": "Enhances healing and teaching abilities", "recommendation": "Incorporate clear/white in clothing or home decor on Sundays"}
        }
        
        if profile.life_path_number in color_remedies:
            color_data = color_remedies[profile.life_path_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='color',
                title=color_data['title'],
                description=color_data['description'],
                recommendation=color_data['recommendation']
            )
            remedies.append(remedy)
        
        # Ritual remedy
        ritual_remedies = {
            1: {"title": "Morning Affirmations", "description": "Boost confidence and set intentions", "recommendation": "Practice 10 minutes of affirmations each morning"},
            2: {"title": "Meditation for Peace", "description": "Promote inner harmony", "recommendation": "Practice 15 minutes of meditation daily"},
            3: {"title": "Creative Expression", "description": "Enhance self-expression", "recommendation": "Engage in creative activities for 30 minutes daily"},
            4: {"title": "Grounding Exercises", "description": "Build stability", "recommendation": "Practice grounding exercises like walking barefoot for 10 minutes"},
            5: {"title": "Adventure Time", "description": "Embrace change and freedom", "recommendation": "Try something new once a week"},
            6: {"title": "Heart Opening", "description": "Cultivate love and compassion", "recommendation": "Practice heart-opening yoga poses 3 times a week"},
            7: {"title": "Study Time", "description": "Enhance wisdom and knowledge", "recommendation": "Dedicate 30 minutes daily to learning"},
            8: {"title": "Goal Setting", "description": "Focus on success and abundance", "recommendation": "Review and set goals weekly"},
            9: {"title": "Service to Others", "description": "Express compassion", "recommendation": "Perform one act of service weekly"},
            11: {"title": "Spiritual Practice", "description": "Enhance spiritual connection", "recommendation": "Practice spiritual activities daily"},
            22: {"title": "Vision Planning", "description": "Work on big dreams", "recommendation": "Dedicate time monthly to vision planning"},
            33: {"title": "Healing Practice", "description": "Develop healing abilities", "recommendation": "Practice healing techniques weekly"}
        }
        
        if profile.life_path_number in ritual_remedies:
            ritual_data = ritual_remedies[profile.life_path_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='ritual',
                title=ritual_data['title'],
                description=ritual_data['description'],
                recommendation=ritual_data['recommendation']
            )
            remedies.append(remedy)
        
        # Add personalized remedies based on other numerology numbers
        # Mantra remedy based on Soul Urge Number
        soul_urge_mantras = {
            1: {"title": "Mantra for Leadership", "description": "Enhance your leadership qualities", "recommendation": "Chant 'Om Hum' 108 times on Sundays for confidence"},
            2: {"title": "Mantra for Harmony", "description": "Promote peace and balance", "recommendation": "Chant 'Om Shantih' 108 times on Mondays for harmony"},
            3: {"title": "Mantra for Creativity", "description": "Boost creativity and communication", "recommendation": "Chant 'Om Aim' 108 times on Thursdays for creativity"},
            4: {"title": "Mantra for Stability", "description": "Bring stability and focus", "recommendation": "Chant 'Om Hrim' 108 times on Wednesdays for stability"},
            5: {"title": "Mantra for Freedom", "description": "Enhance adaptability and change", "recommendation": "Chant 'Om Pim' 108 times on Wednesdays for freedom"},
            6: {"title": "Mantra for Love", "description": "Attract love and harmony", "recommendation": "Chant 'Om Shrim' 108 times on Fridays for love"},
            7: {"title": "Mantra for Wisdom", "description": "Enhance intuition and wisdom", "recommendation": "Chant 'Om Aum' 108 times on Saturdays for wisdom"},
            8: {"title": "Mantra for Power", "description": "Bring success and abundance", "recommendation": "Chant 'Om Mahalakshmiyei Swaha' 108 times on Saturdays for abundance"},
            9: {"title": "Mantra for Compassion", "description": "Enhance compassion and healing", "recommendation": "Chant 'Om Mani Padme Hum' 108 times on Tuesdays for compassion"},
            11: {"title": "Mantra for Illumination", "description": "Enhance spiritual insight", "recommendation": "Chant 'Om Namah Shivaya' 108 times on Sundays for spiritual growth"},
            22: {"title": "Mantra for Mastery", "description": "Enhance leadership and vision", "recommendation": "Chant 'Om Gam Ganapataye Namaha' 108 times on Saturdays for removing obstacles"},
            33: {"title": "Mantra for Teaching", "description": "Enhance healing and teaching abilities", "recommendation": "Chant 'Om Tare Tuttare Ture Soha' 108 times on Sundays for compassion"}
        }
        
        if profile.soul_urge_number in soul_urge_mantras:
            mantra_data = soul_urge_mantras[profile.soul_urge_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='mantra',
                title=mantra_data['title'],
                description=mantra_data['description'],
                recommendation=mantra_data['recommendation']
            )
            remedies.append(remedy)
        
        # Dietary remedy based on Personality Number
        personality_diet = {
            1: {"title": "Foods for Energy", "description": "Boost energy and vitality", "recommendation": "Include protein-rich foods like eggs, nuts, and lean meats. Eat spicy foods for energy."},
            2: {"title": "Foods for Harmony", "description": "Promote peace and balance", "recommendation": "Focus on dairy products, fruits, and温和 foods. Avoid overly spicy or acidic foods."},
            3: {"title": "Foods for Creativity", "description": "Enhance creativity and joy", "recommendation": "Include colorful fruits and vegetables. Add natural sweeteners like honey for joy."},
            4: {"title": "Foods for Stability", "description": "Bring stability and grounding", "recommendation": "Focus on root vegetables, grains, and hearty foods. Eat regular, balanced meals."},
            5: {"title": "Foods for Freedom", "description": "Enhance adaptability and change", "recommendation": "Include variety in your diet. Try new foods and cuisines regularly."},
            6: {"title": "Foods for Love", "description": "Attract love and harmony", "recommendation": "Include heart-healthy foods like berries, dark chocolate, and leafy greens."},
            7: {"title": "Foods for Wisdom", "description": "Enhance intuition and spirituality", "recommendation": "Focus on light, pure foods. Include fish, nuts, and fresh herbs."},
            8: {"title": "Foods for Power", "description": "Bring success and abundance", "recommendation": "Include foods that support energy and focus like green tea, dark chocolate, and whole grains."},
            9: {"title": "Foods for Compassion", "description": "Enhance compassion and healing", "recommendation": "Focus on plant-based foods and cleansing foods like lemon water and green tea."},
            11: {"title": "Foods for Illumination", "description": "Enhance spiritual insight", "recommendation": "Include foods that enhance mental clarity like blueberries, walnuts, and turmeric."},
            22: {"title": "Foods for Mastery", "description": "Enhance leadership and vision", "recommendation": "Focus on foods that support brain function like salmon, avocados, and leafy greens."},
            33: {"title": "Foods for Teaching", "description": "Enhance healing and teaching abilities", "recommendation": "Include anti-inflammatory foods like ginger, turmeric, and leafy greens."}
        }
        
        if profile.personality_number in personality_diet:
            diet_data = personality_diet[profile.personality_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='dietary',
                title=diet_data['title'],
                description=diet_data['description'],
                recommendation=diet_data['recommendation']
            )
            remedies.append(remedy)
        
        # Exercise remedy based on Personal Year Number
        personal_year_exercise = {
            1: {"title": "Exercise for New Beginnings", "description": "Boost energy for new initiatives", "recommendation": "Try high-energy activities like running, martial arts, or competitive sports."},
            2: {"title": "Exercise for Partnership", "description": "Promote cooperation and balance", "recommendation": "Participate in partner activities like dancing, tennis, or yoga classes."},
            3: {"title": "Exercise for Expression", "description": "Enhance creativity and communication", "recommendation": "Try expressive activities like dance, aerobics, or group fitness classes."},
            4: {"title": "Exercise for Stability", "description": "Build structure and discipline", "recommendation": "Focus on structured activities like weight training, hiking, or regular gym routines."},
            5: {"title": "Exercise for Change", "description": "Embrace freedom and adventure", "recommendation": "Try varied activities like cycling, swimming, or outdoor adventures."},
            6: {"title": "Exercise for Harmony", "description": "Cultivate love and service", "recommendation": "Practice activities that connect you with others like group sports or community walks."},
            7: {"title": "Exercise for Wisdom", "description": "Enhance introspection and knowledge", "recommendation": "Focus on mindful activities like yoga, tai chi, or meditation walks."},
            8: {"title": "Exercise for Achievement", "description": "Focus on success and power", "recommendation": "Engage in goal-oriented activities like personal training or competitive sports."},
            9: {"title": "Exercise for Completion", "description": "Express compassion and service", "recommendation": "Participate in activities that serve others like charity runs or community sports."}
        }
        
        if profile.personal_year_number in personal_year_exercise:
            exercise_data = personal_year_exercise[profile.personal_year_number]
            remedy = Remedy.objects.create(
                user=user,
                remedy_type='exercise',
                title=exercise_data['title'],
                description=exercise_data['description'],
                recommendation=exercise_data['recommendation']
            )
            remedies.append(remedy)
        
        serializer = RemedySerializer(remedies, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to generate remedies: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_remedy(request, remedy_id):
    """Track remedy practice."""
    user = request.user
    date_str = request.data.get('date')
    is_completed = request.data.get('is_completed', False)
    notes = request.data.get('notes', '')
    
    # Parse date
    if date_str:
        try:
            track_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        track_date = date.today()
    
    try:
        # Get remedy
        remedy = Remedy.objects.get(id=remedy_id, user=user)
        
        # Create or update tracking
        tracking, created = RemedyTracking.objects.update_or_create(
            user=user,
            remedy=remedy,
            date=track_date,
            defaults={
                'is_completed': is_completed,
                'notes': notes
            }
        )
        
        serializer = RemedyTrackingSerializer(tracking)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
    
    except Remedy.DoesNotExist:
        return Response({
            'error': 'Remedy not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to track remedy: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_full_numerology_report(request):
    """Get comprehensive full numerology report combining birth date, name, and phone numerology."""
    from .subscription_utils import get_user_subscription_tier, get_available_features, can_access_feature
    from .remedy_generator import generate_rectification_suggestions
    from .serializers import FullNumerologyReportSerializer
    
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get subscription tier and available features
        subscription_tier = get_user_subscription_tier(user)
        available_features = get_available_features(user)
        
        # Get user's full name safely
        user_full_name = user.full_name if hasattr(user, 'full_name') and user.full_name else "User"
        if user_full_name == "User" and hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        # Get user birth date safely
        user_birth_date = None
        if hasattr(user, 'profile') and hasattr(user.profile, 'date_of_birth'):
            user_birth_date = user.profile.date_of_birth
        
        # Birth date numerology (always available)
        birth_date_interpretations = {}
        number_fields = [
            'life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number',
            'attitude_number', 'maturity_number', 'balance_number',
            'personal_year_number', 'personal_month_number'
        ]
        
        for field in number_fields:
            number_value = getattr(profile, field)
            try:
                birth_date_interpretations[field] = get_interpretation(number_value)
            except ValueError:
                birth_date_interpretations[field] = None
        
        # Name numerology (subscription-gated)
        name_report = None
        if can_access_feature(user, 'name_numerology'):
            name_report = NameReport.objects.filter(user=user).order_by('-computed_at').first()
        
        # Phone numerology (subscription-gated)
        phone_report = None
        if can_access_feature(user, 'phone_numerology'):
            phone_report = PhoneReport.objects.filter(user=user).order_by('-computed_at').first()
        
        # Lo Shu Grid (subscription-gated)
        lo_shu_grid = None
        if can_access_feature(user, 'lo_shu_grid') and profile.lo_shu_grid:
            lo_shu_grid = profile.lo_shu_grid
        
        # Rectification suggestions (subscription-gated)
        rectification_suggestions = []
        if can_access_feature(user, 'rectification_suggestions'):
            rectification_suggestions = generate_rectification_suggestions(
                profile=profile,
                name_report=name_report,
                phone_report=phone_report,
                subscription_tier=subscription_tier
            )
        
        # Detailed analysis (subscription-gated) - Include AI-generated readings
        detailed_analysis = None
        if can_access_feature(user, 'detailed_analysis'):
            from .models import DetailedReading
            from .ai_reading_generator import generate_detailed_reading
            from .tasks import generate_detailed_readings_for_profile
            import logging
            
            logger = logging.getLogger(__name__)
            
            # Try to get existing AI-generated readings
            detailed_readings = {}
            core_numbers = {
                'life_path': profile.life_path_number,
                'destiny': profile.destiny_number,
                'soul_urge': profile.soul_urge_number,
                'personality': profile.personality_number,
            }
            
            # Add optional numbers if they exist
            if profile.attitude_number:
                core_numbers['attitude'] = profile.attitude_number
            if profile.maturity_number:
                core_numbers['maturity'] = profile.maturity_number
            if profile.balance_number:
                core_numbers['balance'] = profile.balance_number
            
            missing_readings = []
            for reading_type, number_value in core_numbers.items():
                if not number_value:
                    continue
                    
                try:
                    reading = DetailedReading.objects.get(
                        user=user,
                        reading_type=reading_type,
                        number=number_value
                    )
                    detailed_readings[reading_type] = {
                        'detailed_interpretation': reading.detailed_interpretation,
                        'career_insights': reading.career_insights,
                        'relationship_insights': reading.relationship_insights,
                        'life_purpose': reading.life_purpose,
                        'challenges_and_growth': reading.challenges_and_growth,
                        'personalized_advice': reading.personalized_advice,
                        'generated_at': reading.generated_at.isoformat() if reading.generated_at else None,
                        'ai_generated': True,
                    }
                except DetailedReading.DoesNotExist:
                    missing_readings.append((reading_type, number_value))
                    # Fallback to basic interpretation if AI reading not available
                    basic_interp = birth_date_interpretations.get(f'{reading_type}_number', {})
                    if isinstance(basic_interp, dict):
                        detailed_readings[reading_type] = {
                            'detailed_interpretation': basic_interp.get('description', '') if basic_interp else '',
                            'career_insights': ', '.join(basic_interp.get('career', [])) if isinstance(basic_interp.get('career'), list) else (basic_interp.get('career', '') if basic_interp else ''),
                            'relationship_insights': basic_interp.get('relationships', '') if basic_interp else '',
                            'life_purpose': basic_interp.get('life_purpose', '') if basic_interp else '',
                            'challenges_and_growth': ', '.join(basic_interp.get('challenges', [])) if isinstance(basic_interp.get('challenges'), list) else (basic_interp.get('challenges', '') if basic_interp else ''),
                            'personalized_advice': basic_interp.get('advice', '') if basic_interp else '',
                            'generated_at': None,
                            'ai_generated': False,
                            'note': 'AI-generated reading not available. Using basic interpretation.',
                        }
                    else:
                        detailed_readings[reading_type] = {
                            'detailed_interpretation': '',
                            'career_insights': '',
                            'relationship_insights': '',
                            'life_purpose': '',
                            'challenges_and_growth': '',
                            'personalized_advice': '',
                            'generated_at': None,
                            'ai_generated': False,
                            'note': 'AI-generated reading not available.',
                        }
            
            # Trigger async generation for missing readings (non-blocking)
            if missing_readings:
                try:
                    generate_detailed_readings_for_profile.delay(str(user.id))
                    logger.info(f'Queued AI reading generation for {len(missing_readings)} missing readings for user {user.id}')
                except Exception as e:
                    logger.warning(f'Failed to queue AI reading generation: {str(e)}')
            
            detailed_analysis = detailed_readings
        
        # Compatibility insights (subscription-gated)
        compatibility_insights = []
        if can_access_feature(user, 'compatibility_insights'):
            if hasattr(user, 'compatibility_checks'):
                recent_checks = user.compatibility_checks.order_by('-created_at')[:5]
                for check in recent_checks:
                    compatibility_insights.append({
                        'partner_name': check.partner_name,
                        'compatibility_score': check.compatibility_score,
                        'relationship_type': check.relationship_type,
                        'strengths': check.strengths,
                        'challenges': check.challenges,
                        'advice': check.advice,
                    })
        
        # Raj Yog analysis (elite only)
        raj_yog_analysis = None
        if can_access_feature(user, 'raj_yog_analysis'):
            try:
                raj_yog = RajYogDetection.objects.filter(user=user).order_by('-detected_at').first()
                if raj_yog:
                    raj_yog_analysis = {
                        'is_detected': raj_yog.is_detected,
                        'yog_type': raj_yog.yog_type,
                        'yog_name': raj_yog.yog_name,
                        'strength_score': raj_yog.strength_score,
                        'contributing_numbers': raj_yog.contributing_numbers,
                        'detected_combinations': raj_yog.detected_combinations,
                    }
            except Exception:
                pass
        
        # Yearly forecast (elite only)
        yearly_forecast = None
        if can_access_feature(user, 'yearly_forecast'):
            try:
                from datetime import date
                current_year = date.today().year
                yearly_report = YearlyReport.objects.filter(user=user, year=current_year).first()
                if yearly_report:
                    yearly_forecast = {
                        'year': yearly_report.year,
                        'personal_year_number': yearly_report.personal_year_number,
                        'annual_overview': yearly_report.annual_overview,
                        'major_themes': yearly_report.major_themes,
                        'opportunities': yearly_report.opportunities,
                        'challenges': yearly_report.challenges,
                    }
            except Exception:
                pass
        
        # Expert recommendations (elite only)
        expert_recommendations = []
        if can_access_feature(user, 'expert_recommendations'):
            # This would typically come from expert consultations or AI analysis
            # For now, provide general recommendations based on profile
            if profile.karmic_debt_number:
                expert_recommendations.append({
                    'type': 'karmic_debt',
                    'title': f'Address Karmic Debt {profile.karmic_debt_number}',
                    'description': 'Consider consulting with a numerology expert to understand and work through your karmic debt.',
                })
            if profile.life_path_number in [11, 22, 33]:
                expert_recommendations.append({
                    'type': 'master_number',
                    'title': f'Master Number Guidance',
                    'description': 'Master numbers require special understanding. Consider expert consultation for deeper insights.',
                })
        
        # Pinnacle Cycles (premium feature - part of detailed analysis)
        pinnacle_cycles = None
        if can_access_feature(user, 'detailed_analysis') and user_birth_date:
            from .numerology import NumerologyCalculator
            from .interpretations import get_interpretation
            
            calculator = NumerologyCalculator()
            pinnacle_numbers = calculator.calculate_pinnacles(user_birth_date)
            challenge_numbers = calculator.calculate_challenges(user_birth_date)
            
            # Calculate age ranges for pinnacle cycles
            # Standard formula: P1: 0 to (36 - life_path), P2: (36 - life_path) to (36 - life_path) + 9, etc.
            life_path = profile.life_path_number
            if life_path in [11, 22, 33]:
                # Master numbers use reduced value for age calculation
                life_path_reduced = calculator._reduce_to_single_digit(life_path, False)
            else:
                life_path_reduced = life_path
            
            p1_start = 0
            p1_end = max(27, 36 - life_path_reduced)
            p2_start = p1_end
            p2_end = p1_end + 9
            p3_start = p2_end
            p3_end = p2_end + 9
            p4_start = p3_end
            
            pinnacle_cycles = []
            for i, pinnacle_num in enumerate(pinnacle_numbers, 1):
                challenge_num = challenge_numbers[i-1] if i-1 < len(challenge_numbers) else None
                
                if i == 1:
                    age_range = f"Birth to {p1_end}"
                elif i == 2:
                    age_range = f"{p2_start} to {p2_end}"
                elif i == 3:
                    age_range = f"{p3_start} to {p3_end}"
                else:
                    age_range = f"{p4_start} onwards"
                
                try:
                    pinnacle_interp = get_interpretation(pinnacle_num)
                    challenge_interp = get_interpretation(challenge_num) if challenge_num else None
                except ValueError:
                    pinnacle_interp = None
                    challenge_interp = None
                
                pinnacle_cycles.append({
                    'cycle_number': i,
                    'pinnacle_number': pinnacle_num,
                    'age_range': age_range,
                    'start_age': p1_start if i == 1 else (p2_start if i == 2 else (p3_start if i == 3 else p4_start)),
                    'end_age': p1_end if i == 1 else (p2_end if i == 2 else (p3_end if i == 3 else None)),
                    'theme': pinnacle_interp.get('title', '') if pinnacle_interp else '',
                    'description': pinnacle_interp.get('description', '') if pinnacle_interp else '',
                    'challenge_number': challenge_num,
                    'challenge_description': challenge_interp.get('description', '') if challenge_interp else '',
                })
        
        # Challenges & Opportunities Analysis (premium feature)
        challenges_opportunities = None
        if can_access_feature(user, 'detailed_analysis') and user_birth_date:
            from .numerology import NumerologyCalculator
            from .interpretations import get_interpretation
            
            calculator = NumerologyCalculator()
            challenge_numbers = calculator.calculate_challenges(user_birth_date)
            
            challenges = []
            opportunities = []
            
            # Analyze challenges
            for i, challenge_num in enumerate(challenge_numbers, 1):
                if challenge_num and challenge_num > 0:
                    try:
                        challenge_interp = get_interpretation(challenge_num)
                        challenges.append({
                            'cycle': i,
                            'number': challenge_num,
                            'title': challenge_interp.get('title', ''),
                            'description': challenge_interp.get('description', ''),
                            'lessons': ', '.join(challenge_interp.get('challenges', [])) if isinstance(challenge_interp.get('challenges'), list) else challenge_interp.get('challenges', ''),
                        })
                    except ValueError:
                        pass
            
            # Analyze opportunities based on profile
            # Opportunities come from alignment of numbers
            if profile.personal_year_number:
                try:
                    year_interp = get_interpretation(profile.personal_year_number)
                    opportunities.append({
                        'type': 'personal_year',
                        'number': profile.personal_year_number,
                        'title': f'Personal Year {profile.personal_year_number} Opportunities',
                        'description': year_interp.get('description', ''),
                        'focus_areas': ', '.join(year_interp.get('strengths', [])) if isinstance(year_interp.get('strengths'), list) else year_interp.get('strengths', ''),
                    })
                except ValueError:
                    pass
            
            # Karmic debt as opportunity for growth
            if profile.karmic_debt_number:
                opportunities.append({
                    'type': 'karmic_growth',
                    'number': profile.karmic_debt_number,
                    'title': f'Karmic Debt {profile.karmic_debt_number} - Growth Opportunity',
                    'description': f'Working through karmic debt {profile.karmic_debt_number} presents opportunities for deep spiritual growth and resolution of past patterns.',
                })
            
            # Master number opportunities
            if profile.life_path_number in [11, 22, 33]:
                opportunities.append({
                    'type': 'master_number',
                    'number': profile.life_path_number,
                    'title': f'Master Number {profile.life_path_number} Potential',
                    'description': f'Master number {profile.life_path_number} offers exceptional opportunities for spiritual leadership and higher purpose fulfillment.',
                })
            
            challenges_opportunities = {
                'challenges': challenges,
                'opportunities': opportunities,
            }
        
        # Build response data
        report_data = {
            'user_profile': {
                'full_name': user_full_name,
                'email': user.email,
                'date_of_birth': user_birth_date.isoformat() if user_birth_date else None,
                'calculation_date': profile.calculated_at.isoformat() if profile.calculated_at else None,
            },
            'subscription_tier': subscription_tier,
            'available_features': available_features,
            'birth_date_numerology': profile,
            'birth_date_interpretations': birth_date_interpretations,
            'name_numerology': name_report,
            'name_numerology_available': can_access_feature(user, 'name_numerology'),
            'phone_numerology': phone_report,
            'phone_numerology_available': can_access_feature(user, 'phone_numerology'),
            'lo_shu_grid': lo_shu_grid,
            'lo_shu_grid_available': can_access_feature(user, 'lo_shu_grid'),
            'rectification_suggestions': rectification_suggestions,
            'rectification_suggestions_available': can_access_feature(user, 'rectification_suggestions'),
            'detailed_analysis': detailed_analysis,
            'detailed_analysis_available': can_access_feature(user, 'detailed_analysis'),
            'ai_generated_readings': detailed_analysis is not None,  # Indicate if AI readings are included
            'compatibility_insights': compatibility_insights,
            'compatibility_insights_available': can_access_feature(user, 'compatibility_insights'),
            'raj_yog_analysis': raj_yog_analysis,
            'raj_yog_analysis_available': can_access_feature(user, 'raj_yog_analysis'),
            'yearly_forecast': yearly_forecast,
            'yearly_forecast_available': can_access_feature(user, 'yearly_forecast'),
            'expert_recommendations': expert_recommendations,
            'expert_recommendations_available': can_access_feature(user, 'expert_recommendations'),
            'pinnacle_cycles': pinnacle_cycles,
            'pinnacle_cycles_available': can_access_feature(user, 'detailed_analysis'),
            'challenges_opportunities': challenges_opportunities,
            'challenges_opportunities_available': can_access_feature(user, 'detailed_analysis'),
        }
        
        serializer = FullNumerologyReportSerializer(report_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f'Error generating full numerology report for user {user.id}: {str(e)}\n{traceback.format_exc()}')
        error_response = {
            'error': 'Failed to generate full numerology report',
            'message': str(e) if settings.DEBUG else 'An error occurred while generating your report. Please try again later.'
        }
        if settings.DEBUG:
            error_response['traceback'] = traceback.format_exc()
        return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_full_numerology_report_pdf(request):
    """Export comprehensive numerology report as PDF."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's full name safely
    user_full_name = "User"
    if hasattr(user, 'full_name') and user.full_name:
        user_full_name = user.full_name
    elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
        user_full_name = user.profile.full_name
    
    # Create PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="numerology_report_{user_full_name.replace(" ", "_")}.pdf"'
    
    # Create PDF document
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, f"Numerology Report for {user_full_name}")
    
    # User info
    p.setFont("Helvetica", 12)
    if hasattr(user, 'profile') and hasattr(user.profile, 'date_of_birth'):
        p.drawString(50, height - 80, f"Date of Birth: {user.profile.date_of_birth}")
    p.drawString(50, height - 100, f"Report Generated: {timezone.now().strftime('%Y-%m-%d')}")
    
    # Core Numbers section
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 140, "Core Numbers")
    
    p.setFont("Helvetica", 12)
    y_position = height - 170
    core_numbers = [
        ('Life Path', profile.life_path_number),
        ('Destiny', profile.destiny_number),
        ('Soul Urge', profile.soul_urge_number),
        ('Personality', profile.personality_number),
    ]
    
    for name, value in core_numbers:
        p.drawString(70, y_position, f"{name} Number: {value}")
        y_position -= 20
    
    # Timing Numbers section
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y_position - 20, "Timing Numbers")
    
    p.setFont("Helvetica", 12)
    y_position -= 50
    timing_numbers = [
        ('Personal Year', profile.personal_year_number),
        ('Personal Month', profile.personal_month_number),
    ]
    
    for name, value in timing_numbers:
        p.drawString(70, y_position, f"{name} Number: {value}")
        y_position -= 20
    
    # Footer
    p.setFont("Helvetica", 10)
    p.drawString(50, 50, "Generated by NumerAI - Your Personal Numerology Guide")
    
    p.showPage()
    p.save()
    
    # Get the value of the BytesIO buffer and write it to the response
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def people_list_create(request):
    """List all people or create a new person."""
    if request.method == 'GET':
        people = Person.objects.filter(user=request.user, is_active=True)
        serializer = PersonSerializer(people, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = PersonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def person_detail(request, person_id):
    """Get, update, or delete a specific person."""
    try:
        person = Person.objects.get(id=person_id, user=request.user)
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PersonSerializer(person)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        person.is_active = False
        person.save()
        return Response({'message': 'Person deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_person_numerology(request, person_id):
    """Calculate numerology profile for a specific person."""
    try:
        person = Person.objects.get(id=person_id, user=request.user)
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Validate input
    if not person.name:
        return Response({
            'error': 'Person name is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not person.birth_date:
        return Response({
            'error': 'Person birth date is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate birth date
    if not validate_birth_date(person.birth_date):
        return Response({
            'error': 'Invalid birth date'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Calculate all numbers
        calculator = NumerologyCalculator()
        numbers = calculator.calculate_all(person.name, person.birth_date)
        
        # Update or create profile
        profile, created = PersonNumerologyProfile.objects.update_or_create(
            person=person,
            defaults={
                'life_path_number': numbers['life_path_number'],
                'destiny_number': numbers['destiny_number'],
                'soul_urge_number': numbers['soul_urge_number'],
                'personality_number': numbers['personality_number'],
                'attitude_number': numbers['attitude_number'],
                'maturity_number': numbers['maturity_number'],
                'balance_number': numbers['balance_number'],
                'personal_year_number': numbers['personal_year_number'],
                'personal_month_number': numbers['personal_month_number'],
                'calculation_system': 'pythagorean'
            }
        )
        
        serializer = PersonNumerologyProfileSerializer(profile)
        return Response({
            'message': 'Profile calculated successfully',
            'profile': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': f'Calculation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_person_numerology_profile(request, person_id):
    """Get numerology profile for a specific person."""
    try:
        person = Person.objects.get(id=person_id, user=request.user)
        profile = PersonNumerologyProfile.objects.get(person=person)
        serializer = PersonNumerologyProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except PersonNumerologyProfile.DoesNotExist:
        # Return a more informative response when profile doesn't exist yet
        return Response({
            'error': 'Numerology profile not found for this person',
            'message': 'Please calculate the numerology profile for this person first'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_raj_yog_detection(request, person_id=None):
    """
    Get Raj Yog detection for user or specific person.
    
    If person_id is provided, detects Raj Yog for that person.
    Otherwise, detects for the authenticated user.
    """
    user = request.user
    
    try:
        # Get numerology profile
        if person_id:
            person = Person.objects.get(id=person_id, user=user)
            try:
                profile = PersonNumerologyProfile.objects.get(person=person)
            except PersonNumerologyProfile.DoesNotExist:
                return Response({
                    'error': 'Numerology profile not found. Please calculate profile first.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            life_path = profile.life_path_number
            destiny = profile.destiny_number
            soul_urge = profile.soul_urge_number
            personality = profile.personality_number
            calculation_system = profile.calculation_system
            person_obj = person
        else:
            try:
                profile = NumerologyProfile.objects.get(user=user)
            except NumerologyProfile.DoesNotExist:
                return Response({
                    'error': 'Numerology profile not found. Please calculate profile first.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            life_path = profile.life_path_number
            destiny = profile.destiny_number
            soul_urge = profile.soul_urge_number
            personality = profile.personality_number
            calculation_system = profile.calculation_system
            person_obj = None
        
        # Detect Raj Yog
        calculator = NumerologyCalculator(system=calculation_system)
        raj_yog_data = calculator.detect_raj_yog(
            life_path=life_path,
            destiny=destiny,
            soul_urge=soul_urge,
            personality=personality
        )
        
        # Get or create Raj Yog detection record
        detection, created = RajYogDetection.objects.update_or_create(
            user=user,
            person=person_obj,
            defaults={
                'is_detected': raj_yog_data['is_detected'],
                'yog_type': raj_yog_data.get('yog_type'),
                'yog_name': raj_yog_data.get('yog_name'),
                'strength_score': raj_yog_data.get('strength_score', 0),
                'contributing_numbers': raj_yog_data.get('contributing_numbers', {}),
                'detected_combinations': raj_yog_data.get('detected_combinations', []),
                'calculation_system': calculation_system
            }
        )
        
        serializer = RajYogDetectionSerializer(detection)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Error detecting Raj Yog',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_raj_yog_explanation(request, person_id=None):
    """
    Generate LLM explanation for Raj Yog detection.
    
    If person_id is provided, generates explanation for that person.
    Otherwise, generates for the authenticated user.
    """
    user = request.user
    
    try:
        from .services.explanation_generator import get_explanation_generator
        
        # Get Raj Yog detection
        if person_id:
            person = Person.objects.get(id=person_id, user=user)
            detection = RajYogDetection.objects.filter(user=user, person=person).first()
            if not detection:
                return Response({
                    'error': 'Raj Yog detection not found. Please detect Raj Yog first.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            profile = PersonNumerologyProfile.objects.get(person=person)
            numerology_profile = {
                'life_path_number': profile.life_path_number,
                'destiny_number': profile.destiny_number,
                'soul_urge_number': profile.soul_urge_number,
                'personality_number': profile.personality_number
            }
        else:
            detection = RajYogDetection.objects.filter(user=user, person=None).first()
            if not detection:
                return Response({
                    'error': 'Raj Yog detection not found. Please detect Raj Yog first.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            profile = NumerologyProfile.objects.get(user=user)
            numerology_profile = {
                'life_path_number': profile.life_path_number,
                'destiny_number': profile.destiny_number,
                'soul_urge_number': profile.soul_urge_number,
                'personality_number': profile.personality_number
            }
        
        # Prepare Raj Yog data
        raj_yog_data = {
            'is_detected': detection.is_detected,
            'yog_type': detection.yog_type,
            'yog_name': detection.yog_name,
            'strength_score': detection.strength_score,
            'detected_combinations': detection.detected_combinations,
            'contributing_numbers': detection.contributing_numbers
        }
        
        # Generate explanation
        generator = get_explanation_generator()
        explanation = generator.generate_raj_yog_explanation(
            user=user,
            raj_yog_data=raj_yog_data,
            numerology_profile=numerology_profile
        )
        
        serializer = ExplanationSerializer(explanation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Error generating explanation',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_explanation(request, explanation_id):
    """Get a specific explanation by ID."""
    try:
        explanation = Explanation.objects.get(id=explanation_id, user=request.user)
        serializer = ExplanationSerializer(explanation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Explanation.DoesNotExist:
        return Response({'error': 'Explanation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_weekly_report(request, week_start_date_str=None, person_id=None):
    """
    Get weekly report for user or specific person.
    
    If week_start_date_str is provided (YYYY-MM-DD), get report for that week.
    Otherwise, get report for current week.
    """
    user = request.user
    
    try:
        from datetime import datetime as dt
        from .services.weekly_report_generator import get_weekly_report_generator
        from accounts.models import UserProfile
        
        # Check if user has birth date (required for weekly reports)
        if not person_id:
            try:
                user_profile = UserProfile.objects.get(user=user)
                if not user_profile.date_of_birth:
                    return Response({
                        'error': 'Birth date is required. Please update your profile with your birth date.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except UserProfile.DoesNotExist:
                return Response({
                    'error': 'User profile not found. Please complete your profile first.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse week start date
        today = date.today()
        if week_start_date_str:
            try:
                week_start_date = dt.strptime(week_start_date_str, '%Y-%m-%d').date()
            except ValueError as ve:
                return Response({
                    'error': f'Invalid date format. Use YYYY-MM-DD. Error: {str(ve)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            # Validate: don't allow future dates
            if week_start_date > today:
                return Response({
                    'error': f'Cannot generate report for future dates. Requested: {week_start_date}, Today: {today}'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Default to current week (Sunday)
            days_since_sunday = today.weekday() + 1  # Monday=0, Sunday=6, so +1
            week_start_date = today - timedelta(days=days_since_sunday % 7)
        
        # Get person if specified
        person = None
        if person_id:
            person = Person.objects.get(id=person_id, user=user)
        
        # Check if report already exists
        existing_report = WeeklyReport.objects.filter(
            user=user,
            person=person,
            week_start_date=week_start_date
        ).first()
        
        if existing_report:
            serializer = WeeklyReportSerializer(existing_report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Generate new report
        try:
            generator = get_weekly_report_generator()
            report_data = generator.generate_weekly_report(
                user=user,
                week_start_date=week_start_date,
                person=person
            )
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as gen_error:
            logger.error(f'Error in weekly report generator for user {user.id}: {str(gen_error)}\n{traceback.format_exc()}')
            return Response({
                'error': 'Failed to generate weekly report',
                'message': str(gen_error)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create report instance
        try:
            report = WeeklyReport.objects.create(
                user=user,
                person=person,
                **report_data
            )
        except Exception as create_error:
            logger.error(f'Error creating WeeklyReport for user {user.id}: {str(create_error)}\n{traceback.format_exc()}')
            return Response({
                'error': 'Failed to save weekly report',
                'message': str(create_error)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        serializer = WeeklyReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        logger.error(f'ValueError in get_weekly_report: {str(e)}')
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except KeyError as ke:
        logger.error(f'KeyError in get_weekly_report: {str(ke)}\n{traceback.format_exc()}')
        return Response({
            'error': f'Missing required data: {str(ke)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except AttributeError as ae:
        logger.error(f'AttributeError in get_weekly_report: {str(ae)}\n{traceback.format_exc()}')
        return Response({
            'error': f'Data access error: {str(ae)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f'Unexpected error in get_weekly_report for user {request.user.id if hasattr(request, "user") and request.user else "unknown"}: {str(e)}\n{traceback.format_exc()}')
        return Response({
            'error': 'Error generating weekly report',
            'message': str(e) if settings.DEBUG else 'An unexpected error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_yearly_report(request, year=None, person_id=None):
    """
    Get yearly report for user or specific person.
    
    If year is provided, get report for that year.
    Otherwise, get report for current year.
    """
    user = request.user
    
    try:
        from .services.yearly_report_generator import get_yearly_report_generator
        from accounts.models import UserProfile
        
        # Use provided year or current year
        if year is None:
            year = date.today().year
        
        # Validate year is reasonable
        if year < 1900 or year > 2100:
            return Response({
                'error': 'Invalid year. Please provide a year between 1900 and 2100.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate: don't allow future years
        current_year = date.today().year
        if year > current_year:
            return Response({
                'error': f'Cannot generate report for future years. Requested: {year}, Current year: {current_year}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get person if specified
        person = None
        if person_id:
            try:
                person = Person.objects.get(id=person_id, user=user, is_active=True)
            except Person.DoesNotExist:
                return Response({
                    'error': 'Person not found or you do not have access to this person'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate numerology profile exists
        if person:
            # Check if person has numerology profile
            if not PersonNumerologyProfile.objects.filter(person=person).exists():
                return Response({
                    'error': 'Numerology profile not found for this person. Please calculate the numerology profile first.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Check if user has numerology profile
            if not NumerologyProfile.objects.filter(user=user).exists():
                return Response({
                    'error': 'Numerology profile not found. Please complete your numerology profile first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user has UserProfile with date_of_birth
            try:
                user_profile = UserProfile.objects.get(user=user)
                if not user_profile.date_of_birth:
                    return Response({
                        'error': 'Date of birth is required to generate yearly report. Please update your profile.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except UserProfile.DoesNotExist:
                return Response({
                    'error': 'User profile not found. Please complete your profile with date of birth.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if report already exists
        existing_report = YearlyReport.objects.filter(
            user=user,
            person=person,
            year=year
        ).first()
        
        if existing_report:
            serializer = YearlyReportSerializer(existing_report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Generate new report
        try:
            generator = get_yearly_report_generator()
            report_data = generator.generate_yearly_report(
                user=user,
                year=year,
                person=person
            )
        except ValueError as ve:
            logger.error(f'ValueError generating yearly report for user {user.id}, year {year}: {str(ve)}')
            return Response({
                'error': str(ve)
            }, status=status.HTTP_400_BAD_REQUEST)
        except KeyError as ke:
            logger.error(f'KeyError generating yearly report for user {user.id}, year {year}: {str(ke)}\n{traceback.format_exc()}')
            return Response({
                'error': f'Missing required data: {str(ke)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except AttributeError as ae:
            logger.error(f'AttributeError generating yearly report for user {user.id}, year {year}: {str(ae)}\n{traceback.format_exc()}')
            return Response({
                'error': f'Data access error: {str(ae)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f'Unexpected error generating yearly report for user {user.id}, year {year}: {str(e)}\n{traceback.format_exc()}')
            return Response({
                'error': 'Failed to generate yearly report',
                'message': str(e) if settings.DEBUG else 'An unexpected error occurred while generating the report. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create report instance
        try:
            report = YearlyReport.objects.create(
                user=user,
                person=person,
                **report_data
            )
        except Exception as create_error:
            logger.error(f'Error creating YearlyReport for user {user.id}, year {year}: {str(create_error)}\n{traceback.format_exc()}')
            return Response({
                'error': 'Failed to save yearly report',
                'message': str(create_error) if settings.DEBUG else 'The report was generated but could not be saved. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        serializer = YearlyReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        logger.error(f'ValueError in get_yearly_report: {str(e)}')
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except KeyError as ke:
        logger.error(f'KeyError in get_yearly_report: {str(ke)}\n{traceback.format_exc()}')
        return Response({
            'error': f'Missing required data: {str(ke)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except AttributeError as ae:
        logger.error(f'AttributeError in get_yearly_report: {str(ae)}\n{traceback.format_exc()}')
        return Response({
            'error': f'Data access error: {str(ae)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f'Unexpected error in get_yearly_report for user {request.user.id if hasattr(request, "user") and request.user else "unknown"}: {str(e)}\n{traceback.format_exc()}')
        return Response({
            'error': 'Error generating yearly report',
            'message': str(e) if settings.DEBUG else 'An unexpected error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(30)  # Cache for 30 seconds
def health_check(request):
    """Lightweight health check endpoint with caching."""
    return Response({
        'status': 'healthy'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_name_numerology(request):
    """
    Generate name numerology report.
    Returns job_id and queues the task.
    """
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'name_numerology'):
        return Response({
            'error': 'Name Numerology is available for Basic plan and above. Please upgrade your subscription.',
            'required_tier': 'basic',
            'feature': 'name_numerology'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = NameNumerologyGenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    name = serializer.validated_data['name']
    name_type = serializer.validated_data['name_type']
    system = serializer.validated_data['system']
    force_refresh = serializer.validated_data.get('force_refresh', False)
    
    # Validate name is not empty
    if not name or not name.strip():
        return Response({
            'error': 'Name cannot be empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Queue the task
        task = generate_name_report.delay(
            user_id=str(user.id),
            name=name,
            name_type=name_type,
            system=system,
            force_refresh=force_refresh
        )
        
        return Response({
            'job_id': task.id,
            'status': 'queued'
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to queue task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_name_report(request, user_id, report_id):
    """
    Get a specific name numerology report by ID.
    """
    user = request.user
    
    # Verify user owns the report
    if str(user.id) != str(user_id):
        return Response({
            'error': 'Unauthorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        report = NameReport.objects.get(id=report_id, user=user)
        serializer = NameReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except NameReport.DoesNotExist:
        return Response({
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_name_report(request, user_id):
    """
    Get the latest name numerology report for a user.
    Optionally filter by name_type and system via query params.
    """
    user = request.user
    
    # Verify user owns the request
    if str(user.id) != str(user_id):
        return Response({
            'error': 'Unauthorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get query params
    name_type = request.query_params.get('name_type')
    system = request.query_params.get('system')
    
    # Build query
    reports = NameReport.objects.filter(user=user)
    
    if name_type:
        reports = reports.filter(name_type=name_type)
    if system:
        reports = reports.filter(system=system)
    
    # Get latest
    report = reports.order_by('-computed_at').first()
    
    if not report:
        return Response({
            'error': 'No report found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = NameReportSerializer(report)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_name_numerology(request):
    """
    Preview name numerology results without persisting.
    Returns computed numbers and breakdown for immediate UI feedback.
    """
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'name_numerology'):
        return Response({
            'error': 'Name Numerology is available for Basic plan and above. Please upgrade your subscription.',
            'required_tier': 'basic',
            'feature': 'name_numerology'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = NameNumerologyGenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    name = serializer.validated_data['name']
    system = serializer.validated_data['system']
    transliterate = serializer.validated_data.get('transliterate', True)
    
    # Validate name is not empty
    if not name or not name.strip():
        return Response({
            'error': 'Name cannot be empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Compute numbers (pure deterministic logic, no persistence)
        keep_master = True
        numbers_data = compute_name_numbers(
            name=name,
            system=system,
            keep_master=keep_master
        )
        
        return Response({
            'normalized_name': numbers_data['normalized_name'],
            'numbers': numbers_data,
            'breakdown': numbers_data['breakdown'],
            'word_totals': numbers_data['word_totals']
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Calculation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_phone_numerology(request):
    """
    Generate phone numerology report.
    Returns job_id and queues the task.
    """
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'phone_numerology'):
        return Response({
            'error': 'Phone Numerology is available for Premium plan and above. Please upgrade your subscription.',
            'required_tier': 'premium',
            'feature': 'phone_numerology'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PhoneNumerologyGenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    country_hint = serializer.validated_data.get('country_hint')
    method = serializer.validated_data.get('method', 'core')
    persist = serializer.validated_data.get('persist', True)
    force_refresh = serializer.validated_data.get('force_refresh', False)
    convert_vanity = serializer.validated_data.get('convert_vanity', False)
    
    # Validate phone number is not empty
    if not phone_number or not phone_number.strip():
        return Response({
            'error': 'Phone number cannot be empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Queue the task
        task = generate_phone_report.delay(
            user_id=str(user.id),
            phone_number=phone_number,
            country_hint=country_hint,
            method=method,
            persist=persist,
            force_refresh=force_refresh,
            convert_vanity=convert_vanity
        )
        
        return Response({
            'job_id': task.id,
            'status': 'queued'
        }, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to queue task: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_phone_numerology(request):
    """
    Preview phone numerology results without persisting.
    Returns computed numbers and breakdown for immediate UI feedback.
    """
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'phone_numerology'):
        return Response({
            'error': 'Phone Numerology is available for Premium plan and above. Please upgrade your subscription.',
            'required_tier': 'premium',
            'feature': 'phone_numerology'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PhoneNumerologyGenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    country_hint = serializer.validated_data.get('country_hint')
    method = serializer.validated_data.get('method', 'core')
    convert_vanity = serializer.validated_data.get('convert_vanity', False)
    
    # Validate phone number is not empty
    if not phone_number or not phone_number.strip():
        return Response({
            'error': 'Phone number cannot be empty'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Sanitize and validate
        validation_result = sanitize_and_validate_phone(
            phone_number,
            country_hint=country_hint,
            convert_vanity=convert_vanity
        )
        
        if not validation_result['valid']:
            return Response({
                'error': validation_result['reason']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Compute numerology (pure deterministic logic, no persistence)
        computed = compute_phone_numerology(
            validation_result['e164'],
            method=method,
            core_scope='national',  # Default to national
            keep_master=False
        )
        
        return Response({
            'phone_e164': validation_result['e164'],
            'phone_display': PhoneReport.mask_phone(validation_result['e164']),
            'country': validation_result['country'],
            'computed': computed
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Calculation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_phone_report(request, user_id, report_id):
    """
    Get a specific phone numerology report by ID.
    """
    user = request.user
    
    # Verify user owns the report
    if str(user.id) != str(user_id):
        return Response({
            'error': 'Unauthorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        report = PhoneReport.objects.get(id=report_id, user=user)
        serializer = PhoneReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except PhoneReport.DoesNotExist:
        return Response({
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_phone_report(request, user_id):
    """
    Get the latest phone numerology report for a user.
    Optionally filter by method via query params.
    """
    user = request.user
    
    # Verify user owns the request
    if str(user.id) != str(user_id):
        return Response({
            'error': 'Unauthorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get query params
    method = request.query_params.get('method')
    
    # Build query
    reports = PhoneReport.objects.filter(user=user)
    
    if method:
        reports = reports.filter(method=method)
    
    # Get latest
    report = reports.order_by('-computed_at').first()
    
    if not report:
        return Response({
            'error': 'No report found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PhoneReportSerializer(report)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_phone_compatibility(request):
    """
    Check compatibility between two phone numbers.
    Accepts two phone numbers or user_ids.
    """
    user = request.user
    
    phone1 = request.data.get('phone1')
    phone2 = request.data.get('phone2')
    user_id1 = request.data.get('user_id1')
    user_id2 = request.data.get('user_id2')
    country_hint = request.data.get('country_hint')
    convert_vanity = request.data.get('convert_vanity', False)
    
    # Get phone numbers from user_ids if provided
    if user_id1:
        try:
            latest_report1 = PhoneReport.objects.filter(
                user_id=user_id1
            ).order_by('-computed_at').first()
            if not latest_report1:
                return Response({
                    'error': f'No phone report found for user {user_id1}'
                }, status=status.HTTP_404_NOT_FOUND)
            phone1 = latest_report1.phone_e164
        except Exception as e:
            return Response({
                'error': f'Error fetching phone for user {user_id1}: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    if user_id2:
        try:
            latest_report2 = PhoneReport.objects.filter(
                user_id=user_id2
            ).order_by('-computed_at').first()
            if not latest_report2:
                return Response({
                    'error': f'No phone report found for user {user_id2}'
                }, status=status.HTTP_404_NOT_FOUND)
            phone2 = latest_report2.phone_e164
        except Exception as e:
            return Response({
                'error': f'Error fetching phone for user {user_id2}: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    if not phone1 or not phone2:
        return Response({
            'error': 'Both phone numbers are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate both phone numbers
        validation1 = sanitize_and_validate_phone(phone1, country_hint=country_hint, convert_vanity=convert_vanity)
        validation2 = sanitize_and_validate_phone(phone2, country_hint=country_hint, convert_vanity=convert_vanity)
        
        if not validation1['valid']:
            return Response({
                'error': f'Invalid phone number 1: {validation1["reason"]}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not validation2['valid']:
            return Response({
                'error': f'Invalid phone number 2: {validation2["reason"]}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Compute compatibility
        compatibility = compute_compatibility_score(
            validation1['e164'],
            validation2['e164'],
            core_scope='national',
            keep_master=False
        )
        
        return Response(compatibility, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Compatibility check failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_essence_cycles(request):
    """Get essence cycles for user."""
    try:
        user = request.user
        if not user.date_of_birth:
            return Response({
                'error': 'Date of birth required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from .services.essence_cycles import EssenceCycleCalculator
        calculator = EssenceCycleCalculator()
        
        essence_cycles = calculator.calculate_essence_cycles(
            user.full_name,
            user.date_of_birth
        )
        
        return Response(essence_cycles)
    except Exception as e:
        logger.error(f"Error calculating essence cycles: {str(e)}")
        return Response({
            'error': f'Failed to calculate essence cycles: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cycle_timeline(request):
    """Get complete cycle timeline visualization."""
    try:
        user = request.user
        if not user.date_of_birth:
            return Response({
                'error': 'Date of birth required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        start_year = int(request.query_params.get('start_year', date.today().year))
        end_year = int(request.query_params.get('end_year', start_year + 9))
        
        from .services.cycle_visualization import CycleVisualizationService
        service = CycleVisualizationService()
        
        timeline = service.generate_cycle_timeline(
            user.full_name,
            user.date_of_birth,
            start_year,
            end_year
        )
        
        return Response(timeline)
    except Exception as e:
        logger.error(f"Error generating cycle timeline: {str(e)}")
        return Response({
            'error': f'Failed to generate timeline: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_universal_cycles(request):
    """Get universal year, month, and day cycles."""
    try:
        from .services.universal_cycles import UniversalCycleCalculator
        calculator = UniversalCycleCalculator()
        
        year = int(request.query_params.get('year', date.today().year))
        month = int(request.query_params.get('month', date.today().month))
        day = int(request.query_params.get('day', date.today().day))
        
        universal_year = calculator.calculate_universal_year(year)
        universal_month = calculator.calculate_universal_month(year, month)
        universal_day = calculator.calculate_universal_day(year, month, day)
        
        return Response({
            'universal_year': universal_year,
            'universal_month': universal_month,
            'universal_day': universal_day
        })
    except Exception as e:
        logger.error(f"Error calculating universal cycles: {str(e)}")
        return Response({
            'error': f'Failed to calculate universal cycles: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_cycle_compatibility(request):
    """Calculate cycle compatibility between two profiles."""
    try:
        from .services.cycle_visualization import CycleVisualizationService
        service = CycleVisualizationService()
        
        profile_1_name = request.data.get('profile_1_name')
        profile_1_dob = request.data.get('profile_1_dob')
        profile_2_name = request.data.get('profile_2_name')
        profile_2_dob = request.data.get('profile_2_dob')
        target_year = int(request.data.get('target_year', date.today().year))
        
        if not all([profile_1_name, profile_1_dob, profile_2_name, profile_2_dob]):
            return Response({
                'error': 'All profile fields required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse dates
        dob1 = datetime.strptime(profile_1_dob, '%Y-%m-%d').date()
        dob2 = datetime.strptime(profile_2_dob, '%Y-%m-%d').date()
        
        compatibility = service.calculate_cycle_compatibility(
            {'name': profile_1_name, 'birth_date': dob1},
            {'name': profile_2_name, 'birth_date': dob2},
            target_year
        )
        
        return Response(compatibility)
    except Exception as e:
        logger.error(f"Error calculating cycle compatibility: {str(e)}")
        return Response({
            'error': f'Failed to calculate cycle compatibility: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Asset Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_vehicle_numerology(request):
    """Calculate numerology for a vehicle."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_vehicle'):
        return Response({
            'error': 'Vehicle numerology is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_vehicle'
        }, status=status.HTTP_403_FORBIDDEN)
    
    license_plate = request.data.get('license_plate')
    if not license_plate:
        return Response({
            'error': 'License plate is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = AssetNumerologyService()
        user_profile = getattr(user, 'numerology_profile', None)
        
        owner_life_path = None
        if user_profile:
            owner_life_path = user_profile.life_path_number
        
        owner_dob = None
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            owner_dob = user.profile.date_of_birth
        
        result = service.calculate_vehicle_numerology(
            license_plate,
            owner_dob,
            owner_life_path
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating vehicle numerology: {str(e)}")
        return Response({
            'error': f'Failed to calculate vehicle numerology: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_property_numerology(request):
    """Calculate numerology for a property."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_property'):
        return Response({
            'error': 'Property numerology is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_property'
        }, status=status.HTTP_403_FORBIDDEN)
    
    house_number = request.data.get('house_number')
    if not house_number:
        return Response({
            'error': 'House number is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = AssetNumerologyService()
        user_profile = getattr(user, 'numerology_profile', None)
        
        owner_life_path = None
        if user_profile:
            owner_life_path = user_profile.life_path_number
        
        owner_dob = None
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            owner_dob = user.profile.date_of_birth
        
        floor_number = request.data.get('floor_number')
        if floor_number:
            floor_number = int(floor_number)
        
        result = service.calculate_property_numerology(
            str(house_number),
            floor_number,
            owner_dob,
            owner_life_path
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating property numerology: {str(e)}")
        return Response({
            'error': f'Failed to calculate property numerology: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_business_numerology(request):
    """Calculate numerology for a business."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_business'):
        return Response({
            'error': 'Business numerology is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_business'
        }, status=status.HTTP_403_FORBIDDEN)
    
    business_name = request.data.get('business_name')
    if not business_name:
        return Response({
            'error': 'Business name is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = AssetNumerologyService()
        
        registration_number = request.data.get('registration_number')
        launch_date_str = request.data.get('launch_date')
        
        launch_date = None
        if launch_date_str:
            launch_date = datetime.strptime(launch_date_str, '%Y-%m-%d').date()
        
        owner_dob = None
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            owner_dob = user.profile.date_of_birth
        
        result = service.calculate_business_numerology(
            business_name,
            registration_number,
            launch_date,
            owner_dob
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating business numerology: {str(e)}")
        return Response({
            'error': f'Failed to calculate business numerology: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_phone_numerology_asset(request):
    """Calculate numerology for a phone number (asset version)."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_phone'):
        return Response({
            'error': 'Phone numerology is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_phone'
        }, status=status.HTTP_403_FORBIDDEN)
    
    phone_number = request.data.get('phone_number')
    if not phone_number:
        return Response({
            'error': 'Phone number is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = AssetNumerologyService()
        user_profile = getattr(user, 'numerology_profile', None)
        
        owner_life_path = None
        if user_profile:
            owner_life_path = user_profile.life_path_number
        
        owner_dob = None
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            owner_dob = user.profile.date_of_birth
        
        result = service.calculate_phone_numerology(
            phone_number,
            owner_dob,
            owner_life_path
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating phone numerology: {str(e)}")
        return Response({
            'error': f'Failed to calculate phone numerology: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Relationship Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_enhanced_compatibility(request):
    """Calculate enhanced relationship compatibility."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_relationships'):
        return Response({
            'error': 'Enhanced relationship numerology is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_relationships'
        }, status=status.HTTP_403_FORBIDDEN)
    
    profile_1_data = request.data.get('profile_1')
    profile_2_data = request.data.get('profile_2')
    relationship_type = request.data.get('relationship_type', 'romantic')
    
    if not profile_1_data or not profile_2_data:
        return Response({
            'error': 'Both profile_1 and profile_2 are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = RelationshipNumerologyService()
        result = service.calculate_enhanced_compatibility(
            profile_1_data,
            profile_2_data,
            relationship_type
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating enhanced compatibility: {str(e)}")
        return Response({
            'error': f'Failed to calculate compatibility: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def compare_multiple_partners(request):
    """Compare user with multiple partners."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_multi_partner'):
        return Response({
            'error': 'Multi-partner comparison is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_multi_partner'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_profile_data = request.data.get('user_profile')
    partner_profiles = request.data.get('partner_profiles', [])
    
    if not user_profile_data or not partner_profiles:
        return Response({
            'error': 'user_profile and partner_profiles are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = RelationshipNumerologyService()
        result = service.compare_multiple_partners(
            user_profile_data,
            partner_profiles
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error comparing partners: {str(e)}")
        return Response({
            'error': f'Failed to compare partners: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_marriage_harmony_cycles(request):
    """Calculate marriage harmony cycles."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_marriage_harmony'):
        return Response({
            'error': 'Marriage harmony cycles are available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_marriage_harmony'
        }, status=status.HTTP_403_FORBIDDEN)
    
    profile_1_data = request.data.get('profile_1')
    profile_2_data = request.data.get('profile_2')
    marriage_date_str = request.data.get('marriage_date')
    
    if not profile_1_data or not profile_2_data:
        return Response({
            'error': 'Both profile_1 and profile_2 are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    marriage_date = None
    if marriage_date_str:
        marriage_date = datetime.strptime(marriage_date_str, '%Y-%m-%d').date()
    
    try:
        service = RelationshipNumerologyService()
        result = service.calculate_marriage_harmony_cycles(
            profile_1_data,
            profile_2_data,
            marriage_date
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating marriage harmony: {str(e)}")
        return Response({
            'error': f'Failed to calculate marriage harmony: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Timing Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def find_best_dates(request):
    """Find best dates for an event."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_timing_optimization'):
        return Response({
            'error': 'Timing optimization is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_timing_optimization'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_birth_date_str = request.data.get('birth_date')
    event_type = request.data.get('event_type')
    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    limit = int(request.data.get('limit', 10))
    
    if not all([user_birth_date_str, event_type, start_date_str, end_date_str]):
        return Response({
            'error': 'birth_date, event_type, start_date, and end_date are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_birth_date = datetime.strptime(user_birth_date_str, '%Y-%m-%d').date()
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        service = TimingNumerologyService()
        result = service.find_best_dates(
            user_birth_date,
            event_type,
            start_date,
            end_date,
            limit
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error finding best dates: {str(e)}")
        return Response({
            'error': f'Failed to find best dates: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def find_danger_dates(request):
    """Find danger dates to avoid."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_danger_dates'):
        return Response({
            'error': 'Danger dates identification is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_danger_dates'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_birth_date_str = request.data.get('birth_date')
    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    
    if not all([user_birth_date_str, start_date_str, end_date_str]):
        return Response({
            'error': 'birth_date, start_date, and end_date are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_birth_date = datetime.strptime(user_birth_date_str, '%Y-%m-%d').date()
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        service = TimingNumerologyService()
        result = service.find_danger_dates(
            user_birth_date,
            start_date,
            end_date
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error finding danger dates: {str(e)}")
        return Response({
            'error': f'Failed to find danger dates: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_event_timing(request):
    """Optimize timing for an event."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_timing_optimization'):
        return Response({
            'error': 'Event timing optimization is available for Premium plan and above.',
            'required_tier': 'premium',
            'feature': 'numerology_timing_optimization'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_birth_date_str = request.data.get('birth_date')
    event_type = request.data.get('event_type')
    preferred_month = request.data.get('preferred_month')
    preferred_year = request.data.get('preferred_year')
    
    if not user_birth_date_str or not event_type:
        return Response({
            'error': 'birth_date and event_type are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_birth_date = datetime.strptime(user_birth_date_str, '%Y-%m-%d').date()
        
        if preferred_month:
            preferred_month = int(preferred_month)
        if preferred_year:
            preferred_year = int(preferred_year)
        
        service = TimingNumerologyService()
        result = service.optimize_event_timing(
            user_birth_date,
            event_type,
            preferred_month,
            preferred_year
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error optimizing event timing: {str(e)}")
        return Response({
            'error': f'Failed to optimize timing: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Health Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_health_cycles(request):
    """Calculate health cycles and risk periods."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_health'):
        return Response({
            'error': 'Health numerology is available for Elite plan and above.',
            'required_tier': 'elite',
            'feature': 'numerology_health'
        }, status=status.HTTP_403_FORBIDDEN)
    
    birth_date_str = request.data.get('birth_date')
    full_name = request.data.get('full_name')
    start_year = request.data.get('start_year')
    end_year = request.data.get('end_year')
    
    if not birth_date_str or not full_name:
        # Try to get from user profile
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            birth_date_str = user.profile.date_of_birth.isoformat()
        if hasattr(user, 'full_name') and user.full_name:
            full_name = user.full_name
        
        if not birth_date_str or not full_name:
            return Response({
                'error': 'birth_date and full_name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        
        if start_year:
            start_year = int(start_year)
        if end_year:
            end_year = int(end_year)
        
        service = HealthNumerologyService()
        result = service.calculate_health_cycles(
            birth_date,
            full_name,
            start_year,
            end_year
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating health cycles: {str(e)}")
        return Response({
            'error': f'Failed to calculate health cycles: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_medical_timing(request):
    """Calculate optimal timing for medical procedures."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_medical_timing'):
        return Response({
            'error': 'Medical timing is available for Elite plan and above.',
            'required_tier': 'elite',
            'feature': 'numerology_medical_timing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    birth_date_str = request.data.get('birth_date')
    procedure_type = request.data.get('procedure_type')
    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    
    if not all([birth_date_str, procedure_type, start_date_str, end_date_str]):
        return Response({
            'error': 'birth_date, procedure_type, start_date, and end_date are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        service = HealthNumerologyService()
        result = service.calculate_medical_timing(
            birth_date,
            procedure_type,
            start_date,
            end_date
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating medical timing: {str(e)}")
        return Response({
            'error': f'Failed to calculate medical timing: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_emotional_vulnerabilities(request):
    """Calculate emotional vulnerabilities."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    if not can_access_feature(user, 'numerology_health'):
        return Response({
            'error': 'Emotional vulnerability analysis is available for Elite plan and above.',
            'required_tier': 'elite',
            'feature': 'numerology_health'
        }, status=status.HTTP_403_FORBIDDEN)
    
    birth_date_str = request.data.get('birth_date')
    full_name = request.data.get('full_name')
    
    if not birth_date_str or not full_name:
        # Try to get from user profile
        if hasattr(user, 'profile') and user.profile.date_of_birth:
            birth_date_str = user.profile.date_of_birth.isoformat()
        if hasattr(user, 'full_name') and user.full_name:
            full_name = user.full_name
        
        if not birth_date_str or not full_name:
            return Response({
                'error': 'birth_date and full_name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        
        service = HealthNumerologyService()
        result = service.calculate_emotional_vulnerabilities(
            birth_date,
            full_name
        )
        
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error calculating emotional vulnerabilities: {str(e)}")
        return Response({
            'error': f'Failed to calculate emotional vulnerabilities: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Generational Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generational_family_analysis(request):
    """Analyze family generational numerology."""
    from feature_flags.services import FeatureFlagService
    from .models import GenerationalAnalysis
    from .services.generational import GenerationalAnalyzer
    
    user = request.user
    
    # Check feature flag
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available for your subscription tier'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        person_ids = request.data.get('person_ids', [])
        if not person_ids:
            return Response({
                'error': 'At least one person ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get family members
        family_members = Person.objects.filter(
            id__in=person_ids,
            user=user,
            is_active=True
        )
        
        if not family_members.exists():
            return Response({
                'error': 'No valid family members found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Analyze
        analyzer = GenerationalAnalyzer()
        analysis_result = analyzer.calculate_family_generational_number(list(family_members))
        
        # Generate family unit hash
        family_unit_hash = GenerationalAnalyzer.generate_family_unit_hash(
            [str(p.id) for p in family_members]
        )
        
        # Save or update analysis
        analysis, created = GenerationalAnalysis.objects.update_or_create(
            user=user,
            family_unit_hash=family_unit_hash,
            defaults={
                'generational_number': analysis_result['generational_number'],
                'analysis_data': analysis_result
            }
        )
        
        return Response({
            'success': True,
            'analysis': analysis_result,
            'analysis_id': str(analysis.id),
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in generational family analysis: {str(e)}")
        return Response({
            'error': f'Failed to analyze family: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generational_family_analysis(request):
    """Get existing family generational analysis."""
    from feature_flags.services import FeatureFlagService
    from .models import GenerationalAnalysis
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        analyses = GenerationalAnalysis.objects.filter(user=user).order_by('-calculated_at')
        
        results = []
        for analysis in analyses:
            results.append({
                'id': str(analysis.id),
                'generational_number': analysis.generational_number,
                'analysis_data': analysis.analysis_data,
                'calculated_at': analysis.calculated_at.isoformat()
            })
        
        return Response({
            'success': True,
            'analyses': results
        })
    except Exception as e:
        logger.error(f"Error getting generational analysis: {str(e)}")
        return Response({
            'error': f'Failed to get analysis: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generational_karmic_contract(request):
    """Analyze parent-child karmic contract."""
    from feature_flags.services import FeatureFlagService
    from .models import KarmicContract
    from .services.generational import GenerationalAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        parent_id = request.data.get('parent_id')
        child_id = request.data.get('child_id')
        
        if not parent_id or not child_id:
            return Response({
                'error': 'Both parent_id and child_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get persons
        parent = Person.objects.get(id=parent_id, user=user, is_active=True)
        child = Person.objects.get(id=child_id, user=user, is_active=True)
        
        # Analyze
        analyzer = GenerationalAnalyzer()
        contract_result = analyzer.analyze_parent_child_karmic_contract(parent, child)
        
        # Save contract
        contract, created = KarmicContract.objects.update_or_create(
            user=user,
            parent_person=parent,
            child_person=child,
            defaults={
                'contract_type': contract_result.get('contract_type'),
                'karmic_lessons': contract_result.get('karmic_lessons', []),
                'compatibility_score': contract_result.get('compatibility_score'),
                'analysis_data': contract_result
            }
        )
        
        return Response({
            'success': True,
            'contract': contract_result,
            'contract_id': str(contract.id),
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Person.DoesNotExist:
        return Response({
            'error': 'Parent or child not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error analyzing karmic contract: {str(e)}")
        return Response({
            'error': f'Failed to analyze contract: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_karmic_contracts(request):
    """Get all karmic contracts for user."""
    from feature_flags.services import FeatureFlagService
    from .models import KarmicContract
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        contracts = KarmicContract.objects.filter(user=user).order_by('-calculated_at')
        
        results = []
        for contract in contracts:
            results.append({
                'id': str(contract.id),
                'parent': {
                    'id': str(contract.parent_person.id),
                    'name': contract.parent_person.name
                },
                'child': {
                    'id': str(contract.child_person.id),
                    'name': contract.child_person.name
                },
                'contract_type': contract.contract_type,
                'compatibility_score': contract.compatibility_score,
                'karmic_lessons': contract.karmic_lessons,
                'analysis_data': contract.analysis_data,
                'calculated_at': contract.calculated_at.isoformat()
            })
        
        return Response({
            'success': True,
            'contracts': results
        })
    except Exception as e:
        logger.error(f"Error getting karmic contracts: {str(e)}")
        return Response({
            'error': f'Failed to get contracts: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generational_patterns(request):
    """Get generational patterns for family."""
    from feature_flags.services import FeatureFlagService
    from .services.generational import GenerationalAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        person_ids = request.query_params.getlist('person_ids')
        
        if not person_ids:
            # Get all family members
            family_members = Person.objects.filter(
                user=user,
                is_active=True,
                relationship__in=['parent', 'child', 'sibling', 'spouse']
            )
        else:
            family_members = Person.objects.filter(
                id__in=person_ids,
                user=user,
                is_active=True
            )
        
        if not family_members.exists():
            return Response({
                'error': 'No family members found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        analyzer = GenerationalAnalyzer()
        patterns = analyzer.identify_generational_patterns(list(family_members))
        
        return Response({
            'success': True,
            'patterns': patterns
        })
    except Exception as e:
        logger.error(f"Error identifying generational patterns: {str(e)}")
        return Response({
            'error': f'Failed to identify patterns: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_family_compatibility_matrix(request):
    """Get family compatibility matrix."""
    from feature_flags.services import FeatureFlagService
    from .services.generational import GenerationalAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_generational'):
        return Response({
            'error': 'Generational Numerology feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        person_ids = request.query_params.getlist('person_ids')
        
        if not person_ids:
            family_members = Person.objects.filter(user=user, is_active=True)
        else:
            family_members = Person.objects.filter(
                id__in=person_ids,
                user=user,
                is_active=True
            )
        
        if not family_members.exists():
            return Response({
                'error': 'No family members found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        analyzer = GenerationalAnalyzer()
        matrix = analyzer.generate_family_compatibility_matrix(list(family_members))
        
        return Response({
            'success': True,
            'matrix': matrix
        })
    except Exception as e:
        logger.error(f"Error generating compatibility matrix: {str(e)}")
        return Response({
            'error': f'Failed to generate matrix: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Feng Shui × Numerology Hybrid Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def feng_shui_analyze(request):
    """Analyze property using Feng Shui × Numerology."""
    from feature_flags.services import FeatureFlagService
    from .models import FengShuiAnalysis
    from .services.feng_shui_hybrid import FengShuiHybridAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_feng_shui'):
        return Response({
            'error': 'Feng Shui Hybrid feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        house_number = request.data.get('house_number')
        property_address = request.data.get('property_address', '')
        
        if not house_number:
            return Response({
                'error': 'House number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user's numerology profile
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please calculate your numerology profile first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Analyze
        analyzer = FengShuiHybridAnalyzer()
        house_analysis = analyzer.analyze_house_vibration(house_number, profile)
        
        # Combine with numerology
        hybrid_result = analyzer.combine_feng_shui_numerology(
            house_analysis,
            {'life_path_number': profile.life_path_number}
        )
        
        # Save analysis
        analysis = FengShuiAnalysis.objects.create(
            user=user,
            property_address=property_address,
            house_number=house_number,
            feng_shui_data={},
            numerology_vibration=house_analysis['vibration_number'],
            hybrid_score=hybrid_result['hybrid_score'],
            recommendations=hybrid_result.get('recommendations', [])
        )
        
        return Response({
            'success': True,
            'analysis': {
                'house_vibration': house_analysis,
                'hybrid_analysis': hybrid_result
            },
            'analysis_id': str(analysis.id)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in Feng Shui analysis: {str(e)}")
        return Response({
            'error': f'Failed to analyze property: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feng_shui_analysis(request, analysis_id):
    """Get Feng Shui analysis by ID."""
    from feature_flags.services import FeatureFlagService
    from .models import FengShuiAnalysis
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_feng_shui'):
        return Response({
            'error': 'Feng Shui Hybrid feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        analysis = FengShuiAnalysis.objects.get(id=analysis_id, user=user)
        
        return Response({
            'success': True,
            'analysis': {
                'id': str(analysis.id),
                'property_address': analysis.property_address,
                'house_number': analysis.house_number,
                'numerology_vibration': analysis.numerology_vibration,
                'hybrid_score': analysis.hybrid_score,
                'recommendations': analysis.recommendations,
                'calculated_at': analysis.calculated_at.isoformat()
            }
        })
    except FengShuiAnalysis.DoesNotExist:
        return Response({
            'error': 'Analysis not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting Feng Shui analysis: {str(e)}")
        return Response({
            'error': f'Failed to get analysis: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def feng_shui_optimize_space(request):
    """Get space optimization recommendations."""
    from feature_flags.services import FeatureFlagService
    from .models import FengShuiAnalysis, SpaceOptimization
    from .services.feng_shui_hybrid import FengShuiHybridAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_space_optimization'):
        return Response({
            'error': 'Space Optimization feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        analysis_id = request.data.get('analysis_id')
        room_data = request.data.get('room_data', {})
        
        if not analysis_id:
            return Response({
                'error': 'Analysis ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        analysis = FengShuiAnalysis.objects.get(id=analysis_id, user=user)
        
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please calculate your numerology profile first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        analyzer = FengShuiHybridAnalyzer()
        optimization = analyzer.optimize_space_layout(room_data, profile)
        
        # Save optimization
        space_opt = SpaceOptimization.objects.create(
            analysis=analysis,
            room_name=room_data.get('room_name', 'Unknown'),
            room_number=room_data.get('room_number'),
            direction=room_data.get('direction'),
            color_recommendations=optimization.get('color_recommendations', []),
            number_combinations=optimization.get('number_combinations', []),
            energy_flow_score=optimization.get('energy_flow_score'),
            layout_suggestions=optimization.get('layout_suggestions', [])
        )
        
        return Response({
            'success': True,
            'optimization': optimization,
            'optimization_id': str(space_opt.id)
        }, status=status.HTTP_201_CREATED)
        
    except FengShuiAnalysis.DoesNotExist:
        return Response({
            'error': 'Analysis not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error optimizing space: {str(e)}")
        return Response({
            'error': f'Failed to optimize space: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Mental State AI × Numerology Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mental_state_track(request):
    """Track emotional state."""
    from feature_flags.services import FeatureFlagService
    from .services.mental_state_ai import MentalStateAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        date_str = request.data.get('date')
        if date_str:
            track_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            track_date = date.today()
        
        state_data = {
            'emotional_state': request.data.get('emotional_state', 'neutral'),
            'stress_level': int(request.data.get('stress_level', 50)),
            'mood_score': int(request.data.get('mood_score', 50)),
            'notes': request.data.get('notes', '')
        }
        
        analyzer = MentalStateAnalyzer()
        tracking = analyzer.track_emotional_state(user, track_date, state_data)
        
        return Response({
            'success': True,
            'tracking': {
                'id': str(tracking.id),
                'date': tracking.date.isoformat(),
                'emotional_state': tracking.emotional_state,
                'stress_level': tracking.stress_level,
                'mood_score': tracking.mood_score,
                'numerology_cycle': tracking.numerology_cycle
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error tracking mental state: {str(e)}")
        return Response({
            'error': f'Failed to track mental state: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mental_state_history(request):
    """Get mental state tracking history."""
    from feature_flags.services import FeatureFlagService
    from .models import MentalStateTracking
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        trackings = MentalStateTracking.objects.filter(user=user)
        
        if start_date:
            trackings = trackings.filter(date__gte=start_date)
        if end_date:
            trackings = trackings.filter(date__lte=end_date)
        
        trackings = trackings.order_by('-date')[:100]  # Limit to 100 most recent
        
        results = []
        for tracking in trackings:
            results.append({
                'id': str(tracking.id),
                'date': tracking.date.isoformat(),
                'emotional_state': tracking.emotional_state,
                'stress_level': tracking.stress_level,
                'mood_score': tracking.mood_score,
                'numerology_cycle': tracking.numerology_cycle,
                'notes': tracking.notes
            })
        
        return Response({
            'success': True,
            'trackings': results
        })
    except Exception as e:
        logger.error(f"Error getting mental state history: {str(e)}")
        return Response({
            'error': f'Failed to get history: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mental_state_analyze(request):
    """Generate mental state analysis."""
    from feature_flags.services import FeatureFlagService
    from .models import MentalStateAnalysis
    from .services.mental_state_ai import MentalStateAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        period_start_str = request.data.get('period_start')
        period_end_str = request.data.get('period_end')
        
        if not period_start_str or not period_end_str:
            # Default to last 30 days
            period_end = date.today()
            period_start = period_end - timedelta(days=30)
        else:
            period_start = datetime.strptime(period_start_str, '%Y-%m-%d').date()
            period_end = datetime.strptime(period_end_str, '%Y-%m-%d').date()
        
        analyzer = MentalStateAnalyzer()
        
        # Identify stress patterns
        stress_patterns = analyzer.identify_stress_patterns(user, period_start, period_end)
        
        # Generate recommendations
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please calculate your numerology profile first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        recommendations = analyzer.generate_wellbeing_recommendations(user, stress_patterns)
        
        # Predict mood cycles
        mood_predictions = analyzer.predict_mood_cycles(user, profile)
        
        # Save analysis
        analysis = MentalStateAnalysis.objects.create(
            user=user,
            period_start=period_start,
            period_end=period_end,
            stress_patterns=stress_patterns,
            wellbeing_recommendations=recommendations,
            mood_predictions=mood_predictions
        )
        
        return Response({
            'success': True,
            'analysis': {
                'id': str(analysis.id),
                'period_start': period_start.isoformat(),
                'period_end': period_end.isoformat(),
                'stress_patterns': stress_patterns,
                'wellbeing_recommendations': recommendations,
                'mood_predictions': mood_predictions
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error analyzing mental state: {str(e)}")
        return Response({
            'error': f'Failed to analyze mental state: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stress_patterns(request):
    """Get stress patterns."""
    from feature_flags.services import FeatureFlagService
    from .services.mental_state_ai import MentalStateAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        period_start_str = request.query_params.get('period_start')
        period_end_str = request.query_params.get('period_end')
        
        if not period_start_str or not period_end_str:
            period_end = date.today()
            period_start = period_end - timedelta(days=30)
        else:
            period_start = datetime.strptime(period_start_str, '%Y-%m-%d').date()
            period_end = datetime.strptime(period_end_str, '%Y-%m-%d').date()
        
        analyzer = MentalStateAnalyzer()
        patterns = analyzer.identify_stress_patterns(user, period_start, period_end)
        
        return Response({
            'success': True,
            'patterns': patterns
        })
    except Exception as e:
        logger.error(f"Error getting stress patterns: {str(e)}")
        return Response({
            'error': f'Failed to get patterns: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wellbeing_recommendations(request):
    """Get wellbeing recommendations."""
    from feature_flags.services import FeatureFlagService
    from .services.mental_state_ai import MentalStateAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please calculate your numerology profile first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get recent stress patterns
        period_end = date.today()
        period_start = period_end - timedelta(days=30)
        
        analyzer = MentalStateAnalyzer()
        stress_patterns = analyzer.identify_stress_patterns(user, period_start, period_end)
        
        recommendations = analyzer.generate_wellbeing_recommendations(user, stress_patterns)
        
        return Response({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return Response({
            'error': f'Failed to get recommendations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mood_predictions(request):
    """Get mood cycle predictions."""
    from feature_flags.services import FeatureFlagService
    from .services.mental_state_ai import MentalStateAnalyzer
    
    user = request.user
    
    if not FeatureFlagService.can_access(user, 'numerology_mental_state'):
        return Response({
            'error': 'Mental State AI feature is not available'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please calculate your numerology profile first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        analyzer = MentalStateAnalyzer()
        predictions = analyzer.predict_mood_cycles(user, profile)
        
        return Response({
            'success': True,
            'predictions': predictions
        })
    except Exception as e:
        logger.error(f"Error getting mood predictions: {str(e)}")
        return Response({
            'error': f'Failed to get predictions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_health_numerology(request):
    """Get or calculate Health Numerology profile for user."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'numerology_health'):
        return Response({
            'error': 'Health Numerology is available for Elite plan subscribers.',
            'required_tier': 'elite',
            'feature': 'numerology_health'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get user info
        user_full_name = None
        if hasattr(user, 'full_name') and user.full_name:
            user_full_name = user.full_name
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        if not user_full_name or not user.profile.date_of_birth:
            return Response({
                'error': 'Full name and birth date are required for Health Numerology calculation.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create profile
        profile, created = HealthNumerologyProfile.objects.get_or_create(
            user=user,
            defaults={}
        )
        
        # Get numerology profile for calculation system
        numerology_profile = NumerologyProfile.objects.get(user=user)
        system = numerology_profile.calculation_system
        
        # Calculate health profile
        service = HealthNumerologyService(system=system)
        health_data = service.calculate_health_profile(
            user_full_name,
            user.profile.date_of_birth
        )
        
        # Update profile
        profile.stress_number = health_data['stress_number']
        profile.vitality_number = health_data['vitality_number']
        profile.health_cycle_number = health_data['health_cycle_number']
        profile.health_cycles = health_data['health_cycles']
        profile.current_cycle = health_data['current_cycle']
        profile.medical_timing = health_data['medical_timing']
        profile.health_windows = health_data['health_windows']
        profile.risk_periods = health_data['risk_periods']
        profile.save()
        
        # Serialize response
        serializer = HealthNumerologyProfileSerializer(profile)
        response_data = serializer.data
        response_data['interpretation'] = health_data['interpretation']
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    except HealthNumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Health Numerology profile not found.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_name_correction(request):
    """Analyze name and provide correction suggestions."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'numerology_name_correction'):
        return Response({
            'error': 'Name Correction is available for Elite plan subscribers.',
            'required_tier': 'elite',
            'feature': 'numerology_name_correction'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = NameCorrectionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    name = serializer.validated_data['name']
    name_type = serializer.validated_data.get('name_type', 'current')
    target_number = serializer.validated_data.get('target_number')
    cultural_context = serializer.validated_data.get('cultural_context', 'western')
    
    try:
        # Get numerology profile for calculation system
        numerology_profile = NumerologyProfile.objects.get(user=user)
        system = numerology_profile.calculation_system
        
        # Analyze name
        service = NameCorrectionService(system=system)
        analysis = service.analyze_name(name, target_number, cultural_context)
        
        # Save analysis
        name_correction = NameCorrection.objects.create(
            user=user,
            original_name=name,
            name_type=name_type,
            current_expression=analysis['current_expression'],
            target_expression=target_number,
            cultural_context=cultural_context,
            suggestions=analysis['suggestions'],
            phonetic_analysis=analysis['phonetic_analysis'],
            cultural_analysis=analysis['cultural_analysis'],
            recommendations=analysis['recommendations']
        )
        
        # Serialize response
        response_serializer = NameCorrectionSerializer(name_correction)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_spiritual_numerology(request):
    """Get or calculate Spiritual Numerology profile for user."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'numerology_spiritual'):
        return Response({
            'error': 'Spiritual Numerology is available for Elite plan subscribers.',
            'required_tier': 'elite',
            'feature': 'numerology_spiritual'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get user info
        user_full_name = None
        if hasattr(user, 'full_name') and user.full_name:
            user_full_name = user.full_name
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        if not user_full_name or not user.profile.date_of_birth:
            return Response({
                'error': 'Full name and birth date are required for Spiritual Numerology calculation.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create profile
        profile, created = SpiritualNumerologyProfile.objects.get_or_create(
            user=user,
            defaults={}
        )
        
        # Get numerology profile for calculation system
        numerology_profile = NumerologyProfile.objects.get(user=user)
        system = numerology_profile.calculation_system
        
        # Calculate spiritual profile
        service = SpiritualNumerologyService(system=system)
        spiritual_data = service.calculate_spiritual_profile(
            user_full_name,
            user.profile.date_of_birth
        )
        
        # Update profile
        profile.soul_contracts = spiritual_data['soul_contracts']
        profile.karmic_cycles = spiritual_data['karmic_cycles']
        profile.rebirth_cycles = spiritual_data['rebirth_cycles']
        profile.divine_gifts = spiritual_data['divine_gifts']
        profile.spiritual_alignment = spiritual_data['spiritual_alignment']
        profile.past_life_connections = spiritual_data['past_life_connections']
        profile.save()
        
        # Serialize response
        serializer = SpiritualNumerologyProfileSerializer(profile)
        response_data = serializer.data
        response_data['interpretation'] = spiritual_data['interpretation']
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_predictive_numerology(request):
    """Get or calculate Predictive Numerology profile for user."""
    from .subscription_utils import can_access_feature
    
    user = request.user
    
    # Check subscription access
    if not can_access_feature(user, 'numerology_predictive'):
        return Response({
            'error': 'Predictive Numerology is available for Elite plan subscribers.',
            'required_tier': 'elite',
            'feature': 'numerology_predictive'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get user info
        user_full_name = None
        if hasattr(user, 'full_name') and user.full_name:
            user_full_name = user.full_name
        elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
            user_full_name = user.profile.full_name
        
        if not user_full_name or not user.profile.date_of_birth:
            return Response({
                'error': 'Full name and birth date are required for Predictive Numerology calculation.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get forecast years from request
        forecast_years = int(request.query_params.get('forecast_years', 20))
        forecast_years = min(max(forecast_years, 5), 30)  # Limit between 5 and 30 years
        
        # Get numerology profile for calculation system
        numerology_profile = NumerologyProfile.objects.get(user=user)
        system = numerology_profile.calculation_system
        
        # Calculate predictive profile
        service = PredictiveNumerologyService(system=system)
        predictive_data = service.calculate_predictive_profile(
            user_full_name,
            user.profile.date_of_birth,
            forecast_years
        )
        
        # Save cycles to database
        PredictiveCycle.objects.filter(user=user).delete()  # Clear old cycles
        
        for cycle in predictive_data['nine_year_cycles']:
            PredictiveCycle.objects.create(
                user=user,
                cycle_type='nine_year',
                year=cycle['start_year'],
                cycle_data=cycle
            )
        
        for breakthrough in predictive_data['breakthrough_years']:
            PredictiveCycle.objects.create(
                user=user,
                cycle_type='breakthrough',
                year=breakthrough['year'],
                cycle_data=breakthrough
            )
        
        for crisis in predictive_data['crisis_years']:
            PredictiveCycle.objects.create(
                user=user,
                cycle_type='crisis',
                year=crisis['year'],
                cycle_data=crisis
            )
        
        for opportunity in predictive_data['opportunity_periods']:
            PredictiveCycle.objects.create(
                user=user,
                cycle_type='opportunity',
                year=opportunity['year'],
                cycle_data=opportunity
            )
        
        return Response(predictive_data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate your profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
