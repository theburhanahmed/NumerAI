"""
URL routing for numerology application.
"""
from django.urls import path
from . import views

app_name = 'numerology'

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health-check'),
    
    # Numerology endpoints
    path('numerology/calculate/', views.calculate_numerology_profile, name='calculate-numerology'),
    path('numerology/profile/', views.get_numerology_profile, name='numerology-profile'),
    path('numerology/birth-chart/', views.get_birth_chart, name='birth-chart'),
    path('numerology/birth-chart/pdf/', views.export_birth_chart_pdf, name='birth-chart-pdf'),
    path('numerology/daily-reading/', views.get_daily_reading, name='daily-reading'),
    path('numerology/reading-history/', views.get_reading_history, name='reading-history'),
    
    # New numerology endpoints
    path('numerology/life-path-analysis/', views.get_life_path_analysis, name='life-path-analysis'),
    path('numerology/compatibility-check/', views.check_compatibility, name='compatibility-check'),
    path('numerology/compatibility-history/', views.get_compatibility_history, name='compatibility-history'),
    path('numerology/remedies/', views.get_personalized_remedies, name='personalized-remedies'),
    path('numerology/remedies/<uuid:remedy_id>/track/', views.track_remedy, name='track-remedy'),
    path('numerology/full-report/', views.get_full_numerology_report, name='full-numerology-report'),
    path('numerology/full-report/pdf/', views.export_full_numerology_report_pdf, name='full-numerology-report-pdf'),
    
    # Multi-person numerology endpoints
    path('people/', views.people_list_create, name='people-list-create'),
    path('people/<uuid:person_id>/', views.person_detail, name='person-detail'),
    path('people/<uuid:person_id>/calculate/', views.calculate_person_numerology, name='calculate-person-numerology'),
    path('people/<uuid:person_id>/profile/', views.get_person_numerology_profile, name='person-numerology-profile'),
]