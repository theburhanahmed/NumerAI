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
    
    # Enhanced reports endpoints
    path('reports/custom/', views.generate_custom_report, name='generate-custom-report'),
    path('reports/templates/', views.create_report_template, name='create-report-template'),
    path('reports/templates/my/', views.get_my_report_templates, name='get-my-report-templates'),
    path('reports/schedule/', views.schedule_report, name='schedule-report'),
    path('reports/scheduled/', views.get_scheduled_reports, name='get-scheduled-reports'),
    path('reports/scheduled/<uuid:scheduled_id>/', views.cancel_scheduled_report, name='cancel-scheduled-report'),
    path('reports/compare/', views.compare_reports, name='compare-reports'),
    path('reports/<uuid:report_id>/export/<str:format_type>/', views.export_report_format, name='export-report-format'),
]