"""
URL configuration for NumerAI project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('numerology.urls')),
    path('api/v1/', include('ai_chat.urls')),
    path('api/v1/', include('consultations.urls')),
    path('api/v1/', include('reports.urls')),
    path('api/v1/', include('payments.urls')),
    path('api/v1/dashboard/', include('dashboard.urls')),
    path('api/v1/calendar/', include('smart_calendar.urls')),
    path('api/v1/knowledge-graph/', include('knowledge_graph.urls')),
    path('api/v1/decisions/', include('decisions.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/social/', include('social.urls')),
    path('api/v1/matchmaking/', include('matchmaking.urls')),
    path('api/v1/rewards/', include('rewards.urls')),
    path('api/v1/developer/', include('developer_api.urls')),
    path('api/v1/', include('feature_flags.urls')),
    path('api/v1/', include('meus.urls')),
    
    # Django Allauth
    path('accounts/', include('allauth.urls')),
    
    # GraphQL API
    path('api/v1/graphql/', include('graphql_api.urls')),
    
    # API Schema & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)