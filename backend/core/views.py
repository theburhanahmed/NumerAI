"""
API views for NumerAI core application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.utils import timezone
from datetime import timedelta, date, datetime
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken, NumerologyProfile, DailyReading
from .serializers import (
    UserRegistrationSerializer, OTPVerificationSerializer, ResendOTPSerializer,
    LoginSerializer, LogoutSerializer, RefreshTokenSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserProfileSerializer, DeviceTokenSerializer,
    NumerologyProfileSerializer, DailyReadingSerializer, BirthChartSerializer
)
from .utils import generate_otp, send_otp_email
from .numerology import NumerologyCalculator, validate_name, validate_birth_date
from .interpretations import get_interpretation, get_all_interpretations
from .reading_generator import DailyReadingGenerator
from .cache import NumerologyCache


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
    """Calculate and save numerology profile for user."""
    user = request.user
    
    # Check if user has completed profile
    if not user.profile.date_of_birth:
        return Response({
            'error': 'Please complete your profile with birth date first'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate birth date
    if not validate_birth_date(user.profile.date_of_birth):
        return Response({
            'error': 'Invalid birth date'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate name
    if not validate_name(user.full_name):
        return Response({
            'error': 'Invalid name'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get calculation system from request or use default
    system = request.data.get('system', 'pythagorean')
    
    try:
        # Calculate all numbers
        calculator = NumerologyCalculator(system=system)
        numbers = calculator.calculate_all(user.full_name, user.profile.date_of_birth)
        
        # Update or create profile
        profile, created = NumerologyProfile.objects.update_or_create(
            user=user,
            defaults={
                **numbers,
                'calculation_system': system
            }
        )
        
        # Cache the profile
        serializer = NumerologyProfileSerializer(profile)
        NumerologyCache.set_profile(str(user.id), serializer.data)
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_reading(request):
    """Get daily reading for today or specific date."""
    user = request.user
    
    # Get date from query params or use today
    date_str = request.query_params.get('date')
    if date_str:
        try:
            reading_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        reading_date = date.today()
    
    # Check if user has birth date
    if not user.profile.date_of_birth:
        return Response({
            'error': 'Please complete your profile with birth date first'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check cache first
    cached_reading = NumerologyCache.get_daily_reading(str(user.id), str(reading_date))
    if cached_reading:
        return Response(cached_reading, status=status.HTTP_200_OK)
    
    # Check database
    reading = DailyReading.objects.filter(user=user, reading_date=reading_date).first()
    
    if not reading:
        # Generate new reading
        try:
            calculator = NumerologyCalculator()
            personal_day_number = calculator.calculate_personal_day_number(
                user.profile.date_of_birth,
                reading_date
            )
            
            generator = DailyReadingGenerator()
            reading_content = generator.generate_reading(personal_day_number)
            
            reading = DailyReading.objects.create(
                user=user,
                reading_date=reading_date,
                personal_day_number=personal_day_number,
                **reading_content
            )
        except Exception as e:
            return Response({
                'error': f'Failed to generate reading: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    serializer = DailyReadingSerializer(reading)
    
    # Cache the result
    NumerologyCache.set_daily_reading(str(user.id), str(reading_date), serializer.data)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


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
@permission_classes([AllowAny])
def health_check(request):
    """API health check endpoint."""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)