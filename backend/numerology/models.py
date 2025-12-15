"""
Numerology models for NumerAI application.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class NumerologyProfile(models.Model):
    """Calculated numerology profile for a user."""
    
    SYSTEM_CHOICES = [
        ('pythagorean', 'Pythagorean'),
        ('chaldean', 'Chaldean'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='numerology_profile')
    
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
    
    # Lo Shu Grid data
    lo_shu_grid = models.JSONField(null=True, blank=True)  # Stores grid calculation results
    
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
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='daily_readings')
    
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
    
    # Enhanced fields for Raj Yog and explanations
    raj_yog_status = models.CharField(max_length=50, null=True, blank=True, help_text="Raj Yog status for this day")
    raj_yog_insight = models.TextField(null=True, blank=True, help_text="Raj Yog insight for this day")
    llm_explanation = models.TextField(null=True, blank=True, help_text="LLM-generated personalized explanation")
    explanation_id = models.ForeignKey('Explanation', on_delete=models.SET_NULL, null=True, blank=True, related_name='daily_readings')
    
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


class CompatibilityCheck(models.Model):
    """Compatibility check between user and another person."""
    
    RELATIONSHIP_TYPES = [
        ('romantic', 'Romantic'),
        ('business', 'Business'),
        ('friendship', 'Friendship'),
        ('family', 'Family'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='compatibility_checks')
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
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='remedies')
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
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='remedy_trackings')
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
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='people')
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


class RajYogDetection(models.Model):
    """Raj Yog detection results for a numerology profile."""
    
    YOG_TYPES = [
        ('leadership', 'Leadership Raj Yog'),
        ('spiritual', 'Spiritual Raj Yog'),
        ('material', 'Material Raj Yog'),
        ('creative', 'Creative Raj Yog'),
        ('service', 'Service Raj Yog'),
        ('master', 'Master Number Raj Yog'),
        ('other', 'Other Raj Yog'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='raj_yog_detections')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='raj_yog_detections', null=True, blank=True)
    
    # Detection results
    is_detected = models.BooleanField(default=False)
    yog_type = models.CharField(max_length=20, choices=YOG_TYPES, null=True, blank=True)
    yog_name = models.CharField(max_length=200, null=True, blank=True)
    strength_score = models.IntegerField(default=0, help_text="Raj Yog strength score (0-100)")
    
    # Contributing numbers
    contributing_numbers = models.JSONField(default=dict, help_text="Numbers that contributed to Raj Yog detection")
    detected_combinations = models.JSONField(default=list, help_text="List of detected number combinations")
    
    # Metadata
    calculation_system = models.CharField(max_length=20, choices=NumerologyProfile.SYSTEM_CHOICES, default='pythagorean')
    detected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'raj_yog_detections'
        verbose_name = 'Raj Yog Detection'
        verbose_name_plural = 'Raj Yog Detections'
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['user', 'is_detected']),
            models.Index(fields=['person', 'is_detected']),
            models.Index(fields=['yog_type']),
            models.Index(fields=['strength_score']),
        ]
    
    def __str__(self):
        if self.is_detected:
            return f"Raj Yog detected for {self.user} - {self.yog_name}"
        return f"No Raj Yog detected for {self.user}"


class Explanation(models.Model):
    """LLM-generated explanations for numerology insights."""
    
    EXPLANATION_TYPES = [
        ('raj_yog', 'Raj Yog Explanation'),
        ('daily', 'Daily Reading Explanation'),
        ('weekly', 'Weekly Report Explanation'),
        ('yearly', 'Yearly Report Explanation'),
        ('number', 'Number Interpretation'),
        ('general', 'General Numerology Insight'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='explanations')
    
    # Explanation content
    explanation_type = models.CharField(max_length=20, choices=EXPLANATION_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # LLM metadata
    llm_provider = models.CharField(max_length=50, null=True, blank=True, help_text="OpenAI, Anthropic, etc.")
    llm_model = models.CharField(max_length=100, null=True, blank=True)
    tokens_used = models.IntegerField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    
    # Context data
    context_data = models.JSONField(default=dict, help_text="Numerology data used to generate explanation")
    
    # Caching
    is_cached = models.BooleanField(default=False)
    cache_key = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    
    # Embeddings (for future RAG)
    embedding = models.JSONField(null=True, blank=True, help_text="Vector embedding for semantic search")
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'explanations'
        verbose_name = 'Explanation'
        verbose_name_plural = 'Explanations'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['user', 'explanation_type']),
            models.Index(fields=['explanation_type', 'generated_at']),
            models.Index(fields=['cache_key']),
            models.Index(fields=['is_cached']),
        ]
    
    def __str__(self):
        return f"{self.explanation_type} explanation for {self.user} - {self.title}"


class WeeklyReport(models.Model):
    """Weekly numerology report for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='weekly_reports')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='weekly_reports', null=True, blank=True)
    
    # Week information
    week_start_date = models.DateField(db_index=True)
    week_end_date = models.DateField()
    week_number = models.IntegerField(help_text="Week number in the year (1-52)")
    year = models.IntegerField()
    
    # Weekly numerology numbers
    weekly_number = models.IntegerField(help_text="Weekly numerology number")
    personal_year_number = models.IntegerField()
    personal_month_number = models.IntegerField()
    
    # Report content
    main_theme = models.CharField(max_length=200)
    weekly_summary = models.TextField()
    daily_insights = models.JSONField(default=list, help_text="Day-by-day insights for the week")
    weekly_trends = models.JSONField(default=dict, help_text="Trends and patterns identified")
    recommendations = models.JSONField(default=list, help_text="Recommendations for the week")
    challenges = models.JSONField(default=list, help_text="Potential challenges")
    opportunities = models.JSONField(default=list, help_text="Opportunities for the week")
    
    # Raj Yog status
    raj_yog_status = models.CharField(max_length=50, null=True, blank=True)
    raj_yog_insights = models.TextField(null=True, blank=True)
    
    # LLM-generated content
    llm_summary = models.TextField(null=True, blank=True)
    explanation_id = models.ForeignKey(Explanation, on_delete=models.SET_NULL, null=True, blank=True, related_name='weekly_reports')
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'weekly_reports'
        verbose_name = 'Weekly Report'
        verbose_name_plural = 'Weekly Reports'
        ordering = ['-week_start_date']
        unique_together = ['user', 'person', 'week_start_date']
        indexes = [
            models.Index(fields=['user', 'week_start_date']),
            models.Index(fields=['person', 'week_start_date']),
            models.Index(fields=['year', 'week_number']),
        ]
    
    def __str__(self):
        person_name = self.person.name if self.person else "User"
        return f"Weekly Report for {person_name} - Week {self.week_number}, {self.year}"


