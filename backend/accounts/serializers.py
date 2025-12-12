"""
Serializers for NumerAI accounts application.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken, Notification


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=6)  # Match frontend validation
    confirm_password = serializers.CharField(write_only=True)
    
    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d', '%Y/%m/%d', 'iso-8601'])
    gender = serializers.ChoiceField(
        choices=UserProfile.GENDER_CHOICES,
        required=False,
        allow_null=True
    )
    timezone = serializers.CharField(max_length=50, required=False, default='Asia/Kolkata')
    location = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    
    def to_internal_value(self, data):
        """Handle date_of_birth as string from frontend."""
        # Handle empty string for date_of_birth
        if 'date_of_birth' in data and data['date_of_birth'] == '':
            data = data.copy()
            data['date_of_birth'] = None
        return super().to_internal_value(data)
    
    class Meta:
        model = User
        fields = [
            'email', 'phone', 'full_name', 'password', 'confirm_password',
            'date_of_birth', 'gender', 'timezone', 'location'
        ]
    
    def validate(self, attrs):
        """Validate registration data."""
        import logging
        logger = logging.getLogger(__name__)
        # #region agent log
        logger.info(f'registration_validate_started', extra={'has_email': bool(attrs.get('email')), 'has_phone': bool(attrs.get('phone')), 'has_password': bool(attrs.get('password')), 'has_confirm_password': bool(attrs.get('confirm_password'))})
        # #endregion
        if not attrs.get('email') and not attrs.get('phone'):
            # #region agent log
            logger.warning(f'registration_validate_no_email_or_phone')
            # #endregion
            raise serializers.ValidationError("Either email or phone is required")
        
        if attrs['password'] != attrs['confirm_password']:
            # #region agent log
            logger.warning(f'registration_validate_passwords_mismatch')
            # #endregion
            raise serializers.ValidationError("Passwords do not match")
        
        # #region agent log
        logger.info(f'registration_validate_passed')
        # #endregion
        return attrs
    
    def create(self, validated_data):
        """Create user, profile, and send OTP."""
        import logging
        logger = logging.getLogger(__name__)
        # #region agent log
        logger.info(f'registration_serializer_create_started', extra={'has_email': bool(validated_data.get('email')), 'has_phone': bool(validated_data.get('phone')), 'has_full_name': bool(validated_data.get('full_name'))})
        # #endregion
        try:
            # Extract profile fields
            profile_data = {
                'date_of_birth': validated_data.pop('date_of_birth', None),
                'gender': validated_data.pop('gender', None),
                'timezone': validated_data.pop('timezone', 'Asia/Kolkata'),
                'location': validated_data.pop('location', None),
            }
            
            # Extract password and confirm_password
            validated_data.pop('confirm_password')
            password = validated_data.pop('password')
            
            # #region agent log
            logger.info(f'registration_creating_user', extra={'email': validated_data.get('email'), 'has_password': bool(password)})
            # #endregion
            
            # Create user
            user = User.objects.create(**validated_data)
            user.set_password(password)
            user.save()
            
            # #region agent log
            logger.info(f'registration_user_created', extra={'user_id': str(user.id)})
            # #endregion
            
            # Create user profile with provided details
            # The signal will create an empty profile, so we update it with the provided data
            profile, created = UserProfile.objects.get_or_create(user=user)
            # #region agent log
            logger.info(f'registration_profile_handled', extra={'profile_created': created, 'profile_id': str(profile.id)})
            # #endregion
            for key, value in profile_data.items():
                if value is not None:
                    setattr(profile, key, value)
            profile.save()
            
            # Mark profile as completed if date_of_birth is provided
            if profile.date_of_birth:
                profile.profile_completed_at = timezone.now()
                profile.save()
            
            # Generate and send OTP
            from .utils import generate_otp, send_otp_email
            otp_code = generate_otp()
            otp_type = 'email' if user.email else 'phone'
            
            # #region agent log
            logger.info(f'registration_creating_otp', extra={'otp_type': otp_type, 'user_email': user.email})
            # #endregion
            
            OTPCode.objects.create(
                user=user,
                code=otp_code,
                type=otp_type,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            
            if user.email:
                try:
                    # #region agent log
                    email_sent = send_otp_email(user.email, otp_code)
                    logger.info(f'registration_otp_email_sent', extra={'email': user.email, 'success': email_sent})
                    # #endregion
                    # Don't fail registration if email sending fails - user can resend OTP
                    if not email_sent:
                        logger.warning(f'registration_otp_email_failed_but_continuing', extra={'email': user.email, 'user_id': str(user.id)})
                except Exception as email_error:
                    # #region agent log
                    logger.error(f'registration_otp_email_exception', extra={'email': user.email, 'error': str(email_error)}, exc_info=True)
                    # #endregion
                    # Don't fail registration if email sending fails - user can resend OTP
                    logger.warning(f'registration_otp_email_exception_but_continuing', extra={'email': user.email, 'user_id': str(user.id), 'error': str(email_error)})
            else:
                # #region agent log
                logger.warning(f'registration_no_email_for_otp', extra={'user_id': str(user.id)})
                # #endregion
            
            return user
        except Exception as e:
            # #region agent log
            logger.error(f'registration_create_failed', extra={'error': str(e), 'error_type': type(e).__name__}, exc_info=True)
            # #endregion
            raise


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    otp = serializers.CharField(max_length=6)
    
    def validate(self, attrs):
        """Validate OTP."""
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        # Find user
        if attrs.get('email'):
            user = User.objects.filter(email=attrs['email']).first()
        else:
            user = User.objects.filter(phone=attrs['phone']).first()
        
        if not user:
            raise serializers.ValidationError("User not found")
        
        # Find valid OTP
        otp = OTPCode.objects.filter(
            user=user,
            code=attrs['otp'],
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()
        
        if not otp:
            raise serializers.ValidationError("Invalid or expired OTP")
        
        if otp.attempts >= 3:
            raise serializers.ValidationError("Maximum attempts exceeded")
        
        attrs['user'] = user
        attrs['otp_obj'] = otp
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    
    def validate(self, attrs):
        """Validate resend request."""
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        return attrs


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials."""
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        # Find user
        if attrs.get('email'):
            user = User.objects.filter(email=attrs['email']).first()
        else:
            user = User.objects.filter(phone=attrs['phone']).first()
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        # Check if account is locked
        if user.is_account_locked():
            raise serializers.ValidationError("Account is temporarily locked due to multiple failed login attempts")
        
        # Verify password
        if not user.check_password(attrs['password']):
            user.increment_failed_login()
            raise serializers.ValidationError("Invalid credentials")
        
        # Check if verified
        if not user.is_verified:
            raise serializers.ValidationError("Please verify your account first")
        
        # Reset failed attempts
        user.reset_failed_login()
        
        attrs['user'] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout."""
    refresh_token = serializers.CharField()


class RefreshTokenSerializer(serializers.Serializer):
    """Serializer for token refresh."""
    refresh_token = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        """Validate password reset."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        
        return attrs


