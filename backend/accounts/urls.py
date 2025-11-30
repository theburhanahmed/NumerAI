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
    path('users/delete-account/', views.delete_account, name='delete-account'),
    path('users/export-data/', views.export_data, name='export-data'),
    
    # Social authentication endpoints
    path('auth/social/google/', views.google_oauth, name='google-oauth'),
    
    # Notification endpoints
    path('notifications/devices/', views.register_device_token, name='register-device-token'),
    path('notifications/', views.list_notifications, name='list-notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='unread-notifications-count'),
    path('notifications/<uuid:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('notifications/<uuid:notification_id>/', views.delete_notification, name='delete-notification'),
]