class YearlyReport(models.Model):
    """Yearly numerology report for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='yearly_reports')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='yearly_reports', null=True, blank=True)
    
    # Year information
    year = models.IntegerField(db_index=True)
    
    # Yearly numerology numbers
    personal_year_number = models.IntegerField()
    personal_year_cycle = models.CharField(max_length=50, help_text="Cycle phase: beginning, middle, or end")
    
    # Report content
    annual_overview = models.TextField()
    major_themes = models.JSONField(default=list, help_text="Major themes for the year")
    month_by_month = models.JSONField(default=dict, help_text="Month-by-month overview")
    key_dates = models.JSONField(default=list, help_text="Important dates and periods")
    opportunities = models.JSONField(default=list, help_text="Major opportunities")
    challenges = models.JSONField(default=list, help_text="Challenges and remedies")
    recommendations = models.JSONField(default=list, help_text="Yearly recommendations")
    
    # Raj Yog analysis
    annual_raj_yog_status = models.CharField(max_length=50, null=True, blank=True)
    raj_yog_patterns = models.JSONField(default=list, help_text="Raj Yog patterns throughout the year")
    raj_yog_insights = models.TextField(null=True, blank=True)
    
    # LLM-generated content
    llm_overview = models.TextField(null=True, blank=True)
    explanation_id = models.ForeignKey(Explanation, on_delete=models.SET_NULL, null=True, blank=True, related_name='yearly_reports')
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'yearly_reports'
        verbose_name = 'Yearly Report'
        verbose_name_plural = 'Yearly Reports'
        ordering = ['-year']
        unique_together = ['user', 'person', 'year']
        indexes = [
            models.Index(fields=['user', 'year']),
            models.Index(fields=['person', 'year']),
            models.Index(fields=['year']),
        ]
    
    def __str__(self):
        person_name = self.person.name if self.person else "User"
        return f"Yearly Report for {person_name} - {self.year}"


class NameReport(models.Model):
    """Name numerology report for a user."""
    
    NAME_TYPE_CHOICES = [
        ('birth', 'Birth Name'),
        ('current', 'Current Name'),
        ('nickname', 'Nickname'),
    ]
    
    SYSTEM_CHOICES = [
        ('pythagorean', 'Pythagorean'),
        ('chaldean', 'Chaldean'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='name_reports')
    
    # Input data
    name = models.TextField(help_text="Original name input")
    name_type = models.CharField(max_length=20, choices=NAME_TYPE_CHOICES)
    system = models.CharField(max_length=20, choices=SYSTEM_CHOICES)
    normalized_name = models.TextField(help_text="Normalized name after processing")
    
    # Calculated numbers
    numbers = models.JSONField(help_text="Expression, soul_urge, personality, name_vibration")
    breakdown = models.JSONField(help_text="Per-letter breakdown and word breakdown")
    
    # LLM explanation
    explanation = models.JSONField(null=True, blank=True, help_text="LLM result: short_summary, long_explanation, action_points")
    explanation_error = models.TextField(null=True, blank=True, help_text="Error message if LLM explanation failed")
    
    # Metadata
    computed_at = models.DateTimeField(auto_now_add=True)
    version = models.IntegerField(default=1, help_text="Report version for tracking changes")
    
    class Meta:
        db_table = 'name_reports'
        verbose_name = 'Name Report'
        verbose_name_plural = 'Name Reports'
        ordering = ['-computed_at']
        indexes = [
            models.Index(fields=['user', 'name_type', 'system']),
            models.Index(fields=['user', 'computed_at']),
            models.Index(fields=['name_type', 'system']),
        ]
    
    def __str__(self):
        return f"Name Report for {self.user} - {self.name} ({self.name_type}, {self.system})"


class PhoneReport(models.Model):
    """Phone number numerology report for a user."""
    
    METHOD_CHOICES = [
        ('core', 'Core'),
        ('full', 'Full'),
        ('compatibility', 'Compatibility'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='phone_reports')
    
    # Phone number data (PII - consider encryption)
    phone_raw = models.TextField(help_text="Original user-entered phone number string")
    phone_e164 = models.TextField(help_text="Sanitized E.164 format phone number")
    country = models.CharField(max_length=10, null=True, blank=True, help_text="ISO country code")
    
    # Report configuration
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='core')
    
    # Computed numerology data
    computed = models.JSONField(help_text="Computed numbers, breakdowns, evidence_map")
    
    # LLM explanation
    explanation = models.JSONField(null=True, blank=True, help_text="LLM-generated explanation JSON")
    explanation_error = models.TextField(null=True, blank=True, help_text="Error message if LLM explanation failed")
    
    # Metadata
    computed_at = models.DateTimeField(auto_now_add=True)
    version = models.IntegerField(default=1, help_text="Algorithm version for reproducibility")
    
    class Meta:
        db_table = 'phone_reports'
        verbose_name = 'Phone Report'
        verbose_name_plural = 'Phone Reports'
        ordering = ['-computed_at']
        indexes = [
            models.Index(fields=['user', 'computed_at']),
            models.Index(fields=['user', 'method']),
        ]
    
    def __str__(self):
        # Mask phone number for display
        masked = self.mask_phone(self.phone_e164)
        return f"Phone Report for {self.user} - {masked} ({self.method})"
    
    @staticmethod
    def mask_phone(phone_e164: str) -> str:
        """Mask phone number for display (e.g., +1415****2671)."""
        if not phone_e164 or len(phone_e164) < 8:
            return phone_e164
        
        # Keep first 4 and last 4 digits, mask the middle
        if phone_e164.startswith('+'):
            prefix = phone_e164[:5]  # +1415
            suffix = phone_e164[-4:]  # 2671
            return f"{prefix}****{suffix}"
        else:
            prefix = phone_e164[:4]
            suffix = phone_e164[-4:]
            return f"{prefix}****{suffix}"


class DetailedReading(models.Model):
    """AI-generated detailed numerology readings for specific numbers."""
    
    READING_TYPE_CHOICES = [
        ('life_path', 'Life Path'),
        ('destiny', 'Destiny'),
        ('soul_urge', 'Soul Urge'),
        ('personality', 'Personality'),
        ('attitude', 'Attitude'),
        ('maturity', 'Maturity'),
        ('balance', 'Balance'),
        ('full_profile', 'Full Profile'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='detailed_readings')
    
    # Reading details
    reading_type = models.CharField(max_length=50, choices=READING_TYPE_CHOICES)
    number = models.IntegerField(help_text="The numerology number this reading is for")
    
    # AI-generated content
    detailed_interpretation = models.TextField(help_text="Comprehensive AI-generated interpretation")
    career_insights = models.TextField(null=True, blank=True, help_text="Career-related insights")
    relationship_insights = models.TextField(null=True, blank=True, help_text="Relationship-related insights")
    life_purpose = models.TextField(null=True, blank=True, help_text="Life purpose and mission")
    challenges_and_growth = models.TextField(null=True, blank=True, help_text="Challenges and growth opportunities")
    personalized_advice = models.TextField(null=True, blank=True, help_text="Personalized actionable advice")
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by_ai = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'detailed_readings'
        verbose_name = 'Detailed Reading'
        verbose_name_plural = 'Detailed Readings'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['user', 'reading_type']),
            models.Index(fields=['user', 'number']),
            models.Index(fields=['generated_at']),
        ]
        unique_together = ['user', 'reading_type', 'number']
    
    def __str__(self):
        return f"Detailed {self.get_reading_type_display()} Reading for {self.user} (Number {self.number})"


class HealthNumerologyProfile(models.Model):
    """Health Numerology profile for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='health_numerology_profile')
    
    # Health numbers
    stress_number = models.IntegerField(help_text="Number indicating stress patterns")
    vitality_number = models.IntegerField(help_text="Number indicating vitality and energy")
    health_cycle_number = models.IntegerField(help_text="Current health cycle number")
    
    # Health cycles
    health_cycles = models.JSONField(default=dict, help_text="9-year and 7-year health cycles")
    current_cycle = models.JSONField(default=dict, help_text="Current health cycle details")
    
    # Medical timing
    medical_timing = models.JSONField(default=dict, help_text="Optimal timing for medical procedures")
    health_windows = models.JSONField(default=list, help_text="Yearly health windows")
    
    # Risk periods
    risk_periods = models.JSONField(default=list, help_text="Identified health risk periods")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_numerology_profiles'
        verbose_name = 'Health Numerology Profile'
        verbose_name_plural = 'Health Numerology Profiles'
    
    def __str__(self):
        return f"Health Numerology Profile of {self.user}"


