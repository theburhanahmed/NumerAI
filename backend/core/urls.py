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
    
    # AI Chat endpoints
    path('ai/chat/', views.ai_chat, name='ai-chat'),
    path('ai/conversations/', views.get_conversations, name='ai-conversations'),
    path('ai/conversations/<uuid:conversation_id>/messages/', views.get_conversation_messages, name='ai-conversation-messages'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]