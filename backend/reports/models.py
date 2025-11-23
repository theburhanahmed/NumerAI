"""
Report models for NumerAI application.
"""
import uuid
from django.db import models


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
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='generated_reports')
    person = models.ForeignKey('numerology.Person', on_delete=models.CASCADE, related_name='reports')
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