class NameCorrection(models.Model):
    """Name correction analysis and suggestions."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='name_corrections')
    
    # Name information
    original_name = models.CharField(max_length=200)
    name_type = models.CharField(
        max_length=20,
        choices=[('birth', 'Birth'), ('current', 'Current'), ('nickname', 'Nickname')],
        default='current'
    )
    
    # Analysis results
    current_expression = models.IntegerField()
    target_expression = models.IntegerField(null=True, blank=True)
    cultural_context = models.CharField(max_length=50, default='western')
    
    # Suggestions and analysis
    suggestions = models.JSONField(default=list)
    phonetic_analysis = models.JSONField(default=dict)
    cultural_analysis = models.JSONField(default=dict)
    recommendations = models.JSONField(default=list)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'name_corrections'
        verbose_name = 'Name Correction'
        verbose_name_plural = 'Name Corrections'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Name Correction for {self.user}: {self.original_name}"


class SpiritualNumerologyProfile(models.Model):
    """Spiritual Numerology profile for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='spiritual_numerology_profile')
    
    # Spiritual data
    soul_contracts = models.JSONField(default=list)
    karmic_cycles = models.JSONField(default=list)
    rebirth_cycles = models.JSONField(default=list)
    divine_gifts = models.JSONField(default=list)
    spiritual_alignment = models.JSONField(default=dict)
    past_life_connections = models.JSONField(default=dict)
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'spiritual_numerology_profiles'
        verbose_name = 'Spiritual Numerology Profile'
        verbose_name_plural = 'Spiritual Numerology Profiles'
    
    def __str__(self):
        return f"Spiritual Numerology Profile of {self.user}"


