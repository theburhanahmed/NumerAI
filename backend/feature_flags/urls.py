"""
URL configuration for feature flags API.
"""
from django.urls import path
from . import views

app_name = 'feature_flags'

urlpatterns = [
    # Public API endpoints
    path('feature-flags/', views.FeatureFlagListView.as_view(), name='feature-flag-list'),
    path('feature-flags/<str:name>/', views.FeatureFlagDetailView.as_view(), name='feature-flag-detail'),
    path('feature-flags/check/', views.FeatureCheckView.as_view(), name='feature-check'),
    path('users/features/', views.UserFeaturesView.as_view(), name='user-features'),
    
    # Admin endpoints
    path('admin/feature-flags/<uuid:flag_id>/toggle/', views.AdminFeatureFlagToggleView.as_view(), name='admin-toggle'),
]

