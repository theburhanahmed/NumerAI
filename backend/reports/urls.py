"""
URL routing for reports application.
"""
from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Report endpoints
    path('report-templates/', views.report_templates_list, name='report-templates-list'),
    path('reports/generate/', views.generate_report, name='generate-report'),
    path('reports/bulk-generate/', views.bulk_generate_reports, name='bulk-generate-reports'),
    path('reports/', views.get_generated_reports, name='get-generated-reports'),
    path('reports/<uuid:report_id>/', views.get_generated_report, name='get-generated-report'),
    path('reports/<uuid:report_id>/pdf/', views.export_generated_report_pdf, name='export-generated-report-pdf'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]