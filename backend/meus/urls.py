"""
URL configuration for MEUS API.
"""
from django.urls import path
from . import views

app_name = 'meus'

urlpatterns = [
    # Entity management
    path('entity/', views.EntityProfileListCreateView.as_view(), name='entity-list-create'),
    path('entity/<uuid:id>/', views.EntityProfileDetailView.as_view(), name='entity-detail'),
    path('entity/<uuid:id>/profile/', views.EntityProfileDetailView.as_view(), name='entity-profile'),
    
    # Universe dashboard
    path('universe/dashboard/', views.UniverseDashboardView.as_view(), name='universe-dashboard'),
    path('universe/influence-map/', views.InfluenceMapView.as_view(), name='influence-map'),
    
    # Analysis
    path('analysis/cross-entity/', views.CrossEntityAnalysisView.as_view(), name='cross-entity-analysis'),
    
    # Recommendations
    path('recommendations/next-actions/', views.NextActionsView.as_view(), name='next-actions'),
    
    # Events
    path('universe/events/', views.UniverseEventListCreateView.as_view(), name='event-list-create'),
    path('universe/events/<uuid:pk>/', views.UniverseEventDetailView.as_view(), name='event-detail'),
]

