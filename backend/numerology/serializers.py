"""
Serializers for NumerAI numerology application.
"""
from rest_framework import serializers
from .models import NumerologyProfile, DailyReading, CompatibilityCheck, Remedy, RemedyTracking, Person, PersonNumerologyProfile


class NumerologyProfileSerializer(serializers.ModelSerializer):
    """Serializer for numerology profile."""
    
    class Meta:
        model = NumerologyProfile
        fields = [
            'id', 'life_path_number', 'destiny_number', 'soul_urge_number',
            'personality_number', 'attitude_number', 'maturity_number',
            'balance_number', 'personal_year_number', 'personal_month_number',
            'karmic_debt_number', 'hidden_passion_number', 'subconscious_self_number',
            'calculation_system', 'calculated_at', 'updated_at'
        ]
        read_only_fields = ['id', 'calculated_at', 'updated_at']


class DailyReadingSerializer(serializers.ModelSerializer):
    """Serializer for daily reading."""
    
    class Meta:
        model = DailyReading
        fields = [
            'id', 'reading_date', 'personal_day_number', 'lucky_number',
            'lucky_color', 'auspicious_time', 'activity_recommendation',
            'warning', 'affirmation', 'actionable_tip', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']


class BirthChartSerializer(serializers.Serializer):
    """Serializer for birth chart with interpretations."""
    profile = NumerologyProfileSerializer()
    interpretations = serializers.DictField()


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