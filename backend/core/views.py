"""
API views for NumerAI core application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, date, datetime
from .models import (
    User, UserProfile, OTPCode, RefreshToken, DeviceToken, 
    NumerologyProfile, DailyReading, AIConversation, AIMessage,
    CompatibilityCheck, Remedy, RemedyTracking, Expert, Consultation, ConsultationReview,
    Person, PersonNumerologyProfile, ReportTemplate, GeneratedReport
)
from .serializers import (
    UserRegistrationSerializer, OTPVerificationSerializer, ResendOTPSerializer,
    LoginSerializer, LogoutSerializer, RefreshTokenSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordResetTokenRequestSerializer, PasswordResetTokenConfirmSerializer,
    UserProfileSerializer, DeviceTokenSerializer,
    NumerologyProfileSerializer, DailyReadingSerializer, BirthChartSerializer,
    AIConversationSerializer, AIMessageSerializer, ChatMessageSerializer,
    CompatibilityCheckSerializer, RemedySerializer, RemedyTrackingSerializer,
    ExpertSerializer, ConsultationSerializer, ConsultationBookingSerializer,
    ConsultationReviewSerializer, LifePathAnalysisSerializer, PinnacleCycleSerializer,
    NumerologyReportSerializer, PersonSerializer, PersonNumerologyProfileSerializer,
    ReportTemplateSerializer, GeneratedReportSerializer
)
from .utils import generate_otp, send_otp_email, generate_secure_token, send_password_reset_email
from .numerology import NumerologyCalculator, validate_name, validate_birth_date
from .compatibility import CompatibilityAnalyzer
from .interpretations import get_interpretation, get_all_interpretations
from .reading_generator import DailyReadingGenerator
from .cache import NumerologyCache
import openai
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

# Authentication Views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Please check your email for OTP.',
            'user_id': str(user.id),
            'email': user.email,
            'phone': user.phone
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and activate account."""
    serializer = OTPVerificationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        otp_obj = serializer.validated_data['otp_obj']
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        # Verify user
        user.is_verified = True
        user.save()
        
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Store refresh token
        RefreshToken.objects.create(
            user=user,
            token=refresh_token,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        return Response({
            'message': 'Account verified successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'phone': user.phone,
                'full_name': user.full_name
            }
        }, status=status.HTTP_200_OK)
    
    # Increment attempts if OTP object exists
    if 'otp_obj' in serializer.validated_data:
        serializer.validated_data['otp_obj'].increment_attempts()
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP to user."""
    serializer = ResendOTPSerializer(data=request.data)
    if serializer.is_valid():
        # Find user
        if request.data.get('email'):
            user = User.objects.filter(email=request.data['email']).first()
        else:
            user = User.objects.filter(phone=request.data['phone']).first()
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Invalidate old OTPs
        OTPCode.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new OTP
        otp_code = generate_otp()
        otp_type = 'email' if user.email else 'phone'
        
        OTPCode.objects.create(
            user=user,
            code=otp_code,
            type=otp_type,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        if user.email:
            send_otp_email(user.email, otp_code)
        
        return Response({
            'message': 'OTP sent successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Store refresh token
        RefreshToken.objects.create(
            user=user,
            token=refresh_token,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'phone': user.phone,
                'full_name': user.full_name,
                'subscription_plan': user.subscription_plan,
                'is_verified': user.is_verified
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user and blacklist refresh token."""
    serializer = LogoutSerializer(data=request.data)
    if serializer.is_valid():
        refresh_token = serializer.validated_data['refresh_token']
        
        # Blacklist token
        token_obj = RefreshToken.objects.filter(token=refresh_token).first()
        if token_obj:
            token_obj.is_blacklisted = True
            token_obj.save()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh access token using refresh token."""
    serializer = RefreshTokenSerializer(data=request.data)
    if serializer.is_valid():
        refresh_token = serializer.validated_data['refresh_token']
        
        # Check if token is valid
        token_obj = RefreshToken.objects.filter(token=refresh_token).first()
        if not token_obj or not token_obj.is_valid():
            return Response({
                'error': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate new access token
        refresh = JWTRefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        return Response({
            'access_token': access_token
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset OTP."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate OTP
        otp_code = generate_otp()
        OTPCode.objects.create(
            user=user,
            code=otp_code,
            type='email',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        send_otp_email(user.email, otp_code)
        
        return Response({
            'message': 'Password reset OTP sent to your email'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with OTP."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify OTP
        otp = OTPCode.objects.filter(
            user=user,
            code=otp_code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()
        
        if not otp:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        return Response({
            'message': 'Password reset successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_token_request(request):
    """Request password reset with token-based link."""
    from .models import PasswordResetToken
    from datetime import timedelta
    
    serializer = PasswordResetTokenRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email, is_active=True).first()
        
        if not user:
            # Return success even if user doesn't exist to prevent email enumeration
            return Response({
                'message': 'If an account exists with this email, password reset instructions have been sent.'
            }, status=status.HTTP_200_OK)
        
        # Invalidate existing tokens for this user
        PasswordResetToken.objects.filter(user=user).update(is_used=True)
        
        # Generate new token
        token = generate_secure_token()
        expires_at = timezone.now() + timedelta(hours=24)
        
        # Save token
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send email with reset link
        if send_password_reset_email(user, token):
            return Response({
                'message': 'Password reset instructions have been sent to your email.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send password reset email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_token_confirm(request):
    """Confirm password reset with token."""
    from .models import PasswordResetToken
    
    serializer = PasswordResetTokenConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        # Find valid token
        reset_token = PasswordResetToken.objects.filter(
            token=token,
            is_used=False
        ).select_related('user').first()
        
        if not reset_token:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not reset_token.is_valid():
            return Response({'error': 'Token has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'message': 'Password reset successful. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User Profile Views

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device_token(request):
    """Register FCM device token for push notifications."""
    serializer = DeviceTokenSerializer(data=request.data)
    if serializer.is_valid():
        # Check if token already exists
        existing_token = DeviceToken.objects.filter(
            fcm_token=serializer.validated_data['fcm_token']
        ).first()
        
        if existing_token:
            existing_token.user = request.user
            existing_token.device_type = serializer.validated_data['device_type']
            existing_token.device_name = serializer.validated_data.get('device_name')
            existing_token.is_active = True
            existing_token.save()
        else:
            DeviceToken.objects.create(
                user=request.user,
                **serializer.validated_data
            )
        
        return Response({
            'message': 'Device token registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Numerology Views

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
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
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
        NumerologyCache.set_profile(str(user.id), serializer.data)
        
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
import datetime
from datetime import date

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

from .models import NumerologyProfile, DailyReading
from .serializers import DailyReadingSerializer
from .numerology import NumerologyCalculator
from .reading_generator import DailyReadingGenerator
from .cache import NumerologyCache


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
    p = canvas.Canvas(response, pagesize=letter)
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
            reading_date = datetime.strptime(reading_date_str, '%Y-%m-%d').date()
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
                    **reading_content
                )
            except Exception as e:
                return Response({
                    'error': f'Failed to save reading to database: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': f'Failed to retrieve or create reading: {str(e)}'
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
            NumerologyCache.set_daily_reading(str(user.id), str(reading_date), serializer.data)
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


# AI Chat Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """Chat with AI numerologist."""
    user = request.user
    serializer = ChatMessageSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_message = serializer.validated_data['message']
    
    # Check rate limit (20 messages per hour for free users)
    if user.subscription_plan == 'free':
        one_hour_ago = timezone.now() - timedelta(hours=1)
        message_count = AIMessage.objects.filter(
            conversation__user=user,
            created_at__gte=one_hour_ago
        ).count()
        
        if message_count >= 20:
            return Response({
                'error': 'Rate limit exceeded. You can send 20 messages per hour.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    try:
        # Get or create conversation
        conversation, created = AIConversation.objects.get_or_create(
            user=user,
            is_active=True,
            defaults={'started_at': timezone.now()}
        )
        
        if not created and conversation.message_count >= 50:
            # Start a new conversation if current one is too long
            conversation.is_active = False
            conversation.save()
            conversation = AIConversation.objects.create(
                user=user,
                started_at=timezone.now()
            )
        
        # Create user message
        user_msg = AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_message
        )
        
        # Get user's numerology profile
        try:
            numerology_profile = NumerologyProfile.objects.get(user=user)
            life_path = numerology_profile.life_path_number
            destiny = numerology_profile.destiny_number
            soul_urge = numerology_profile.soul_urge_number
            personality = numerology_profile.personality_number
            personal_year = numerology_profile.personal_year_number
            
            # Get additional numerology numbers for richer context
            karmic_debt = getattr(numerology_profile, 'karmic_debt_number', None)
            hidden_passion = getattr(numerology_profile, 'hidden_passion_number', None)
        except NumerologyProfile.DoesNotExist:
            return Response({
                'error': 'Please complete your numerology profile first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get recent conversation history for context
        recent_messages = AIMessage.objects.filter(
            conversation=conversation
        ).order_by('-created_at')[:5]  # Last 5 messages
        
        conversation_history = ""
        for msg in reversed(recent_messages):
            role = "You" if msg.role == "user" else "Numerologist"
            conversation_history += f"{role}: {msg.content}\n"
        
        # Prepare system prompt with enhanced context
        system_prompt = f"""
        You are an expert numerologist with 20+ years of experience. You are helping {user.full_name} understand their numerology profile.
        
        User's Numerology Profile:
        - Life Path Number: {life_path} - Represents your life's purpose and path
        - Destiny Number: {destiny} - Reveals your talents and life's mission
        - Soul Urge Number: {soul_urge} - Shows your inner motivations and desires
        - Personality Number: {personality} - How others perceive you
        - Personal Year Number: {personal_year} - Current year's theme and energy
        
        """
        
        # Add karmic debt information if present
        if karmic_debt:
            system_prompt += f"- Karmic Debt Number: {karmic_debt} - Lessons and challenges to overcome\n"
        
        # Add hidden passion information if present
        if hidden_passion:
            system_prompt += f"- Hidden Passion Number: {hidden_passion} - Untapped talents and interests\n"
        
        system_prompt += """
        Guidelines:
        1. Always reference the user's specific numbers in your responses
        2. Provide actionable advice, not just descriptions
        3. Be empathetic and supportive
        4. Keep responses concise (150-200 words)
        5. Suggest 2-3 follow-up questions at the end
        6. Never make medical, legal, or financial advice
        7. If unsure, acknowledge limitations and suggest consulting a human expert
        8. Reference conversation history when relevant to provide continuity
        9. Adapt your communication style based on the user's numbers (e.g., be direct for 1s, diplomatic for 2s)
        10. Connect different numbers to show how they interact in the user's life
        
        Conversation History:
        """ + conversation_history
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        # Create AI message
        ai_msg = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response,
            tokens_used=tokens_used
        )
        
        # Update conversation
        conversation.last_message_at = timezone.now()
        conversation.message_count = conversation.message_count + 2  # user + assistant
        conversation.save()
        
        # Extract suggested follow-ups from response
        follow_ups = []
        lines = ai_response.strip().split('\n')
        for line in lines[-5:]:  # Check last 5 lines for follow-up questions
            line = line.strip()
            if line.startswith('- ') or line.startswith('1. ') or line.startswith('2. ') or line.startswith('3. '):
                follow_ups.append(line.strip('- ').strip('123. ').strip())
            elif '?' in line and len(line) < 100:  # Likely a question
                follow_ups.append(line.strip())
        
        return Response({
            'conversation_id': str(conversation.id),
            'message': {
                'id': str(ai_msg.id),
                'role': 'assistant',
                'content': ai_response,
                'created_at': ai_msg.created_at.isoformat()
            },
            'suggested_followups': follow_ups[:3]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'AI service error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get user's AI conversations."""
    user = request.user
    conversations = AIConversation.objects.filter(user=user).order_by('-started_at')
    serializer = AIConversationSerializer(conversations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """Get messages for a specific conversation."""
    user = request.user
    try:
        conversation = AIConversation.objects.get(id=conversation_id, user=user)
        messages = AIMessage.objects.filter(conversation=conversation).order_by('created_at')
        serializer = AIMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AIConversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """API health check endpoint."""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)


