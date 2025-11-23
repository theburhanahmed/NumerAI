"""
API views for NumerAI numerology application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, date, datetime
from .models import NumerologyProfile, DailyReading, CompatibilityCheck, Remedy, RemedyTracking, Person, PersonNumerologyProfile
from .serializers import (
    NumerologyProfileSerializer, DailyReadingSerializer, BirthChartSerializer,
    LifePathAnalysisSerializer, PinnacleCycleSerializer,
    CompatibilityCheckSerializer, RemedySerializer, RemedyTrackingSerializer,
    PersonSerializer, PersonNumerologyProfileSerializer
)
from .utils import generate_otp, send_otp_email, generate_secure_token
from .numerology import NumerologyCalculator, validate_name, validate_birth_date
from .compatibility import CompatibilityAnalyzer
from .interpretations import get_interpretation, get_all_interpretations
from .reading_generator import DailyReadingGenerator
from .cache import NumerologyCache
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from io import BytesIO


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_numerology_profile(request):
    """Calculate and save user's numerology profile."""
    user = request.user
    full_name = request.data.get('full_name') or user.full_name
    birth_date_str = request.data.get('birth_date')
    system = request.data.get('system', 'pythagorean')
    
    # Validate input
    if not full_name:
        return Response({
            'error': 'Full name is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not birth_date_str:
        # Try to get birth date from user profile
        if not user.profile.date_of_birth:
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
                'calculation_system': system
            }
        )
        
        serializer = NumerologyProfileSerializer(profile)
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
            'interpretations': interpretations
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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
    
    # Create PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="birth_chart_{user.full_name.replace(" ", "_")}.pdf"'
    
    # Create PDF document
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, f"Numerology Birth Chart for {user.full_name}")
    
    # User info
    p.setFont("Helvetica", 12)
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
        pinnacle_cycles = calculator.calculate_pinnacle_cycles(
            user.full_name or user.profile.full_name,
            user.profile.date_of_birth
        )
        
        serializer = LifePathAnalysisSerializer({
            'life_path_number': profile.life_path_number,
            'interpretation': interpretation,
            'pinnacle_cycles': pinnacle_cycles
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
    user = request.user
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
        
        # Analyze compatibility
        analyzer = CompatibilityAnalyzer()
        compatibility_result = analyzer.analyze_compatibility(
            user_profile.life_path_number,
            partner_numbers['life_path_number']
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
    except Exception as e:
        return Response({
            'error': f'Compatibility check failed: {str(e)}'
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
    user = request.user
    
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
        # Generate personalized remedies
        calculator = NumerologyCalculator()
        remedies_data = calculator.generate_remedies(profile)
        
        # Create remedies in database
        created_remedies = []
        for remedy_data in remedies_data:
            remedy = Remedy.objects.create(
                user=user,
                remedy_type=remedy_data['type'],
                title=remedy_data['title'],
                description=remedy_data['description'],
                recommendation=remedy_data['recommendation'],
                is_active=True
            )
            created_remedies.append(remedy)
        
        serializer = RemedySerializer(created_remedies, many=True)
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
    """Get comprehensive numerology report."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please calculate your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get all interpretations
        interpretations = {}
        number_fields = [
            'life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number',
            'attitude_number', 'maturity_number', 'balance_number',
            'personal_year_number', 'personal_month_number'
        ]
        
        for field in number_fields:
            number_value = getattr(profile, field)
            try:
                interpretations[field] = get_interpretation(number_value)
            except ValueError:
                interpretations[field] = None
        
        # Get compatibility analysis
        compatibility_data = []
        if hasattr(user, 'compatibility_checks'):
            recent_checks = user.compatibility_checks.order_by('-created_at')[:3]
            for check in recent_checks:
                compatibility_data.append({
                    'partner_name': check.partner_name,
                    'compatibility_score': check.compatibility_score,
                    'relationship_type': check.relationship_type
                })
        
        # Get remedy tracking data
        remedy_tracking_data = []
        if hasattr(user, 'remedy_trackings'):
            recent_trackings = user.remedy_trackings.order_by('-date')[:7]
            for tracking in recent_trackings:
                remedy_tracking_data.append({
                    'remedy_title': tracking.remedy.title,
                    'date': tracking.date,
                    'is_completed': tracking.is_completed
                })
        
        serializer = NumerologyReportSerializer({
            'user_profile': {
                'full_name': user.full_name,
                'email': user.email,
                'date_of_birth': user.profile.date_of_birth,
                'calculation_date': profile.calculated_at
            },
            'numerology_profile': profile,
            'interpretations': interpretations,
            'compatibility_data': compatibility_data,
            'remedy_tracking_data': remedy_tracking_data
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': f'Failed to generate report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    
    # Create PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="numerology_report_{user.full_name.replace(" ", "_")}.pdf"'
    
    # Create PDF document
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, f"Numerology Report for {user.full_name}")
    
    # User info
    p.setFont("Helvetica", 12)
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


@api_view(['GET'])
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
        return Response({'error': 'Numerology profile not found for this person'}, status=status.HTTP_404_NOT_FOUND)