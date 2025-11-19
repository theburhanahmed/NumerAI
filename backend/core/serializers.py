"""
Serializers for NumerAI core application.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, UserProfile, OTPCode, RefreshToken, DeviceToken, NumerologyProfile, DailyReading, AIConversation, AIMessage, CompatibilityCheck, Remedy, RemedyTracking, Expert, Consultation, ConsultationReview, Person, PersonNumerologyProfile, ReportTemplate, GeneratedReport
from .utils import generate_otp, send_otp_email


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


class AIConversationSerializer(serializers.ModelSerializer):
    """Serializer for AI conversation."""
    
    class Meta:
        model = AIConversation
        fields = [
            'id',
            'user',
            'started_at',
            'last_message_at',
            'message_count',
            'is_active'
        ]
        read_only_fields = ['id', 'started_at', 'last_message_at', 'message_count']


class AIMessageSerializer(serializers.ModelSerializer):
    """Serializer for AI message."""
    
    class Meta:
        model = AIMessage
        fields = [
            'id',
            'conversation',
            'role',
            'content',
            'tokens_used',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'tokens_used']


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for chat message request."""
    message = serializers.CharField(max_length=1000)
    
    
class BirthChartSerializer(serializers.Serializer):
    """Serializer for birth chart with interpretations."""
    profile = NumerologyProfileSerializer()
    interpretations = serializers.DictField()


# New serializers for additional features

class CompatibilityCheckSerializer(serializers.ModelSerializer):
    """Serializer for compatibility check."""
    
    class Meta:
        model = CompatibilityCheck
        fields = [
            'id',
            'user',
            'partner_name',
            'partner_birth_date',
            'relationship_type',
            'compatibility_score',
            'strengths',
            'challenges',
            'advice',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class RemedySerializer(serializers.ModelSerializer):
    """Serializer for remedy."""
    
    class Meta:
        model = Remedy
        fields = [
            'id',
            'user',
            'remedy_type',
            'title',
            'description',
            'recommendation',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RemedyTrackingSerializer(serializers.ModelSerializer):
    """Serializer for remedy tracking."""
    
    class Meta:
        model = RemedyTracking
        fields = [
            'id',
            'user',
            'remedy',
            'date',
            'is_completed',
            'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class ExpertSerializer(serializers.ModelSerializer):
    """Serializer for expert."""
    
    class Meta:
        model = Expert
        fields = [
            'id',
            'name',
            'email',
            'specialty',
            'experience_years',
            'rating',
            'bio',
            'profile_picture_url',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'created_at', 'updated_at']


class ConsultationSerializer(serializers.ModelSerializer):
    """Serializer for consultation."""
    
    expert_name = serializers.CharField(source='expert.name', read_only=True)
    expert_specialty = serializers.CharField(source='expert.specialty', read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id',
            'user',
            'expert',
            'expert_name',
            'expert_specialty',
            'consultation_type',
            'scheduled_at',
            'duration_minutes',
            'status',
            'notes',
            'meeting_link',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ConsultationBookingSerializer(serializers.ModelSerializer):
    """Serializer for consultation booking."""
    
    class Meta:
        model = Consultation
        fields = [
            'expert',
            'consultation_type',
            'scheduled_at',
            'duration_minutes',
            'notes'
        ]


class ConsultationReviewSerializer(serializers.ModelSerializer):
    """Serializer for consultation review."""
    
    class Meta:
        model = ConsultationReview
        fields = [
            'id',
            'consultation',
            'rating',
            'review_text',
            'is_anonymous',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LifePathAnalysisSerializer(serializers.Serializer):
    """Serializer for life path analysis."""
    number = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    strengths = serializers.ListField(child=serializers.CharField())
    challenges = serializers.ListField(child=serializers.CharField())
    career = serializers.ListField(child=serializers.CharField())
    relationships = serializers.CharField()
    advice = serializers.CharField()


class PinnacleCycleSerializer(serializers.Serializer):
    """Serializer for pinnacle cycle."""
    number = serializers.IntegerField()
    age = serializers.CharField()
    title = serializers.CharField()


class NumerologyReportSerializer(serializers.Serializer):
    """Serializer for full numerology report."""
    full_name = serializers.CharField()
    birth_date = serializers.DateField()
    life_path_number = serializers.IntegerField()
    life_path_title = serializers.CharField()
    destiny_number = serializers.IntegerField()
    destiny_title = serializers.CharField()
    soul_urge_number = serializers.IntegerField()
    soul_urge_title = serializers.CharField()
    personality_number = serializers.IntegerField()
    personality_title = serializers.CharField()
    birthday_number = serializers.IntegerField()
    birthday_title = serializers.CharField()
    challenge_number = serializers.IntegerField()
    challenge_title = serializers.CharField()
    pinnacle_cycle = PinnacleCycleSerializer(many=True)
    summary = serializers.CharField()


# New serializers for multi-person numerology

class PersonSerializer(serializers.ModelSerializer):
    """Serializer for person model."""
    
    class Meta:
        model = Person
        fields = [
            'id',
            'name',
            'birth_date',
            'relationship',
            'notes',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonNumerologyProfileSerializer(serializers.ModelSerializer):
    """Serializer for person numerology profile."""
    
    class Meta:
        model = PersonNumerologyProfile
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


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report template."""
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id',
            'name',
            'description',
            'report_type',
            'is_premium',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GeneratedReportSerializer(serializers.ModelSerializer):
    """Serializer for generated report."""
    
    class Meta:
        model = GeneratedReport
        fields = [
            'id',
            'user',
            'person',
            'template',
            'title',
            'content',
            'generated_at',
            'expires_at'
        ]
        read_only_fields = ['id', 'user', 'generated_at']