# New views for additional features

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_life_path_analysis(request):
    """Get detailed life path analysis for the user."""
    user = request.user
    
    try:
        profile = NumerologyProfile.objects.get(user=user)
        life_path_number = profile.life_path_number
        
        # Get interpretation for life path number
        try:
            interpretation = get_interpretation(life_path_number)
        except ValueError:
            return Response({
                'error': 'Interpretation not available for your life path number'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Return detailed analysis
        serializer = LifePathAnalysisSerializer({
            'number': life_path_number,
            'title': interpretation['title'],
            'description': interpretation['description'],
            'strengths': interpretation['strengths'],
            'challenges': interpretation['challenges'],
            'career': interpretation['career'],
            'relationships': interpretation['relationships'],
            'advice': interpretation['life_purpose']
        })
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please complete your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_compatibility(request):
    """Check compatibility with another person using enhanced algorithm."""
    user = request.user
    partner_name = request.data.get('partner_name')
    partner_birth_date = request.data.get('partner_birth_date')
    relationship_type = request.data.get('relationship_type', 'romantic')
    
    # Validate input
    if not partner_name or not partner_birth_date:
        return Response({
            'error': 'Partner name and birth date are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Convert birth date string to date object
        from datetime import datetime
        partner_birth_date = datetime.strptime(partner_birth_date, '%Y-%m-%d').date()
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get user's numerology profile
        user_profile = NumerologyProfile.objects.get(user=user)
        
        # Get user's full name from profile
        user_full_name = user.full_name or ""
        if not user_full_name:
            return Response({
                'error': 'User full name is required for compatibility analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user's birth date from profile
        user_birth_date = user.profile.date_of_birth
        if not user_birth_date:
            return Response({
                'error': 'User birth date is required for compatibility analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create compatibility analyzer with relationship type
        analyzer = CompatibilityAnalyzer(relationship_type)
        
        # Perform enhanced compatibility analysis
        analysis = analyzer.analyze_compatibility(
            user_full_name=user_full_name,
            user_birth_date=user_birth_date,
            partner_full_name=partner_name,
            partner_birth_date=partner_birth_date
        )
        
        # Extract results
        compatibility_score = analysis['compatibility_score']
        strengths = analysis['strengths']
        challenges = analysis['challenges']
        advice = analysis['advice']
        
        # Save compatibility check
        compatibility_check = CompatibilityCheck.objects.create(
            user=user,
            partner_name=partner_name,
            partner_birth_date=partner_birth_date,
            relationship_type=relationship_type,
            compatibility_score=compatibility_score,
            strengths=strengths,
            challenges=challenges,
            advice=advice
        )
        
        # Serialize and return result
        serializer = CompatibilityCheckSerializer(compatibility_check)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please complete your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to check compatibility: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_compatibility_history(request):
    """Get user's compatibility check history."""
    user = request.user
    compatibility_checks = CompatibilityCheck.objects.filter(user=user).order_by('-created_at')
    serializer = CompatibilityCheckSerializer(compatibility_checks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_personalized_remedies(request):
    """Get personalized remedies for the user."""
    user = request.user
    
    try:
        # Get user's numerology profile
        profile = NumerologyProfile.objects.get(user=user)
        
        # Get existing remedies for user
        existing_remedies = Remedy.objects.filter(user=user, is_active=True)
        if existing_remedies.exists():
            serializer = RemedySerializer(existing_remedies, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
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
        
        # Return created remedies
        serializer = RemedySerializer(remedies, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please complete your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
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
    
    try:
        # Convert date string to date object
        from datetime import datetime
        track_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }, status=status.HTTP_400_BAD_REQUEST)
    
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
def get_experts(request):
    """Get list of available experts."""
    experts = Expert.objects.filter(is_active=True).order_by('-rating', '-experience_years')
    serializer = ExpertSerializer(experts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


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
    expert_id = request.data.get('expert')
    consultation_type = request.data.get('consultation_type')
    scheduled_at = request.data.get('scheduled_at')
    duration_minutes = request.data.get('duration_minutes', 30)
    notes = request.data.get('notes', '')
    
    # Validate input
    if not expert_id or not consultation_type or not scheduled_at:
        return Response({
            'error': 'Expert, consultation type, and scheduled time are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Convert scheduled_at string to datetime object
        from datetime import datetime
        scheduled_datetime = datetime.strptime(scheduled_at, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        return Response({
            'error': 'Invalid date format. Use ISO format: YYYY-MM-DDTHH:MM:SS'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if expert exists and is active
        expert = Expert.objects.get(id=expert_id, is_active=True)
        
        # Check if slot is available (basic check - in a real app this would be more sophisticated)
        existing_consultations = Consultation.objects.filter(
            expert=expert,
            scheduled_at__date=scheduled_datetime.date(),
            scheduled_at__hour=scheduled_datetime.hour,
            status__in=['pending', 'confirmed']
        )
        
        if existing_consultations.exists():
            return Response({
                'error': 'This time slot is not available. Please choose another time.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create consultation
        consultation = Consultation.objects.create(
            user=user,
            expert=expert,
            consultation_type=consultation_type,
            scheduled_at=scheduled_datetime,
            duration_minutes=duration_minutes,
            notes=notes,
            status='pending'
        )
        
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Expert.DoesNotExist:
        return Response({
            'error': 'Expert not found or not available'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to book consultation: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upcoming_consultations(request):
    """Get user's upcoming consultations."""
    user = request.user
    from datetime import datetime
    upcoming_consultations = Consultation.objects.filter(
        user=user,
        scheduled_at__gte=datetime.now(),
        status__in=['pending', 'confirmed']
    ).order_by('scheduled_at')
    
    serializer = ConsultationSerializer(upcoming_consultations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_past_consultations(request):
    """Get user's past consultations."""
    user = request.user
    from datetime import datetime
    past_consultations = Consultation.objects.filter(
        user=user,
        scheduled_at__lt=datetime.now()
    ).order_by('-scheduled_at')
    
    serializer = ConsultationSerializer(past_consultations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_consultation(request, consultation_id):
    """Rate a completed consultation."""
    user = request.user
    rating = request.data.get('rating')
    review_text = request.data.get('review_text', '')
    is_anonymous = request.data.get('is_anonymous', False)
    
    # Validate rating
    if not rating or not (1 <= rating <= 5):
        return Response({
            'error': 'Rating must be between 1 and 5'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get consultation
        consultation = Consultation.objects.get(
            id=consultation_id,
            user=user,
            status='completed'
        )
        
        # Create or update review
        review, created = ConsultationReview.objects.update_or_create(
            consultation=consultation,
            defaults={
                'rating': rating,
                'review_text': review_text,
                'is_anonymous': is_anonymous
            }
        )
        
        # Update expert rating (simple average calculation)
        expert_reviews = ConsultationReview.objects.filter(consultation__expert=consultation.expert)
        total_rating = sum(review.rating for review in expert_reviews)
        average_rating = total_rating / expert_reviews.count() if expert_reviews.count() > 0 else 0
        
        consultation.expert.rating = round(average_rating, 2)
        consultation.expert.save()
        
        serializer = ConsultationReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
        
    except Consultation.DoesNotExist:
        return Response({
            'error': 'Consultation not found or not completed'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to rate consultation: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_full_numerology_report(request):
    """Get comprehensive numerology report."""
    user = request.user
    
    try:
        # Get user's numerology profile
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
            ('birthday_number', profile.personal_month_number),  # Using month number as birthday number
        ]
        
        for field_name, number in numbers:
            try:
                interpretations[field_name] = get_interpretation(number)
            except ValueError:
                interpretations[field_name] = None
        
        # Calculate pinnacle cycles (simplified implementation)
        # In a real application, this would be more complex
        birth_date = user.profile.date_of_birth
        if birth_date:
            pinnacle_cycles = []
            calculator = NumerologyCalculator()
            
            # First pinnacle cycle (birth to ~26-35 years)
            first_pinnacle_end = 36 - calculator._reduce_to_single_digit(birth_date.day)
            pinnacle_cycles.append({
                'number': profile.life_path_number,
                'age': f"0-{first_pinnacle_end}",
                'title': interpretations.get('life_path_number', {}).get('title', 'Unknown') if interpretations.get('life_path_number') else 'Unknown'
            })
            
            # Second pinnacle cycle
            second_number = calculator._reduce_to_single_digit(birth_date.month)
            second_pinnacle_end = first_pinnacle_end + 9
            pinnacle_cycles.append({
                'number': second_number,
                'age': f"{first_pinnacle_end + 1}-{second_pinnacle_end}",
                'title': interpretations.get('destiny_number', {}).get('title', 'Unknown') if interpretations.get('destiny_number') else 'Unknown'
            })
            
            # Third and fourth pinnacle cycles would be calculated similarly
        else:
            pinnacle_cycles = []
        
        # Create report data
        report_data = {
            'full_name': user.full_name,
            'birth_date': birth_date,
            'life_path_number': profile.life_path_number,
            'life_path_title': interpretations.get('life_path_number', {}).get('title', 'Unknown') if interpretations.get('life_path_number') else 'Unknown',
            'destiny_number': profile.destiny_number,
            'destiny_title': interpretations.get('destiny_number', {}).get('title', 'Unknown') if interpretations.get('destiny_number') else 'Unknown',
            'soul_urge_number': profile.soul_urge_number,
            'soul_urge_title': interpretations.get('soul_urge_number', {}).get('title', 'Unknown') if interpretations.get('soul_urge_number') else 'Unknown',
            'personality_number': profile.personality_number,
            'personality_title': interpretations.get('personality_number', {}).get('title', 'Unknown') if interpretations.get('personality_number') else 'Unknown',
            'birthday_number': profile.personal_month_number,
            'birthday_title': interpretations.get('birthday_number', {}).get('title', 'Unknown') if interpretations.get('birthday_number') else 'Unknown',
            'challenge_number': profile.balance_number,  # Using balance number as challenge number
            'challenge_title': interpretations.get('challenge_number', {}).get('title', 'Unknown') if interpretations.get('challenge_number') else 'Unknown',
            'pinnacle_cycle': pinnacle_cycles,
            'summary': f"Your numerology profile reveals a {interpretations.get('life_path_number', {}).get('title', 'unique individual')} with strong {interpretations.get('destiny_number', {}).get('title', 'potential')}."
        }
        
        serializer = NumerologyReportSerializer(report_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please complete your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to generate report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_full_numerology_report_pdf(request):
    """Export full numerology report as PDF."""
    user = request.user
    
    try:
        # Get user's numerology profile
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
            ('birthday_number', profile.personal_month_number),
        ]
        
        for field_name, number in numbers:
            try:
                interpretations[field_name] = get_interpretation(number)
            except ValueError:
                interpretations[field_name] = {'title': 'Unknown', 'description': 'Interpretation not available'}

        # Create PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="numerology_report_{user.full_name.replace(" ", "_")}.pdf"'
        
        # Create PDF document
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        
        # Title
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, height - 50, f"Numerology Report for {user.full_name}")
        
        # User info
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 80, f"Date of Birth: {user.profile.date_of_birth}")
        p.drawString(50, height - 100, f"Report Generated: {timezone.now().strftime('%Y-%m-%d')}")
        
        # Core Numbers table
        data = [
            ['Number Type', 'Value', 'Title', 'Description'],
            ['Life Path', str(profile.life_path_number), 
             interpretations.get('life_path_number', {}).get('title', 'Unknown'),
             interpretations.get('life_path_number', {}).get('description', '')[:50] + '...'],
            ['Destiny', str(profile.destiny_number),
             interpretations.get('destiny_number', {}).get('title', 'Unknown'),
             interpretations.get('destiny_number', {}).get('description', '')[:50] + '...'],
            ['Soul Urge', str(profile.soul_urge_number),
             interpretations.get('soul_urge_number', {}).get('title', 'Unknown'),
             interpretations.get('soul_urge_number', {}).get('description', '')[:50] + '...'],
            ['Personality', str(profile.personality_number),
             interpretations.get('personality_number', {}).get('title', 'Unknown'),
             interpretations.get('personality_number', {}).get('description', '')[:50] + '...'],
            ['Birthday', str(profile.personal_month_number),
             interpretations.get('birthday_number', {}).get('title', 'Unknown'),
             interpretations.get('birthday_number', {}).get('description', '')[:50] + '...'],
            ['Challenge', str(profile.balance_number),
             interpretations.get('challenge_number', {}).get('title', 'Unknown'),
             interpretations.get('challenge_number', {}).get('description', '')[:50] + '...'],
        ]
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        table.wrapOn(p, width, height)
        table.drawOn(p, 50, height - 350)
        
        # Footer
        p.setFont("Helvetica", 10)
        p.drawString(50, 50, "Generated by NumerAI - Your Personal Numerology Guide")
        
        p.showPage()
        p.save()
        
        return response
        
    except NumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Please complete your numerology profile first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to generate PDF: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# New API endpoints for multi-person numerology

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def people_list_create(request):
    """Get list of people or create a new person."""
    if request.method == 'GET':
        # Get all people for the current user
        people = Person.objects.filter(user=request.user, is_active=True)
        serializer = PersonSerializer(people, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create a new person
        serializer = PersonSerializer(data=request.data)
        if serializer.is_valid():
            # Check if person already exists
            existing_person = Person.objects.filter(
                user=request.user,
                name=serializer.validated_data['name'],
                birth_date=serializer.validated_data['birth_date']
            ).first()
            
            if existing_person:
                return Response({
                    'error': 'Person with this name and birth date already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new person
            person = serializer.save(user=request.user)
            return Response(PersonSerializer(person).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def person_detail(request, person_id):
    """Get, update, or delete a specific person."""
    try:
        person = Person.objects.get(id=person_id, user=request.user)
    except Person.DoesNotExist:
        return Response({
            'error': 'Person not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get person details
        serializer = PersonSerializer(person)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Update person
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Soft delete person
        person.is_active = False
        person.save()
        return Response({
            'message': 'Person deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_person_numerology(request, person_id):
    """Calculate numerology profile for a specific person."""
    try:
        person = Person.objects.get(id=person_id, user=request.user, is_active=True)
    except Person.DoesNotExist:
        return Response({
            'error': 'Person not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get calculation system from request or use default
    system = request.data.get('system', 'pythagorean')
    
    try:
        # Calculate all numbers
        calculator = NumerologyCalculator(system=system)
        numbers = calculator.calculate_all(person.name, person.birth_date)
        
        # Update or create profile
        profile, created = PersonNumerologyProfile.objects.update_or_create(
            person=person,
            defaults={
                **numbers,
                'calculation_system': system
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
        person = Person.objects.get(id=person_id, user=request.user, is_active=True)
        profile = PersonNumerologyProfile.objects.get(person=person)
        serializer = PersonNumerologyProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Person.DoesNotExist:
        return Response({
            'error': 'Person not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except PersonNumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate it first.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_templates_list(request):
    """Get list of available report templates."""
    templates = ReportTemplate.objects.filter(is_active=True)
    serializer = ReportTemplateSerializer(templates, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    """Generate a new report for a person using a template."""
    person_id = request.data.get('person_id')
    template_id = request.data.get('template_id')
    
    # Validate input
    if not person_id or not template_id:
        return Response({
            'error': 'Person ID and Template ID are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get person and template
        person = Person.objects.get(id=person_id, user=request.user, is_active=True)
        template = ReportTemplate.objects.get(id=template_id, is_active=True)
    except Person.DoesNotExist:
        return Response({
            'error': 'Person not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except ReportTemplate.DoesNotExist:
        return Response({
            'error': 'Report template not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Get person's numerology profile
        numerology_profile = PersonNumerologyProfile.objects.get(person=person)
    except PersonNumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found. Please calculate it first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate report content based on template type
        report_content = _generate_report_content(person, numerology_profile, template)
        
        # Create generated report
        generated_report = GeneratedReport.objects.create(
            user=request.user,
            person=person,
            template=template,
            title=f"{template.name} for {person.name}",
            content=report_content
        )
        
        serializer = GeneratedReportSerializer(generated_report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to generate report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generated_reports(request):
    """Get list of user's generated reports."""
    reports = GeneratedReport.objects.filter(user=request.user).order_by('-generated_at')
    serializer = GeneratedReportSerializer(reports, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generated_report(request, report_id):
    """Get a specific generated report."""
    try:
        report = GeneratedReport.objects.get(id=report_id, user=request.user)
        serializer = GeneratedReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except GeneratedReport.DoesNotExist:
        return Response({
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_generate_reports(request):
    """Generate multiple reports at once."""
    person_ids = request.data.get('person_ids', [])
    template_ids = request.data.get('template_ids', [])
    
    # Validate input
    if not person_ids or not template_ids:
        return Response({
            'error': 'Person IDs and Template IDs are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    generated_reports = []
    errors = []
    
    # Generate reports for each combination
    for person_id in person_ids:
        for template_id in template_ids:
            try:
                # Get person and template
                person = Person.objects.get(id=person_id, user=request.user, is_active=True)
                template = ReportTemplate.objects.get(id=template_id, is_active=True)
                
                # Get person's numerology profile
                numerology_profile = PersonNumerologyProfile.objects.get(person=person)
                
                # Generate report content
                report_content = _generate_report_content(person, numerology_profile, template)
                
                # Create generated report
                generated_report = GeneratedReport.objects.create(
                    user=request.user,
                    person=person,
                    template=template,
                    title=f"{template.name} for {person.name}",
                    content=report_content
                )
                
                generated_reports.append(generated_report)
                
            except Person.DoesNotExist:
                errors.append(f"Person with ID {person_id} not found")
            except ReportTemplate.DoesNotExist:
                errors.append(f"Template with ID {template_id} not found")
            except PersonNumerologyProfile.DoesNotExist:
                errors.append(f"Numerology profile for {person.name} not found")
            except Exception as e:
                errors.append(f"Failed to generate report for {person.name} with template {template.name}: {str(e)}")
    
    # Serialize generated reports
    serializer = GeneratedReportSerializer(generated_reports, many=True)
    
    response_data = {
        'reports': serializer.data,
        'errors': errors
    }
    
    return Response(response_data, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)


# Helper function to generate report content
def _generate_report_content(person, numerology_profile, template):
    """Generate report content based on template type."""
    from .interpretations import get_interpretation
    
    content = {
        'person_name': person.name,
        'birth_date': person.birth_date.isoformat(),
        'report_type': template.report_type,
        'generated_at': timezone.now().isoformat(),
        'numbers': {
            'life_path': numerology_profile.life_path_number,
            'destiny': numerology_profile.destiny_number,
            'soul_urge': numerology_profile.soul_urge_number,
            'personality': numerology_profile.personality_number,
            'attitude': numerology_profile.attitude_number,
            'maturity': numerology_profile.maturity_number,
            'balance': numerology_profile.balance_number,
            'personal_year': numerology_profile.personal_year_number,
            'personal_month': numerology_profile.personal_month_number,
        }
    }
    
    # Add interpretations for each number
    interpretations = {}
    number_fields = ['life_path', 'destiny', 'soul_urge', 'personality', 
                     'attitude', 'maturity', 'balance', 'personal_year', 'personal_month']
    
    for field in number_fields:
        number_value = getattr(numerology_profile, f'{field}_number')
        try:
            interpretations[field] = get_interpretation(number_value)
        except ValueError:
            interpretations[field] = {
                'number': number_value,
                'title': 'Unknown',
                'description': 'Interpretation not available',
                'strengths': [],
                'challenges': [],
                'career': [],
                'relationships': '',
                'life_purpose': ''
            }
    
    content['interpretations'] = interpretations
    
    # Add template-specific content
    if template.report_type == 'basic':
        content['summary'] = f"This is a basic birth chart for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your numerology report, {person.name}. This basic report provides an overview of your core numbers.",
            'life_path': f"Your Life Path number {numerology_profile.life_path_number} reveals your purpose and direction in life.",
            'destiny': f"Your Destiny number {numerology_profile.destiny_number} shows your talents and potential.",
            'soul_urge': f"Your Soul Urge number {numerology_profile.soul_urge_number} reflects your inner desires and motivations."
        }
    elif template.report_type == 'detailed':
        content['summary'] = f"This is a detailed analysis for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your comprehensive numerology report, {person.name}. This detailed analysis explores all aspects of your numerological profile.",
            'life_path': f"Your Life Path number {numerology_profile.life_path_number} is the most significant number in your chart, revealing your purpose and direction in life.",
            'destiny': f"Your Destiny number {numerology_profile.destiny_number} shows your innate talents and potential that you'll express throughout your lifetime.",
            'soul_urge': f"Your Soul Urge number {numerology_profile.soul_urge_number} reflects your inner desires and motivations that drive you from within.",
            'personality': f"Your Personality number {numerology_profile.personality_number} shows how others perceive you and how you present yourself to the world.",
            'attitude': f"Your Attitude number {numerology_profile.attitude_number} represents your instinctive reaction to new situations and people.",
            'maturity': f"Your Maturity number {numerology_profile.maturity_number} reveals the lessons and wisdom you gain as you grow older.",
            'balance': f"Your Balance number {numerology_profile.balance_number} indicates what you need to balance in your life for harmony.",
            'personal_year': f"Your Personal Year number {numerology_profile.personal_year_number} shows the themes and opportunities for this year.",
            'personal_month': f"Your Personal Month number {numerology_profile.personal_month_number} highlights the energies influencing this month."
        }
    elif template.report_type == 'compatibility':
        content['summary'] = f"This is a compatibility report for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your compatibility report, {person.name}. This analysis focuses on relationship dynamics.",
            'compatibility_numbers': [
                {
                    'number': numerology_profile.life_path_number,
                    'type': 'Life Path',
                    'description': 'Your approach to life and relationships'
                },
                {
                    'number': numerology_profile.destiny_number,
                    'type': 'Destiny',
                    'description': 'Your shared talents and goals'
                },
                {
                    'number': numerology_profile.soul_urge_number,
                    'type': 'Soul Urge',
                    'description': 'Your emotional compatibility'
                }
            ]
        }
    # Add more template types as needed
    
    return content