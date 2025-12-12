"""
API views for NumerAI accounts application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken, Notification
from .serializers import (
    UserRegistrationSerializer, OTPVerificationSerializer, ResendOTPSerializer,
    LoginSerializer, LogoutSerializer, RefreshTokenSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordResetTokenRequestSerializer, PasswordResetTokenConfirmSerializer,
    UserProfileSerializer, DeviceTokenSerializer, NotificationSerializer
)
from .utils import generate_otp, send_otp_email, generate_secure_token, send_password_reset_email
import os

logger = logging.getLogger(__name__)


# Authentication Views

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user."""
    # #region agent log
    import json
    request_data_str = json.dumps(request.data) if request.data else '{}'
    logger.info(f'register_request_received', extra={
        'has_data': bool(request.data),
        'data_keys': list(request.data.keys()) if request.data else [],
        'data_preview': request_data_str[:200] if request_data_str else 'none'
    })
    # #endregion
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            # #region agent log
            logger.info(f'register_user_created', extra={'user_id': str(user.id), 'email': getattr(user, 'email', None)})
            # #endregion
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
        except Exception as e:
            # #region agent log
            logger.error(f'register_user_creation_failed', extra={'error': str(e), 'error_type': type(e).__name__}, exc_info=True)
            # #endregion
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # #region agent log
    logger.warning(f'register_validation_failed', extra={'errors': serializer.errors})
    # #endregion
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
    
    # Check for unverified account before validation
    # This allows us to return user info for redirect
    email = request.data.get('email')
    phone = request.data.get('phone')
    password = request.data.get('password')
    
    if email or phone:
        # Find user to check verification status
        if email:
            user = User.objects.filter(email=email).first()
        else:
            user = User.objects.filter(phone=phone).first()
        
        # If user exists, password is correct, but account is not verified
        if user and password and user.check_password(password) and not user.is_verified:
            # Don't increment failed login attempts for unverified accounts
            return Response({
                'error': {
                    'message': 'Account not verified',
                    'code': 'ACCOUNT_NOT_VERIFIED',
                    'requires_verification': True,
                    'email': user.email,
                    'phone': user.phone,
                }
            }, status=status.HTTP_403_FORBIDDEN)
    
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
    
    # Format errors for better frontend handling
    error_messages = []
    if isinstance(serializer.errors, dict):
        for field, errors in serializer.errors.items():
            if isinstance(errors, list):
                error_messages.extend([f"{field}: {error}" for error in errors])
            else:
                error_messages.append(f"{field}: {errors}")
    else:
        error_messages = [str(serializer.errors)]
    
    return Response({
        'error': {
            'message': 'Login failed',
            'details': error_messages[0] if len(error_messages) == 1 else error_messages,
            'fields': serializer.errors
        }
    }, status=status.HTTP_400_BAD_REQUEST)


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