class PredictiveCycle(models.Model):
    """Predictive Numerology cycle for a user."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='predictive_cycles')
    
    # Cycle data
    cycle_type = models.CharField(max_length=50, choices=[
        ('nine_year', '9-Year Cycle'),
        ('breakthrough', 'Breakthrough Year'),
        ('crisis', 'Crisis Year'),
        ('opportunity', 'Opportunity Period')
    ])
    year = models.IntegerField()
    cycle_data = models.JSONField(default=dict)
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'predictive_cycles'
        verbose_name = 'Predictive Cycle'
        verbose_name_plural = 'Predictive Cycles'
        ordering = ['year']
        indexes = [
            models.Index(fields=['user', 'year']),
            models.Index(fields=['cycle_type']),
        ]
    
    def __str__(self):
        return f"Predictive Cycle for {self.user} - {self.cycle_type} ({self.year})"


class GenerationalAnalysis(models.Model):
    """Family generational numerology analysis."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='generational_analyses')
    
    # Family unit identification
    family_unit_hash = models.CharField(max_length=64, db_index=True, help_text="Hash of family member IDs for uniqueness")
    
    # Generational number
    generational_number = models.IntegerField(help_text="Calculated generational number for the family unit")
    
    # Analysis data
    analysis_data = models.JSONField(default=dict, help_text="Detailed generational analysis including patterns, cycles, etc.")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'generational_analyses'
        verbose_name = 'Generational Analysis'
        verbose_name_plural = 'Generational Analyses'
        unique_together = [['user', 'family_unit_hash']]
        indexes = [
            models.Index(fields=['user', 'calculated_at']),
            models.Index(fields=['generational_number']),
        ]
    
    def __str__(self):
        return f"Generational Analysis for {self.user} - Number {self.generational_number}"