class PasswordResetTokenRequestSerializer(serializers.Serializer):
    """Serializer for password reset token request."""
    email = serializers.EmailField()


class PasswordResetTokenConfirmSerializer(serializers.Serializer):
    """Serializer for password reset token confirmation."""
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        """Validate password reset with token."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(
        source='user.full_name',
        max_length=100,
        required=False,
        allow_blank=False
    )
    
    class Meta:
        model = UserProfile
        fields = ['email', 'full_name', 'date_of_birth', 'gender', 'timezone', 'location', 'profile_picture_url', 'bio']
        read_only_fields = ['email']
    
    def update(self, instance, validated_data):
        """Update both UserProfile and User model fields."""
        # Extract user-related fields
        user_data = validated_data.pop('user', {})
        
        # Update User model if full_name is provided
        if 'full_name' in user_data:
            user = instance.user
            user.full_name = user_data['full_name']
            user.save(update_fields=['full_name', 'updated_at'])
        
        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for device token registration."""
    
    class Meta:
        model = DeviceToken
        fields = ['fcm_token', 'device_type', 'device_name']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications."""
    
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'is_read', 'data', 'created_at', 'time_since'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_time_since(self, obj):
        """Get human-readable time since notification was created."""
        from django.utils.timesince import timesince
        return timesince(obj.created_at)

