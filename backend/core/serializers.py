"""
Serializers for NumerAI core application.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken, NumerologyProfile, DailyReading
from .utils import generate_otp, send_otp_email


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'phone', 'full_name', 'password', 'confirm_password']
    
    def validate(self, data):
        """Validate registration data."""
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        
        return data
    
    def create(self, validated_data):
        """Create user and send OTP."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Generate and send OTP
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
    
    def validate(self, data):
        """Validate OTP."""
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        # Find user
        if data.get('email'):
            user = User.objects.filter(email=data['email']).first()
        else:
            user = User.objects.filter(phone=data['phone']).first()
        
        if not user:
            raise serializers.ValidationError("User not found")
        
        # Find valid OTP
        otp = OTPCode.objects.filter(
            user=user,
            code=data['otp'],
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()
        
        if not otp:
            raise serializers.ValidationError("Invalid or expired OTP")
        
        if otp.attempts >= 3:
            raise serializers.ValidationError("Maximum attempts exceeded")
        
        data['user'] = user
        data['otp_obj'] = otp
        return data


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    
    def validate(self, data):
        """Validate resend request."""
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        return data


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate login credentials."""
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        
        # Find user
        if data.get('email'):
            user = User.objects.filter(email=data['email']).first()
        else:
            user = User.objects.filter(phone=data['phone']).first()
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        # Check if account is locked
        if user.is_account_locked():
            raise serializers.ValidationError("Account is temporarily locked due to multiple failed login attempts")
        
        # Verify password
        if not user.check_password(data['password']):
            user.increment_failed_login()
            raise serializers.ValidationError("Invalid credentials")
        
        # Check if verified
        if not user.is_verified:
            raise serializers.ValidationError("Please verify your account first")
        
        # Reset failed attempts
        user.reset_failed_login()
        
        data['user'] = user
        return data


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
    
    def validate(self, data):
        """Validate password reset."""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    full_name = serializers.CharField(source='user.full_name')
    subscription_plan = serializers.CharField(source='user.subscription_plan', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['email', 'phone', 'full_name', 'date_of_birth', 'gender', 
                  'timezone', 'location', 'profile_picture_url', 'bio',
                  'subscription_plan', 'is_verified', 'profile_completed_at']
        read_only_fields = ['profile_completed_at']
    
    def update(self, instance, validated_data):
        """Update user profile."""
        user_data = validated_data.pop('user', {})
        
        # Update user fields
        if 'full_name' in user_data:
            instance.user.full_name = user_data['full_name']
            instance.user.save()
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Check if profile is complete
        if instance.is_complete() and not instance.profile_completed_at:
            instance.profile_completed_at = timezone.now()
        
        instance.save()
        return instance


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for device token registration."""
    
    class Meta:
        model = DeviceToken
        fields = ['fcm_token', 'device_type', 'device_name']


class NumerologyProfileSerializer(serializers.ModelSerializer):
    """Serializer for numerology profile."""
    
    class Meta:
        model = NumerologyProfile
        fields = [
            'id',
            'life_path_number',
            'destiny_number',
            'soul_urge_number',
            'personality_number',
            'attitude_number',
            'maturity_number',
            'balance_number',
            'personal_year_number',
            'personal_month_number',
            'calculation_system',
            'calculated_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'calculated_at', 'updated_at']


class DailyReadingSerializer(serializers.ModelSerializer):
    """Serializer for daily reading."""
    
    class Meta:
        model = DailyReading
        fields = [
            'id',
            'reading_date',
            'personal_day_number',
            'lucky_number',
            'lucky_color',
            'auspicious_time',
            'activity_recommendation',
            'warning',
            'affirmation',
            'actionable_tip',
            'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']


class BirthChartSerializer(serializers.Serializer):
    """Serializer for birth chart with interpretations."""
    profile = NumerologyProfileSerializer()
    interpretations = serializers.DictField()