class KarmicContract(models.Model):
    """Parent-child karmic contract analysis."""
    
    CONTRACT_TYPE_CHOICES = [
        ('teaching', 'Teaching Contract'),
        ('learning', 'Learning Contract'),
        ('healing', 'Healing Contract'),
        ('karmic_debt', 'Karmic Debt Contract'),
        ('soul_evolution', 'Soul Evolution Contract'),
        ('neutral', 'Neutral Relationship'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='karmic_contracts')
    
    # Parent and child relationships
    parent_person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='karmic_contracts_as_parent')
    child_person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='karmic_contracts_as_child')
    
    # Contract analysis
    contract_type = models.CharField(max_length=50, choices=CONTRACT_TYPE_CHOICES, null=True, blank=True)
    karmic_lessons = models.JSONField(default=list, help_text="List of karmic lessons to be learned")
    compatibility_score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Compatibility score 0-100"
    )
    
    # Analysis data
    analysis_data = models.JSONField(default=dict, help_text="Detailed karmic contract analysis")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'karmic_contracts'
        verbose_name = 'Karmic Contract'
        verbose_name_plural = 'Karmic Contracts'
        unique_together = [['user', 'parent_person', 'child_person']]
        indexes = [
            models.Index(fields=['user', 'calculated_at']),
            models.Index(fields=['parent_person', 'child_person']),
            models.Index(fields=['contract_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(parent_person=models.F('child_person')),
                name='different_parent_child'
            )
        ]
    
    def __str__(self):
        return f"Karmic Contract: {self.parent_person.name} → {self.child_person.name} ({self.contract_type or 'Unknown'})"


class FengShuiAnalysis(models.Model):
    """Feng Shui × Numerology hybrid analysis."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='feng_shui_analyses')
    
    # Property information
    property_address = models.CharField(max_length=500, blank=True)
    house_number = models.CharField(max_length=50, help_text="House/flat number")
    
    # Feng Shui data
    feng_shui_data = models.JSONField(default=dict, help_text="Feng Shui analysis data (directions, elements, etc.)")
    
    # Numerology vibration
    numerology_vibration = models.IntegerField(help_text="Calculated numerology vibration number for the property")
    
    # Hybrid analysis
    hybrid_score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Overall compatibility score 0-100"
    )
    
    # Recommendations
    recommendations = models.JSONField(default=list, help_text="Space optimization and improvement recommendations")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'feng_shui_analyses'
        verbose_name = 'Feng Shui Analysis'
        verbose_name_plural = 'Feng Shui Analyses'
        indexes = [
            models.Index(fields=['user', 'calculated_at']),
            models.Index(fields=['numerology_vibration']),
        ]
    
    def __str__(self):
        return f"Feng Shui Analysis for {self.user} - {self.house_number}"


class SpaceOptimization(models.Model):
    """Space optimization recommendations for Feng Shui × Numerology."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(FengShuiAnalysis, on_delete=models.CASCADE, related_name='space_optimizations')
    
    # Room information
    room_name = models.CharField(max_length=200, help_text="Name of the room/space")
    room_number = models.CharField(max_length=50, null=True, blank=True, help_text="Room number if applicable")
    direction = models.CharField(max_length=50, null=True, blank=True, help_text="Direction/orientation of the room")
    
    # Recommendations
    color_recommendations = models.JSONField(default=list, help_text="Recommended colors for this space")
    number_combinations = models.JSONField(default=list, help_text="Favorable number combinations")
    energy_flow_score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Energy flow score 0-100"
    )
    
    # Additional recommendations
    layout_suggestions = models.JSONField(default=list, help_text="Layout and arrangement suggestions")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'space_optimizations'
        verbose_name = 'Space Optimization'
        verbose_name_plural = 'Space Optimizations'
        indexes = [
            models.Index(fields=['analysis', 'room_name']),
        ]
    
    def __str__(self):
        return f"Space Optimization: {self.room_name} for {self.analysis}"


