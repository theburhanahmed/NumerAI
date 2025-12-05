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
    WeeklyReport, YearlyReport, PhoneReport
)
from .serializers import (
    NumerologyProfileSerializer, DailyReadingSerializer, BirthChartSerializer,
    LifePathAnalysisSerializer, CompatibilityCheckSerializer, RemedySerializer, RemedyTrackingSerializer,
    PersonSerializer, PersonNumerologyProfileSerializer, NumerologyReportSerializer,
    RajYogDetectionSerializer, ExplanationSerializer, NameNumerologyGenerateSerializer, NameReportSerializer,
    WeeklyReportSerializer, YearlyReportSerializer, PhoneNumerologyGenerateSerializer, PhoneReportSerializer,
    FullNumerologyReportSerializer
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
import os
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
def get_lo_shu_grid(request):
    """Get Lo Shu Grid for user."""
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
        
        if not profile.lo_shu_grid:
            # Calculate if not already stored
            user_full_name = None
            if hasattr(user, 'full_name') and user.full_name:
                user_full_name = user.full_name
            elif hasattr(user, 'profile') and hasattr(user.profile, 'full_name') and user.profile.full_name:
                user_full_name = user.profile.full_name
            
            if not user_full_name or not user.profile.date_of_birth:
                return Response({
                    'error': 'Full name and birth date are required for Lo Shu Grid calculation.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            calculator = NumerologyCalculator(profile.calculation_system)
            lo_shu_grid = calculator.calculate_lo_shu_grid(user_full_name, user.profile.date_of_birth)
            
            # Save to profile
            profile.lo_shu_grid = lo_shu_grid
            profile.save()
        else:
            lo_shu_grid = profile.lo_shu_grid
        
        return Response(lo_shu_grid, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Profile not found. Please calculate your profile first.'
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
        import traceback
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
        import traceback
        error_response = {
            'error': f'Failed to generate report: {str(e)}'
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
        
        # Parse week start date
        today = date.today()
        if week_start_date_str:
            week_start_date = dt.strptime(week_start_date_str, '%Y-%m-%d').date()
            # Validate: don't allow future dates
            if week_start_date > today:
                return Response({
                    'error': 'Cannot generate report for future dates'
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
        generator = get_weekly_report_generator()
        report_data = generator.generate_weekly_report(
            user=user,
            week_start_date=week_start_date,
            person=person
        )
        
        # Create report instance
        report = WeeklyReport.objects.create(
            user=user,
            person=person,
            **report_data
        )
        
        serializer = WeeklyReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Error generating weekly report',
            'message': str(e)
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
        
        # Use provided year or current year
        if year is None:
            year = date.today().year
        
        # Get person if specified
        person = None
        if person_id:
            person = Person.objects.get(id=person_id, user=user)
        
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
        generator = get_yearly_report_generator()
        report_data = generator.generate_yearly_report(
            user=user,
            year=year,
            person=person
        )
        
        # Create report instance
        report = YearlyReport.objects.create(
            user=user,
            person=person,
            **report_data
        )
        
        serializer = YearlyReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Person.DoesNotExist:
        return Response({'error': 'Person not found'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Error generating yearly report',
            'message': str(e)
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

