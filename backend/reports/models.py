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
    content_template = models.TextField(help_text="Template content for generating reports", default="")
    required_data = models.JSONField(default=dict, blank=True, help_text="Required data fields for this template")
    is_custom = models.BooleanField(default=False, help_text="Whether this is a user-created template")
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, related_name='custom_report_templates')
    template_config = models.JSONField(default=dict, blank=True, help_text="Custom section configuration for the template")
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
            models.Index(fields=['is_custom', 'owner']),
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


class ScheduledReport(models.Model):
    """Scheduled report generation."""
    
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='scheduled_reports')
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, related_name='scheduled_reports')
    person = models.ForeignKey('numerology.Person', on_delete=models.CASCADE, related_name='scheduled_reports')
    schedule_frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    next_run_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'scheduled_reports'
        verbose_name = 'Scheduled Report'
        verbose_name_plural = 'Scheduled Reports'
        ordering = ['next_run_date']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['next_run_date', 'is_active']),
        ]
    
    def __str__(self):
        return f"Scheduled {self.template.name} for {self.person.name} - {self.schedule_frequency}"


class ReportComparison(models.Model):
    """Comparison between two reports."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='report_comparisons')
    report1 = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='comparisons_as_report1')
    report2 = models.ForeignKey(GeneratedReport, on_delete=models.CASCADE, related_name='comparisons_as_report2')
    comparison_data = models.JSONField(help_text="Comparison analysis data")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_comparisons'
        verbose_name = 'Report Comparison'
        verbose_name_plural = 'Report Comparisons'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comparison: {self.report1.title} vs {self.report2.title}"