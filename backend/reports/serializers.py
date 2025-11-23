"""
Serializers for NumerAI reports application.
"""
from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport
from numerology.models import Person


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report template."""
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'report_type',
            'is_premium', 'is_active', 'created_at', 'updated_at'
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