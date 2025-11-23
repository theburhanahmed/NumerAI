"""
Numerology models for NumerAI application.
"""
import uuid
from django.db import models


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