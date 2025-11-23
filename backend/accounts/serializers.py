"""
Serializers for NumerAI accounts application.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'phone', 'full_name', 'password', 'confirm_password']
    
    def validate(self, attrs):
        """Validate registration data."""
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        
        return attrs
    
    def create(self, validated_data):
        """Create user and send OTP."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Generate and send OTP
        from .utils import generate_otp, send_otp_email
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
        
        return user


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
    
    class Meta:
        model = UserProfile
        fields = ['email', 'date_of_birth', 'gender', 'timezone', 'location', 'profile_picture_url', 'bio']
        read_only_fields = ['email']


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for device token registration."""
    
    class Meta:
        model = DeviceToken
        fields = ['fcm_token', 'device_type', 'device_name']