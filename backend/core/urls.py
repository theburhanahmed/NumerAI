"""
URL routing for NumerAI core application.
"""
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/verify-otp/', views.verify_otp, name='verify-otp'),
    path('auth/resend-otp/', views.resend_otp, name='resend-otp'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/refresh-token/', views.refresh_token, name='refresh-token'),
    path('auth/password-reset/', views.password_reset_request, name='password-reset'),
    path('auth/password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    path('auth/reset-password/token/', views.password_reset_token_request, name='password-reset-token'),
    path('auth/reset-password/token/confirm/', views.password_reset_token_confirm, name='password-reset-token-confirm'),
    
    # User profile endpoints
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Notification endpoints
    path('notifications/devices/', views.register_device_token, name='register-device-token'),
    
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
    path('report-templates/', views.report_templates_list, name='report-templates-list'),
    path('reports/generate/', views.generate_report, name='generate-report'),
    path('reports/bulk-generate/', views.bulk_generate_reports, name='bulk-generate-reports'),
    path('reports/', views.get_generated_reports, name='get-generated-reports'),
    path('reports/<uuid:report_id>/', views.get_generated_report, name='get-generated-report'),
    
    # Expert and consultation endpoints
    path('experts/', views.get_experts, name='experts'),
    path('experts/<uuid:expert_id>/', views.get_expert, name='expert-detail'),
    path('consultations/book/', views.book_consultation, name='book-consultation'),
    path('consultations/upcoming/', views.get_upcoming_consultations, name='upcoming-consultations'),
    path('consultations/past/', views.get_past_consultations, name='past-consultations'),
    path('consultations/<uuid:consultation_id>/rate/', views.rate_consultation, name='rate-consultation'),
    
    # AI Chat endpoints
    path('ai/chat/', views.ai_chat, name='ai-chat'),
    path('ai/conversations/', views.get_conversations, name='ai-conversations'),
    path('ai/conversations/<uuid:conversation_id>/messages/', views.get_conversation_messages, name='ai-conversation-messages'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]