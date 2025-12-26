"""
URL routing for accounts application.
"""
from django.urls import path
from . import views
from . import views_api_key
from . import views_apple
from . import views_privacy
from . import views_notification_prefs
from . import views_sse

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
    
    # Privacy settings endpoints
    path('users/privacy-settings/', views_privacy.get_privacy_settings, name='get-privacy-settings'),
    path('users/privacy-settings/', views_privacy.update_privacy_settings, name='update-privacy-settings'),
    path('users/privacy-settings/accept-policy/', views_privacy.accept_privacy_policy, name='accept-privacy-policy'),
    
    # API Key management endpoints
    path('users/api-keys/', views_api_key.list_api_keys, name='list-api-keys'),
    path('users/api-keys/', views_api_key.create_api_key, name='create-api-key'),
    path('users/api-keys/<uuid:key_id>/', views_api_key.revoke_api_key, name='revoke-api-key'),
    path('users/api-keys/<uuid:key_id>/deactivate/', views_api_key.deactivate_api_key, name='deactivate-api-key'),
    
    # Social authentication endpoints
    path('auth/social/google/', views.google_oauth, name='google-oauth'),
    path('auth/social/apple/', views_apple.apple_oauth, name='apple-oauth'),
    
    # Notification endpoints
    path('notifications/devices/', views.register_device_token, name='register-device-token'),
    path('notifications/', views.list_notifications, name='list-notifications'),
    path('notifications/unread-count/', views.unread_notifications_count, name='unread-notifications-count'),
    path('notifications/<uuid:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('notifications/<uuid:notification_id>/', views.delete_notification, name='delete-notification'),
    
    # Notification preferences endpoints
    path('notifications/preferences/', views_notification_prefs.get_notification_preferences, name='get-notification-preferences'),
    path('notifications/preferences/', views_notification_prefs.update_notification_preference, name='update-notification-preference'),
    path('notifications/preferences/bulk-update/', views_notification_prefs.bulk_update_notification_preferences, name='bulk-update-notification-preferences'),
    
    # Real-time notification stream (SSE)
    path('notifications/stream/', views_sse.notification_stream, name='notification-stream'),
]