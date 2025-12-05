"""
Serializers for NumerAI numerology application.
"""
from rest_framework import serializers
from .models import (
    NumerologyProfile, DailyReading, CompatibilityCheck, Remedy, RemedyTracking,
    Person, PersonNumerologyProfile, RajYogDetection, Explanation, NameReport,
    WeeklyReport, YearlyReport, PhoneReport
)


class NumerologyProfileSerializer(serializers.ModelSerializer):
    """Serializer for numerology profile."""
    
    class Meta:
        model = NumerologyProfile
        fields = [
            'id', 'life_path_number', 'destiny_number', 'soul_urge_number',
            'personality_number', 'attitude_number', 'maturity_number',
            'balance_number', 'personal_year_number', 'personal_month_number',
            'karmic_debt_number', 'hidden_passion_number', 'subconscious_self_number',
            'lo_shu_grid', 'calculation_system', 'calculated_at', 'updated_at'
        ]
        read_only_fields = ['id', 'calculated_at', 'updated_at']


class DailyReadingSerializer(serializers.ModelSerializer):
    """Serializer for daily reading."""
    
    class Meta:
        model = DailyReading
        fields = [
            'id', 'reading_date', 'personal_day_number', 'lucky_number',
            'lucky_color', 'auspicious_time', 'activity_recommendation',
            'warning', 'affirmation', 'actionable_tip', 'raj_yog_status',
            'raj_yog_insight', 'llm_explanation', 'explanation_id', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']


class RajYogDetectionSerializer(serializers.ModelSerializer):
    """Serializer for Raj Yog detection."""
    
    class Meta:
        model = RajYogDetection
        fields = [
            'id', 'is_detected', 'yog_type', 'yog_name', 'strength_score',
            'contributing_numbers', 'detected_combinations', 'calculation_system',
            'detected_at', 'updated_at'
        ]
        read_only_fields = ['id', 'detected_at', 'updated_at']


class ExplanationSerializer(serializers.ModelSerializer):
    """Serializer for explanation."""
    
    class Meta:
        model = Explanation
        fields = [
            'id', 'explanation_type', 'title', 'content', 'llm_provider',
            'llm_model', 'tokens_used', 'cost', 'context_data', 'is_cached',
            'generated_at', 'expires_at'
        ]
        read_only_fields = ['id', 'generated_at']


class WeeklyReportSerializer(serializers.ModelSerializer):
    """Serializer for weekly report."""
    
    class Meta:
        model = WeeklyReport
        fields = [
            'id', 'week_start_date', 'week_end_date', 'week_number', 'year',
            'weekly_number', 'personal_year_number', 'personal_month_number',
            'main_theme', 'weekly_summary', 'daily_insights', 'weekly_trends',
            'recommendations', 'challenges', 'opportunities', 'raj_yog_status',
            'raj_yog_insights', 'llm_summary', 'explanation_id', 'generated_at', 'updated_at'
        ]
        read_only_fields = ['id', 'generated_at', 'updated_at']


class YearlyReportSerializer(serializers.ModelSerializer):
    """Serializer for yearly report."""
    
    class Meta:
        model = YearlyReport
        fields = [
            'id', 'year', 'personal_year_number', 'personal_year_cycle',
            'annual_overview', 'major_themes', 'month_by_month', 'key_dates',
            'opportunities', 'challenges', 'recommendations', 'annual_raj_yog_status',
            'raj_yog_patterns', 'raj_yog_insights', 'llm_overview', 'explanation_id',
            'generated_at', 'updated_at'
        ]
        read_only_fields = ['id', 'generated_at', 'updated_at']


class BirthChartSerializer(serializers.Serializer):
    """Serializer for birth chart with interpretations."""
    profile = NumerologyProfileSerializer()
    interpretations = serializers.DictField()
    lo_shu_grid = serializers.DictField(required=False, allow_null=True)


class LifePathAnalysisSerializer(serializers.Serializer):
    """Serializer for life path analysis."""
    life_path_number = serializers.IntegerField()
    interpretation = serializers.DictField()
    pinnacle_cycles = serializers.ListField()


class PinnacleCycleSerializer(serializers.Serializer):
    """Serializer for pinnacle cycle."""
    cycle_number = serializers.IntegerField()
    start_age = serializers.IntegerField()
    end_age = serializers.IntegerField()
    description = serializers.CharField()


class CompatibilityCheckSerializer(serializers.ModelSerializer):
    """Serializer for compatibility check."""
    
    class Meta:
        model = CompatibilityCheck
        fields = [
            'id', 'partner_name', 'partner_birth_date', 'relationship_type',
            'compatibility_score', 'strengths', 'challenges', 'advice', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RemedySerializer(serializers.ModelSerializer):
    """Serializer for remedy."""
    
    class Meta:
        model = Remedy
        fields = [
            'id', 'remedy_type', 'title', 'description',
            'recommendation', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RemedyTrackingSerializer(serializers.ModelSerializer):
    """Serializer for remedy tracking."""
    
    class Meta:
        model = RemedyTracking
        fields = ['id', 'remedy', 'date', 'is_completed', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for person."""
    
    class Meta:
        model = Person
        fields = [
            'id', 'name', 'birth_date', 'relationship',
            'notes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonNumerologyProfileSerializer(serializers.ModelSerializer):
    """Serializer for person numerology profile."""
    
    class Meta:
        model = PersonNumerologyProfile
        fields = [
            'id', 'life_path_number', 'destiny_number', 'soul_urge_number',
            'personality_number', 'attitude_number', 'maturity_number',
            'balance_number', 'personal_year_number', 'personal_month_number',
            'calculation_system', 'calculated_at', 'updated_at'
        ]
        read_only_fields = ['id', 'calculated_at', 'updated_at']


class NumerologyReportSerializer(serializers.Serializer):
    """Serializer for comprehensive numerology report."""
    user_profile = serializers.DictField()
    numerology_profile = NumerologyProfileSerializer()
    interpretations = serializers.DictField()
    compatibility_data = serializers.ListField()
    remedy_tracking_data = serializers.ListField()


class RectificationSuggestionSerializer(serializers.Serializer):
    """Serializer for rectification suggestion."""
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    recommendation = serializers.CharField()
    priority = serializers.CharField()
    reason = serializers.CharField()


class NameReportSerializer(serializers.ModelSerializer):
    """Serializer for name numerology report."""
    
    class Meta:
        model = NameReport
        fields = [
            'id', 'user', 'name', 'name_type', 'system',
            'normalized_name', 'numbers', 'breakdown',
            'explanation', 'explanation_error', 'computed_at', 'version'
        ]
        read_only_fields = ['id', 'computed_at', 'version']


class PhoneReportSerializer(serializers.ModelSerializer):
    """Serializer for phone numerology report."""
    
    # Mask phone number for display
    phone_e164_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PhoneReport
        fields = [
            'id', 'user', 'phone_raw', 'phone_e164', 'phone_e164_display',
            'country', 'method', 'computed', 'explanation',
            'explanation_error', 'computed_at', 'version'
        ]
        read_only_fields = ['id', 'computed_at', 'version']
    
    def get_phone_e164_display(self, obj):
        """Return masked phone number for display."""
        return PhoneReport.mask_phone(obj.phone_e164)


class FullNumerologyReportSerializer(serializers.Serializer):
    """Serializer for full numerology report combining birth date, name, and phone numerology."""
    # User information
    user_profile = serializers.DictField()
    
    # Subscription information
    subscription_tier = serializers.CharField()
    available_features = serializers.DictField()
    
    # Birth date numerology
    birth_date_numerology = NumerologyProfileSerializer(required=False, allow_null=True)
    birth_date_interpretations = serializers.DictField(required=False, allow_null=True)
    
    # Name numerology
    name_numerology = NameReportSerializer(required=False, allow_null=True)
    name_numerology_available = serializers.BooleanField()
    
    # Phone numerology
    phone_numerology = PhoneReportSerializer(required=False, allow_null=True)
    phone_numerology_available = serializers.BooleanField()
    
    # Lo Shu Grid
    lo_shu_grid = serializers.DictField(required=False, allow_null=True)
    lo_shu_grid_available = serializers.BooleanField()
    
    # Rectification suggestions
    rectification_suggestions = RectificationSuggestionSerializer(many=True, required=False)
    rectification_suggestions_available = serializers.BooleanField()
    
    # Additional features
    detailed_analysis = serializers.DictField(required=False, allow_null=True)
    detailed_analysis_available = serializers.BooleanField()
    
    compatibility_insights = serializers.ListField(required=False, allow_null=True)
    compatibility_insights_available = serializers.BooleanField()
    
    # Elite features
    raj_yog_analysis = serializers.DictField(required=False, allow_null=True)
    raj_yog_analysis_available = serializers.BooleanField()
    
    yearly_forecast = serializers.DictField(required=False, allow_null=True)
    yearly_forecast_available = serializers.BooleanField()
    
    expert_recommendations = serializers.ListField(required=False, allow_null=True)
    expert_recommendations_available = serializers.BooleanField()
    
    # Pinnacle cycles and challenges/opportunities
    pinnacle_cycles = serializers.ListField(required=False, allow_null=True)
    pinnacle_cycles_available = serializers.BooleanField()
    challenges_opportunities = serializers.DictField(required=False, allow_null=True)
    challenges_opportunities_available = serializers.BooleanField()


class NameNumerologyGenerateSerializer(serializers.Serializer):
    """Serializer for name numerology generation request."""
    name = serializers.CharField(required=True, max_length=200)
    name_type = serializers.ChoiceField(
        choices=['birth', 'current', 'nickname'],
        default='birth'
    )
    system = serializers.ChoiceField(
        choices=['pythagorean', 'chaldean'],
        default='pythagorean'
    )
    transliterate = serializers.BooleanField(default=True)
    force_refresh = serializers.BooleanField(default=False)


class PhoneNumerologyGenerateSerializer(serializers.Serializer):
    """Serializer for phone numerology generation request."""
    phone_number = serializers.CharField(required=True, max_length=50)
    country_hint = serializers.CharField(required=False, max_length=10, allow_blank=True)
    method = serializers.ChoiceField(
        choices=['core', 'full', 'compatibility'],
        default='core'
    )
    persist = serializers.BooleanField(default=True)
    force_refresh = serializers.BooleanField(default=False)
    convert_vanity = serializers.BooleanField(default=False)