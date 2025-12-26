"""
URL configuration for analytics app.
"""
from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Tracking endpoints
    path('track-activity/', views.track_activity_view, name='track-activity'),
    path('track-event/', views.track_event_view, name='track-event'),
    
    # Analytics retrieval endpoints
    path('personal/', views.get_personal_analytics, name='personal-analytics'),
    path('business/', views.get_business_analytics, name='business-analytics'),
    path('funnels/<str:funnel_name>/', views.get_funnel_analytics, name='funnel-analytics'),
    path('ab-tests/<uuid:experiment_id>/', views.get_ab_test_results_view, name='ab-test-results'),
]
