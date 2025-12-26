"""
Serializers for NumerAI reports application.
"""
from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport, ScheduledReport, ReportComparison
from numerology.models import Person


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report template."""
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type',
            'is_premium', 'is_active', 'content_template', 'required_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GeneratedReportSerializer(serializers.ModelSerializer):
    """Serializer for generated report."""
    person_name = serializers.CharField(source='person.name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'person', 'person_name', 'template', 'template_name',
            'title', 'content', 'generated_at', 'expires_at'
        ]
        read_only_fields = ['id', 'generated_at']


class NumerologyReportSerializer(serializers.Serializer):
    """Serializer for numerology report content."""
    summary = serializers.CharField()
    sections = serializers.DictField()
    numbers = serializers.DictField()
    interpretations = serializers.DictField()


class ScheduledReportSerializer(serializers.ModelSerializer):
    """Serializer for scheduled report."""
    template_name = serializers.CharField(source='template.name', read_only=True)
    person_name = serializers.CharField(source='person.name', read_only=True)
    
    class Meta:
        model = ScheduledReport
        fields = [
            'id', 'template', 'template_name', 'person', 'person_name',
            'schedule_frequency', 'next_run_date', 'is_active', 'last_run_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportComparisonSerializer(serializers.ModelSerializer):
    """Serializer for report comparison."""
    report1_title = serializers.CharField(source='report1.title', read_only=True)
    report2_title = serializers.CharField(source='report2.title', read_only=True)
    
    class Meta:
        model = ReportComparison
        fields = [
            'id', 'report1', 'report1_title', 'report2', 'report2_title',
            'comparison_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']