class MentalStateTracking(models.Model):
    """Tracks emotional state over time for Mental State AI analysis."""
    
    EMOTIONAL_STATE_CHOICES = [
        ('very_positive', 'Very Positive'),
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
        ('very_negative', 'Very Negative'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mental_state_trackings')
    
    # Tracking data
    date = models.DateField(db_index=True)
    emotional_state = models.CharField(max_length=20, choices=EMOTIONAL_STATE_CHOICES)
    stress_level = models.IntegerField(
        help_text="Stress level 0-100",
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    mood_score = models.IntegerField(
        help_text="Mood score 0-100",
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Numerology context
    numerology_cycle = models.CharField(max_length=50, null=True, blank=True, help_text="Current numerology cycle (e.g., 'Personal Year 7')")
    
    # Notes
    notes = models.TextField(blank=True, help_text="User notes about their state")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mental_state_trackings'
        verbose_name = 'Mental State Tracking'
        verbose_name_plural = 'Mental State Trackings'
        unique_together = [['user', 'date']]
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['emotional_state']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Mental State Tracking for {self.user} on {self.date}"


class MentalStateAnalysis(models.Model):
    """AI-generated mental state analysis based on numerology."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='mental_state_analyses')
    
    # Analysis period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Analysis results
    stress_patterns = models.JSONField(default=dict, help_text="Identified stress patterns and correlations")
    wellbeing_recommendations = models.JSONField(default=list, help_text="AI-generated wellbeing recommendations")
    mood_predictions = models.JSONField(default=dict, help_text="Predicted mood cycles based on numerology")
    
    # Additional insights
    emotional_compatibility = models.JSONField(default=dict, help_text="Emotional compatibility analysis with others")
    numerology_correlations = models.JSONField(default=dict, help_text="Correlations between numerology cycles and mental state")
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mental_state_analyses'
        verbose_name = 'Mental State Analysis'
        verbose_name_plural = 'Mental State Analyses'
        indexes = [
            models.Index(fields=['user', 'period_start', 'period_end']),
            models.Index(fields=['calculated_at']),
        ]
    
    def __str__(self):
        return f"Mental State Analysis for {self.user} ({self.period_start} to {self.period_end})"