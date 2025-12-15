"""
MEUS (Multi-Entity Universe System) models.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from numerology.models import NumerologyProfile


class EntityProfile(models.Model):
    """Entity profile for people, assets, and events."""
    
    ENTITY_TYPE_CHOICES = [
        ('person', 'Person'),
        ('asset', 'Asset'),
        ('event', 'Event'),
    ]
    
    RELATIONSHIP_TYPE_CHOICES = [
        ('family', 'Family'),
        ('friend', 'Friend'),
        ('partner', 'Romantic Partner'),
        ('colleague', 'Colleague'),
        ('business_partner', 'Business Partner'),
        ('child', 'Child'),
        ('client', 'Client'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entities')
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES, db_index=True)
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True, blank=True, help_text="Required for person, optional for event")
    relationship_type = models.CharField(max_length=50, choices=RELATIONSHIP_TYPE_CHOICES, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="Flexible storage for entity-specific data")
    numerology_profile = models.ForeignKey(
        NumerologyProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entity_profiles'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'entity_profiles'
        verbose_name = 'Entity Profile'
        verbose_name_plural = 'Entity Profiles'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['entity_type']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(entity_type='person', date_of_birth__isnull=False) |
                    models.Q(entity_type__in=['asset', 'event'], date_of_birth__isnull=True) |
                    models.Q(entity_type__in=['asset', 'event'], date_of_birth__isnull=False)
                ),
                name='valid_person_dob'
            )
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_entity_type_display()})"


class EntityRelationship(models.Model):
    """Relationship between two entities with compatibility analysis."""
    
    RELATIONSHIP_TYPE_CHOICES = [
        ('compatible', 'Compatible'),
        ('challenging', 'Challenging'),
        ('neutral', 'Neutral'),
        ('conflict', 'Conflict'),
        ('harmony', 'Harmony'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_1 = models.ForeignKey(
        EntityProfile,
        on_delete=models.CASCADE,
        related_name='relationships_as_entity_1'
    )
    entity_2 = models.ForeignKey(
        EntityProfile,
        on_delete=models.CASCADE,
        related_name='relationships_as_entity_2'
    )
    relationship_type = models.CharField(max_length=50, choices=RELATIONSHIP_TYPE_CHOICES, null=True, blank=True)
    compatibility_score = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Compatibility score 0-100"
    )
    influence_score = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-100), MaxValueValidator(100)],
        help_text="Influence score -100 to 100"
    )
    analysis_data = models.JSONField(default=dict, blank=True, help_text="Detailed compatibility analysis")
    calculated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="For cache invalidation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'entity_relationships'
        verbose_name = 'Entity Relationship'
        verbose_name_plural = 'Entity Relationships'
        unique_together = [['entity_1', 'entity_2']]
        indexes = [
            models.Index(fields=['entity_1']),
            models.Index(fields=['entity_2']),
            models.Index(fields=['compatibility_score']),
        ]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(entity_1=models.F('entity_2')),
                name='different_entities'
            )
        ]
    
    def __str__(self):
        return f"{self.entity_1.name} ↔ {self.entity_2.name} ({self.compatibility_score or 'N/A'})"


class EntityInfluence(models.Model):
    """Entity's influence on the user."""
    
    IMPACT_TYPE_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
        ('neutral', 'Neutral'),
    ]
    
    CYCLE_PERIOD_CHOICES = [
        ('year', 'Year'),
        ('month', 'Month'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entity_influences')
    entity = models.ForeignKey(EntityProfile, on_delete=models.CASCADE, related_name='influences')
    influence_strength = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Influence strength 0-100"
    )
    impact_type = models.CharField(max_length=20, choices=IMPACT_TYPE_CHOICES)
    impact_areas = models.JSONField(
        default=dict,
        help_text="Impact areas: health, money, career, relationships, stability"
    )
    cycle_period = models.CharField(max_length=10, choices=CYCLE_PERIOD_CHOICES)
    cycle_value = models.CharField(max_length=20, help_text="'2026' or '2026-04'")
    calculated_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'entity_influences'
        verbose_name = 'Entity Influence'
        verbose_name_plural = 'Entity Influences'
        unique_together = [['user', 'entity', 'cycle_period', 'cycle_value']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['entity']),
            models.Index(fields=['cycle_period', 'cycle_value']),
            models.Index(fields=['impact_type']),
        ]
    
    def __str__(self):
        return f"{self.entity.name} → {self.user.full_name} ({self.impact_type}, {self.influence_strength})"


class UniverseEvent(models.Model):
    """Major events in user's universe."""
    
    EVENT_TYPE_CHOICES = [
        ('wedding', 'Wedding'),
        ('business_launch', 'Business Launch'),
        ('travel', 'Travel'),
        ('purchase', 'Purchase'),
        ('medical', 'Medical Procedure'),
        ('decision', 'Big Decision'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='universe_events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    event_date = models.DateField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    related_entities = models.ManyToManyField(EntityProfile, blank=True, related_name='events')
    numerology_insight = models.JSONField(default=dict, blank=True, help_text="Numerology analysis of the event date")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'universe_events'
        verbose_name = 'Universe Event'
        verbose_name_plural = 'Universe Events'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['event_date']),
            models.Index(fields=['event_type']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.event_date})"


class AssetProfile(models.Model):
    """Asset-specific numerology data."""
    
    ASSET_TYPE_CHOICES = [
        ('vehicle', 'Vehicle'),
        ('property', 'Property'),
        ('business', 'Business'),
        ('phone', 'Phone'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity = models.OneToOneField(
        EntityProfile,
        on_delete=models.CASCADE,
        related_name='asset_profile',
        help_text="Must be an asset type entity"
    )
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    asset_number = models.CharField(max_length=100, help_text="License plate, house number, phone number, etc.")
    numerology_vibration = models.IntegerField(null=True, blank=True, help_text="Calculated vibration number")
    safety_score = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Safety score for vehicles (0-100)"
    )
    compatibility_with_owner = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Compatibility with owner (0-100)"
    )
    additional_data = models.JSONField(default=dict, blank=True, help_text="Asset-specific data")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'asset_profiles'
        verbose_name = 'Asset Profile'
        verbose_name_plural = 'Asset Profiles'
        indexes = [
            models.Index(fields=['entity']),
            models.Index(fields=['asset_type']),
        ]
    
    def __str__(self):
        return f"{self.asset_type} - {self.asset_number}"


class CrossProfileAnalysisCache(models.Model):
    """Cache for cross-profile analysis results."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_cache')
    entity_combination_hash = models.CharField(max_length=64, db_index=True, help_text="SHA-256 hash of sorted entity IDs")
    analysis_result = models.JSONField(help_text="Cached analysis result")
    calculated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="Cache expiration time")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cross_profile_analysis_cache'
        verbose_name = 'Cross Profile Analysis Cache'
        verbose_name_plural = 'Cross Profile Analysis Cache'
        unique_together = [['user', 'entity_combination_hash']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['entity_combination_hash']),
        ]
    
    def __str__(self):
        return f"Cache for {self.user.full_name} - {self.entity_combination_hash[:8]}..."
