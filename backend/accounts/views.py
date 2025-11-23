"""
API views for NumerAI accounts application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.utils import timezone
from datetime import timedelta
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken
from .serializers import (
    UserRegistrationSerializer, OTPVerificationSerializer, ResendOTPSerializer,
    LoginSerializer, LogoutSerializer, RefreshTokenSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordResetTokenRequestSerializer, PasswordResetTokenConfirmSerializer,
    UserProfileSerializer, DeviceTokenSerializer
)
from .utils import generate_otp, send_otp_email, generate_secure_token, send_password_reset_email
import os


# Authentication Views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        response_data = {
            'message': 'Registration successful. Please check your email for OTP.',
            'user_id': str(getattr(user, 'id', '')),
        }
        email = getattr(user, 'email', None)
        if email:
            response_data['email'] = email
        phone = getattr(user, 'phone', None)
        if phone:
            response_data['phone'] = phone
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and activate account."""
    serializer = OTPVerificationSerializer(data=request.data)
    if serializer.is_valid():
        # Access validated_data safely
        # Type checker issues are suppressed with # type: ignore comments
        user_data = serializer.validated_data['user']  # type: ignore
        otp_data = serializer.validated_data['otp_obj']  # type: ignore
        
        try:
            # Mark OTP as used
            otp_data.is_used = True
            otp_data.save()
        
            # Verify user
            user_data.is_verified = True
            user_data.save()
        
            # Generate JWT tokens
            refresh = JWTRefreshToken.for_user(user_data)
            access_token = str(getattr(refresh, 'access_token', refresh))
            refresh_token = str(refresh)
        
            # Store refresh token
            RefreshToken.objects.create(
                user=user_data,
                token=refresh_token,
                expires_at=timezone.now() + timedelta(days=7)
            )
        
            user_response_data = {
                'id': str(getattr(user_data, 'id', '')),
                'full_name': getattr(user_data, 'full_name', ''),
            }
            
            if hasattr(user_data, 'email'):
                user_response_data['email'] = user_data.email
            if hasattr(user_data, 'phone'):
                user_response_data['phone'] = user_data.phone
        
            return Response({
                'message': 'Account verified successfully',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user_response_data
            }, status=status.HTTP_200_OK)
        except (KeyError, AttributeError) as e:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Increment attempts if OTP object exists
    try:
        # Type checker issues are suppressed with # type: ignore comments
        if hasattr(serializer, 'validated_data') and serializer.validated_data and 'otp_obj' in serializer.validated_data:  # type: ignore
            otp_obj = serializer.validated_data['otp_obj']  # type: ignore
            if otp_obj:
                otp_obj.increment_attempts()
    except (KeyError, AttributeError):
        pass
    
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
        # Access validated_data safely
        # Type checker issues are suppressed with # type: ignore comments
        user = serializer.validated_data['user']  # type: ignore
        
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token = str(getattr(refresh, 'access_token', refresh))
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
        # Access validated_data safely
        # Type checker issues are suppressed with # type: ignore comments
        refresh_token = serializer.validated_data['refresh_token']  # type: ignore
        
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
        # Access validated_data safely
        # Type checker issues are suppressed with # type: ignore comments
        refresh_token = serializer.validated_data['refresh_token']  # type: ignore
        
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
        # Access validated_data safely
        # Type checker issues are suppressed with # type: ignore comments
        email = serializer.validated_data['email']  # type: ignore
        
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
        
        if send_otp_email(user.email, otp_code):
            return Response({
                'message': 'Password reset OTP sent to your email'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send password reset email. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with OTP."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        # Type checker issues are suppressed with # type: ignore comments
        email = serializer.validated_data['email']  # type: ignore
        otp_code = serializer.validated_data['otp']  # type: ignore
        new_password = serializer.validated_data['new_password']  # type: ignore
        
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
        # Type checker issues are suppressed with # type: ignore comments
        email = serializer.validated_data['email']  # type: ignore
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
        # Type checker issues are suppressed with # type: ignore comments
        token = serializer.validated_data['token']  # type: ignore
        new_password = serializer.validated_data['new_password']  # type: ignore
        
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
        # Type checker issues are suppressed with # type: ignore comments
        return self.request.user.profile  # type: ignore


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device_token(request):
    """Register FCM device token for push notifications."""
    serializer = DeviceTokenSerializer(data=request.data)
    if serializer.is_valid():
        # Check if token already exists
        # Type checker issues are suppressed with # type: ignore comments
        existing_token = DeviceToken.objects.filter(
            fcm_token=serializer.validated_data['fcm_token']  # type: ignore
        ).first()
        
        if existing_token:
            existing_token.user = request.user
            existing_token.device_type = serializer.validated_data['device_type']  # type: ignore
            existing_token.device_name = serializer.validated_data.get('device_name')  # type: ignore
            existing_token.is_active = True
            existing_token.save()
        else:
            DeviceToken.objects.create(
                user=request.user,
                **serializer.validated_data  # type: ignore
            )
        
        return Response({
            'message': 'Device token registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)