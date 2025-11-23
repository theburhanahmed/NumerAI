"""
URL routing for accounts application.
"""
from django.urls import path
from . import views

app_name = 'accounts'

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
]