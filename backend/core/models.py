"""
Core models for NumerAI application.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager for email/phone authentication."""
    
    def create_user(self, email=None, phone=None, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email and not phone:
            raise ValueError('User must have either email or phone number')
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model supporting email and phone authentication."""
    
    SUBSCRIPTION_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
        ('elite', 'Elite'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True, db_index=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone = models.CharField(validators=[phone_regex], max_length=20, unique=True, null=True, blank=True, db_index=True)
    full_name = models.CharField(max_length=100)
    
    # Status flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    
    # Premium subscription
    premium_expiry = models.DateTimeField(null=True, blank=True)
    subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_CHOICES, default='free')
    
    # Security
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(email__isnull=False) | models.Q(phone__isnull=False),
                name='email_or_phone_required'
            )
        ]
    
    def __str__(self):
        return self.email or self.phone or str(self.id)
    
    def is_account_locked(self):
        """Check if account is currently locked."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False
    
    def increment_failed_login(self):
        """Increment failed login attempts and lock account if necessary."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=15)
        self.save(update_fields=['failed_login_attempts', 'locked_until'])
    
    def reset_failed_login(self):
        """Reset failed login attempts."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['failed_login_attempts', 'locked_until'])


class UserProfile(models.Model):
    """Extended user profile information."""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    location = models.CharField(max_length=255, null=True, blank=True)
    profile_picture_url = models.URLField(max_length=500, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    
    # Profile completion
    profile_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user}"
    
    def is_complete(self):
        """Check if profile is complete."""
        return bool(self.date_of_birth and self.user.full_name)


class NumerologyProfile(models.Model):
    """Calculated numerology profile for a user."""
    
    SYSTEM_CHOICES = [
        ('pythagorean', 'Pythagorean'),
        ('chaldean', 'Chaldean'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='numerology_profile')
    
    # Core numbers
    life_path_number = models.IntegerField()
    destiny_number = models.IntegerField()
    soul_urge_number = models.IntegerField()
    personality_number = models.IntegerField()
    attitude_number = models.IntegerField()
    maturity_number = models.IntegerField()
    balance_number = models.IntegerField()
    personal_year_number = models.IntegerField()
    personal_month_number = models.IntegerField()
    
    # Enhanced numbers for better remedies
    karmic_debt_number = models.IntegerField(null=True, blank=True)
    hidden_passion_number = models.IntegerField(null=True, blank=True)
    subconscious_self_number = models.IntegerField(null=True, blank=True)
    
    # Calculation metadata
    calculation_system = models.CharField(max_length=20, choices=SYSTEM_CHOICES, default='pythagorean')
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'numerology_profiles'
        verbose_name = 'Numerology Profile'
        verbose_name_plural = 'Numerology Profiles'
    
    def __str__(self):
        return f"Numerology Profile of {self.user}"


class DailyReading(models.Model):
    """Daily numerology reading for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_readings')
    
    # Reading date
    reading_date = models.DateField(db_index=True)
    
    # Daily numbers
    personal_day_number = models.IntegerField()
    lucky_number = models.IntegerField()
    
    # Reading content
    lucky_color = models.CharField(max_length=50)
    auspicious_time = models.CharField(max_length=50)
    activity_recommendation = models.TextField()
    warning = models.TextField()
    affirmation = models.TextField()
    actionable_tip = models.TextField()
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'daily_readings'
        verbose_name = 'Daily Reading'
        verbose_name_plural = 'Daily Readings'
        ordering = ['-reading_date']
        unique_together = ['user', 'reading_date']
        indexes = [
            models.Index(fields=['user', 'reading_date']),
            models.Index(fields=['reading_date']),
        ]
    
    def __str__(self):
        return f"Daily Reading for {self.user} on {self.reading_date}"


class AIConversation(models.Model):
    """AI conversation between user and AI numerologist."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    message_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'ai_conversations'
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"AI Conversation with {self.user} started at {self.started_at}"


class AIMessage(models.Model):
    """Individual message in an AI conversation."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_messages'
        verbose_name = 'AI Message'
        verbose_name_plural = 'AI Messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role.title()} message in {self.conversation}"


class OTPCode(models.Model):
    """OTP codes for email/phone verification."""
    
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_codes')
    code = models.CharField(max_length=6)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otp_codes'
        verbose_name = 'OTP Code'
        verbose_name_plural = 'OTP Codes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'expires_at']),
        ]
    
    def __str__(self):
        return f"OTP for {self.user} - {self.type}"
    
    def is_valid(self):
        """Check if OTP is still valid."""
        return not self.is_used and self.expires_at > timezone.now() and self.attempts < 3
    
    def increment_attempts(self):
        """Increment verification attempts."""
        self.attempts += 1
        self.save(update_fields=['attempts'])


class RefreshToken(models.Model):
    """Refresh tokens for JWT authentication."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=500, unique=True, db_index=True)
    is_blacklisted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'refresh_tokens'
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'expires_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Refresh token for {self.user}"
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_blacklisted and self.expires_at > timezone.now()


class DeviceToken(models.Model):
    """FCM device tokens for push notifications."""
    
    DEVICE_TYPE_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_tokens')
    fcm_token = models.CharField(max_length=500, unique=True, db_index=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)
    device_name = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'device_tokens'
        verbose_name = 'Device Token'
        verbose_name_plural = 'Device Tokens'
        ordering = ['-registered_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.device_type} device for {self.user}"


# New models for additional features

class CompatibilityCheck(models.Model):
    """Compatibility check between user and another person."""
    
    RELATIONSHIP_TYPES = [
        ('romantic', 'Romantic'),
        ('business', 'Business'),
        ('friendship', 'Friendship'),
        ('family', 'Family'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compatibility_checks')
    partner_name = models.CharField(max_length=100)
    partner_birth_date = models.DateField()
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_TYPES)
    compatibility_score = models.IntegerField()  # Percentage score
    strengths = models.JSONField(default=list)  # List of strengths
    challenges = models.JSONField(default=list)  # List of challenges
    advice = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'compatibility_checks'
        verbose_name = 'Compatibility Check'
        verbose_name_plural = 'Compatibility Checks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['relationship_type']),
        ]
    
    def __str__(self):
        return f"Compatibility check for {self.user} with {self.partner_name}"


class Remedy(models.Model):
    """Personalized remedies for users based on numerology."""
    
    REMEDY_TYPES = [
        ('gemstone', 'Gemstone'),
        ('color', 'Color'),
        ('ritual', 'Ritual'),
        ('mantra', 'Mantra'),
        ('dietary', 'Dietary'),
        ('exercise', 'Exercise'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='remedies')
    remedy_type = models.CharField(max_length=20, choices=REMEDY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    recommendation = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'remedies'
        verbose_name = 'Remedy'
        verbose_name_plural = 'Remedies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'remedy_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} remedy for {self.user}"


class RemedyTracking(models.Model):
    """Tracking of remedy practice by users."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='remedy_trackings')
    remedy = models.ForeignKey(Remedy, on_delete=models.CASCADE, related_name='trackings')
    date = models.DateField()
    is_completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'remedy_trackings'
        verbose_name = 'Remedy Tracking'
        verbose_name_plural = 'Remedy Trackings'
        ordering = ['-date']
        unique_together = ['user', 'remedy', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['remedy', 'date']),
        ]
    
    def __str__(self):
        return f"Tracking for {self.remedy} on {self.date}"


class Expert(models.Model):
    """Numerology experts for consultations."""
    
    EXPERT_SPECIALTIES = [
        ('relationship', 'Relationship & Compatibility'),
        ('career', 'Career & Business'),
        ('spiritual', 'Spiritual Growth'),
        ('health', 'Health & Wellness'),
        ('general', 'General Numerology'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    specialty = models.CharField(max_length=20, choices=EXPERT_SPECIALTIES)
    experience_years = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    bio = models.TextField()
    profile_picture_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'experts'
        verbose_name = 'Expert'
        verbose_name_plural = 'Experts'
        ordering = ['-rating', '-experience_years']
        indexes = [
            models.Index(fields=['specialty', 'is_active']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Expert {self.name} - {self.specialty}"


class Consultation(models.Model):
    """Consultation bookings with experts."""
    
    CONSULTATION_TYPES = [
        ('video', 'Video Call'),
        ('chat', 'Chat'),
        ('phone', 'Phone Call'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations')
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='consultations')
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPES)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    meeting_link = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'consultations'
        verbose_name = 'Consultation'
        verbose_name_plural = 'Consultations'
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['user', 'scheduled_at']),
            models.Index(fields=['expert', 'scheduled_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Consultation with {self.expert} for {self.user} on {self.scheduled_at}"


class ConsultationReview(models.Model):
    """Reviews for completed consultations."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='review')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    review_text = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'consultation_reviews'
        verbose_name = 'Consultation Review'
        verbose_name_plural = 'Consultation Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['consultation']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"Review for {self.consultation}"


# New models for multi-person numerology reporting

class Person(models.Model):
    """Model to store information about people for numerology reports."""
    
    RELATIONSHIP_CHOICES = [
        ('self', 'Self'),
        ('spouse', 'Spouse'),
        ('child', 'Child'),
        ('parent', 'Parent'),
        ('sibling', 'Sibling'),
        ('friend', 'Friend'),
        ('colleague', 'Colleague'),
        ('partner', 'Business Partner'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='people')
    name = models.CharField(max_length=100)
    birth_date = models.DateField()
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='other')
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'people'
        verbose_name = 'Person'
        verbose_name_plural = 'People'
        ordering = ['name']
        unique_together = ['user', 'name', 'birth_date']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['relationship']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.birth_date}) for {self.user}"


class PersonNumerologyProfile(models.Model):
    """Calculated numerology profile for a specific person."""
    
    SYSTEM_CHOICES = [
        ('pythagorean', 'Pythagorean'),
        ('chaldean', 'Chaldean'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    person = models.OneToOneField(Person, on_delete=models.CASCADE, related_name='numerology_profile')
    
    # Core numbers
    life_path_number = models.IntegerField()
    destiny_number = models.IntegerField()
    soul_urge_number = models.IntegerField()
    personality_number = models.IntegerField()
    attitude_number = models.IntegerField()
    maturity_number = models.IntegerField()
    balance_number = models.IntegerField()
    personal_year_number = models.IntegerField()
    personal_month_number = models.IntegerField()
    
    # Calculation metadata
    calculation_system = models.CharField(max_length=20, choices=SYSTEM_CHOICES, default='pythagorean')
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'person_numerology_profiles'
        verbose_name = 'Person Numerology Profile'
        verbose_name_plural = 'Person Numerology Profiles'
    
    def __str__(self):
        return f"Numerology Profile for {self.person.name}"


class ReportTemplate(models.Model):
    """Template for different types of numerology reports."""
    
    REPORT_TYPES = [
        ('basic', 'Basic Birth Chart'),
        ('detailed', 'Detailed Analysis'),
        ('compatibility', 'Compatibility Report'),
        ('career', 'Career Guidance'),
        ('relationship', 'Relationship Analysis'),
        ('health', 'Health Insights'),
        ('finance', 'Financial Forecast'),
        ('yearly', 'Yearly Forecast'),
        ('monthly', 'Monthly Guidance'),
        ('daily', 'Daily Reading'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    is_premium = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_templates'
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
        ordering = ['name']
        indexes = [
            models.Index(fields=['report_type', 'is_active']),
            models.Index(fields=['is_premium']),
        ]
    
    def __str__(self):
        return self.name


class GeneratedReport(models.Model):
    """Store generated reports for later access."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='reports')
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    content = models.JSONField()  # Store report content as JSON
    generated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'generated_reports'
        verbose_name = 'Generated Report'
        verbose_name_plural = 'Generated Reports'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['user', 'generated_at']),
            models.Index(fields=['person', 'template']),
        ]
    
    def __str__(self):
        return f"Report for {self.person.name} - {self.template.name}"


class PasswordResetToken(models.Model):
    """Password reset tokens for email-based password reset."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'expires_at']),
            models.Index(fields=['token']),
        ]
    
    def __str__(self):
        return f"Password reset token for {self.user}"
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_used and self.expires_at > timezone.now()