class ProfileRateThrottle(UserRateThrottle):
    """Custom throttle for profile endpoint."""
    rate = '200/minute'


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [ProfileRateThrottle]
    
    def get_object(self):
        # Type checker issues are suppressed with # type: ignore comments
        # #region agent log
        user_id = str(self.request.user.id) if hasattr(self.request.user, 'id') else 'anonymous'
        has_profile_attr = hasattr(self.request.user, 'profile')
        logger.info(f'get_object called', extra={'user_id': user_id, 'has_profile_attr': has_profile_attr, 'is_authenticated': self.request.user.is_authenticated})
        # #endregion
        # Safely get profile, creating one if it doesn't exist
        try:
            profile = self.request.user.profile  # type: ignore
        except UserProfile.DoesNotExist:
            # #region agent log
            logger.warning(f'profile_does_not_exist_creating', extra={'user_id': user_id})
            # #endregion
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=self.request.user)
        except AttributeError:
            # #region agent log
            logger.error(f'user_missing_profile_attr', extra={'user_id': user_id, 'user_type': type(self.request.user).__name__})
            # #endregion
            raise UserProfile.DoesNotExist("User profile relationship does not exist")
        return profile
    
    def get(self, request, *args, **kwargs):
        """Retrieve user profile with consistent response format."""
        # #region agent log
        user_id = str(request.user.id) if hasattr(request.user, 'id') else 'anonymous'
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'none')
        logger.info(f'profile_get_request', extra={'user_id': user_id, 'auth_header_present': bool(auth_header and auth_header != 'none'), 'auth_header_prefix': auth_header[:20] if auth_header != 'none' else 'none', 'is_authenticated': request.user.is_authenticated})
        # #endregion
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            logger.error(f'profile_not_found', extra={
                'user_id': str(request.user.id),
                'error': 'UserProfile does not exist'
            })
            return Response(
                {'error': 'Profile not found. Please contact support.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f'profile_get_error', extra={
                'user_id': str(request.user.id),
                'error': str(e)
            }, exc_info=True)
            return Response(
                {'error': 'Failed to retrieve profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Update user profile with transaction handling."""
        import time
        start_time = time.time()
        user_id = str(request.user.id)
        
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            
            if not serializer.is_valid():
                logger.warning('profile_update_validation_failed', extra={
                    'user_id': user_id,
                    'fields': list(request.data.keys()),
                    'errors': serializer.errors
                })
                return Response(
                    {
                        'error': 'Validation failed',
                        'field_errors': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Log update start
            fields_to_update = list(request.data.keys())
            logger.info('profile_update_started', extra={
                'user_id': user_id,
                'fields': fields_to_update
            })
            
            # Use transaction to ensure atomicity
            with transaction.atomic():
                serializer.save()
            
            # Log success
            duration = time.time() - start_time
            logger.info('profile_update_success', extra={
                'user_id': user_id,
                'fields': fields_to_update,
                'duration_seconds': round(duration, 3)
            })
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error('profile_update_error', extra={
                'user_id': user_id,
                'fields': list(request.data.keys()) if request.data else [],
                'error': str(e),
                'duration_seconds': round(duration, 3)
            }, exc_info=True)
            
            return Response(
                {
                    'error': 'Failed to update profile',
                    'detail': str(e) if str(e) else 'An unexpected error occurred'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests (partial update)."""
        return self.update(request, *args, **kwargs)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """Get user's notifications."""
    from django.db import ProgrammingError, OperationalError
    
    try:
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(notifications, request)
        serializer = NotificationSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e)
        if 'does not exist' in error_msg or 'relation' in error_msg.lower():
            logger.warning(f"Notifications table missing in list_notifications: {error_msg}")
            # Return empty response gracefully
            paginator = PageNumberPagination()
            paginator.page_size = 20
            return paginator.get_paginated_response([])
        raise
    except Exception as e:
        logger.error(f"Error listing notifications: {str(e)}")
        return Response(
            {'error': 'Failed to retrieve notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read."""
    from django.db import ProgrammingError, OperationalError
    
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e)
        if 'does not exist' in error_msg or 'relation' in error_msg.lower():
            logger.warning(f"Notifications table missing in mark_notification_read: {error_msg}")
            return Response({'message': 'Notification marked as read'})  # Graceful fallback
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notification as read'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read."""
    from django.db import ProgrammingError, OperationalError
    
    try:
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read'})
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e)
        if 'does not exist' in error_msg or 'relation' in error_msg.lower():
            logger.warning(f"Notifications table missing in mark_all_notifications_read: {error_msg}")
            return Response({'message': 'All notifications marked as read'})  # Graceful fallback
        raise
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark all notifications as read'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a notification."""
    from django.db import ProgrammingError, OperationalError
    
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.delete()
        return Response({'message': 'Notification deleted'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e)
        if 'does not exist' in error_msg or 'relation' in error_msg.lower():
            logger.warning(f"Notifications table missing in delete_notification: {error_msg}")
            return Response({'message': 'Notification deleted'})  # Graceful fallback
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        return Response(
            {'error': 'Failed to delete notification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class NotificationRateThrottle(UserRateThrottle):
    """Custom throttle for notifications endpoint."""
    rate = '200/minute'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    """Get count of unread notifications."""
    from django.db import ProgrammingError, OperationalError
    
    try:
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'count': count})
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e)
        if 'does not exist' in error_msg or 'relation' in error_msg.lower():
            logger.warning(f"Notifications table missing in unread_notifications_count: {error_msg}")
            # Return 0 gracefully instead of error
            return Response({'count': 0}, status=status.HTTP_200_OK)
        raise
    except Exception as e:
        logger.error(f"Error getting unread notifications count: {str(e)}")
        return Response({'count': 0}, status=status.HTTP_200_OK)


# Social Authentication Views

@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth(request):
    """
    Handle Google OAuth callback and create/login user.
    
    POST /api/v1/auth/social/google/
    Body: {
        "access_token": "google_access_token" OR "code": "authorization_code"
    }
    """
    import requests
    from django.conf import settings
    
    access_token = request.data.get('access_token')
    code = request.data.get('code')
    
    # If code is provided, exchange it for access token
    if code and not access_token:
        try:
            client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '') or settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {}).get('client_id', '')
            client_secret = getattr(settings, 'GOOGLE_OAUTH_CLIENT_SECRET', '') or settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {}).get('secret', '')
            redirect_uri = request.data.get('redirect_uri', f"{settings.FRONTEND_URL}/auth/google/callback")
            
            token_response = requests.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'redirect_uri': redirect_uri,
                    'grant_type': 'authorization_code',
                }
            )
            
            if token_response.status_code != 200:
                return Response(
                    {'error': 'Failed to exchange authorization code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token_data = token_response.json()
            access_token = token_data.get('access_token')
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error exchanging Google OAuth code: {str(e)}")
            return Response(
                {'error': 'Failed to exchange authorization code'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    if not access_token:
        return Response(
            {'error': 'access_token or code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify token with Google
        google_user_info = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        ).json()
        
        if 'error' in google_user_info:
            return Response(
                {'error': 'Invalid access token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = google_user_info.get('email')
        if not email:
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': google_user_info.get('name', ''),
                'is_verified': True,  # Google verified email
            }
        )
        
        if not created:
            # Update user info if needed
            if not user.full_name and google_user_info.get('name'):
                user.full_name = google_user_info.get('name')
            user.is_verified = True
            user.save()
        
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)
        
        # Store refresh token
        RefreshToken.objects.create(
            user=user,
            token=refresh_token_jwt,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'message': 'Login successful',
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'phone': user.phone,
                'full_name': user.full_name,
                'subscription_plan': user.subscription_plan,
                'is_verified': user.is_verified
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in Google OAuth: {str(e)}")
        return Response(
            {'error': 'Authentication failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Account Management Views

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Delete user account (soft delete).
    
    POST /api/v1/users/delete-account/
    Body: {
        "password": "user_password" (optional, for verification)
    }
    """
    try:
        user = request.user
        
        # Soft delete: mark as inactive
        user.is_active = False
        user.save(update_fields=['is_active'])
        
        # Log deletion (you can create an audit log model if needed)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Account deleted: {user.id} - {user.email}")
        
        return Response({
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error deleting account: {str(e)}")
        return Response(
            {'error': 'Failed to delete account'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """
    Export user data (GDPR compliance).
    
    POST /api/v1/users/export-data/
    Returns: JSON file with all user data
    """
    import json
    from django.http import HttpResponse
    from accounts.models import UserProfile
    
    try:
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Collect all user data
        user_data = {
            'user': {
                'id': str(user.id),
                'email': user.email,
                'phone': user.phone,
                'full_name': user.full_name,
                'is_verified': user.is_verified,
                'subscription_plan': user.subscription_plan,
                'created_at': user.created_at.isoformat() if user.created_at else None,
            },
            'profile': {
                'date_of_birth': profile.date_of_birth.isoformat() if profile and profile.date_of_birth else None,
                'gender': profile.gender if profile else None,
                'timezone': profile.timezone if profile else None,
                'location': profile.location if profile else None,
                'bio': profile.bio if profile else None,
            },
            'notifications': [
                {
                    'title': n.title,
                    'message': n.message,
                    'type': n.notification_type,
                    'is_read': n.is_read,
                    'created_at': n.created_at.isoformat(),
                }
                for n in Notification.objects.filter(user=user).order_by('-created_at')[:100]
            ],
        }
        
        # Create JSON response
        response = HttpResponse(
            json.dumps(user_data, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="numerai_data_export_{user.id}.json"'
        
        return response
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error exporting data: {str(e)}")
        return Response(
            {'error': 'Failed to export data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

