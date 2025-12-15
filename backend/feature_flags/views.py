"""
API views for feature flags.
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from accounts.models import User
from .models import FeatureFlag, SubscriptionFeatureAccess
from .services import FeatureFlagService, FeatureFlagManager
from .serializers import (
    FeatureFlagSerializer,
    FeatureFlagListSerializer,
    UserFeatureAccessSerializer,
    FeatureCheckSerializer,
    FeatureCheckResponseSerializer
)


class FeatureFlagListView(APIView):
    """List all feature flags."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all feature flags with user access status."""
        flags = FeatureFlag.objects.filter(is_active=True).prefetch_related('tier_access')
        serializer = FeatureFlagListSerializer(flags, many=True)
        
        # Add user access status
        user_features = FeatureFlagService.get_user_features(request.user)
        data = []
        for flag_data in serializer.data:
            flag_data['has_access'] = user_features.get(flag_data['name'], False)
            data.append(flag_data)
        
        return Response(data)


class FeatureFlagDetailView(APIView):
    """Get feature flag details."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, name):
        """Get feature flag details with user access."""
        flag = get_object_or_404(FeatureFlag, name=name)
        serializer = FeatureFlagSerializer(flag)
        
        # Add user access
        has_access = FeatureFlagService.can_access(request.user, name)
        limits = FeatureFlagService.get_feature_limits(request.user, name)
        
        data = serializer.data
        data['has_access'] = has_access
        data['limits'] = limits
        
        return Response(data)


class UserFeaturesView(APIView):
    """Get all features available to the current user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all features with access status for current user."""
        from numerology.subscription_utils import get_user_subscription_tier
        
        user_features = FeatureFlagService.get_user_features(request.user)
        tier = get_user_subscription_tier(request.user)
        
        # Get feature details
        features = []
        for feature_name, has_access in user_features.items():
            try:
                flag = FeatureFlag.objects.get(name=feature_name)
                limits = FeatureFlagService.get_feature_limits(request.user, feature_name)
                features.append({
                    'feature_name': feature_name,
                    'display_name': flag.display_name,
                    'category': flag.category,
                    'has_access': has_access,
                    'limits': limits
                })
            except FeatureFlag.DoesNotExist:
                continue
        
        return Response({
            'subscription_tier': tier,
            'features': features
        })


class FeatureCheckView(APIView):
    """Check if user can access a specific feature."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Check feature access."""
        serializer = FeatureCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        feature_name = serializer.validated_data['feature_name']
        has_access = FeatureFlagService.can_access(request.user, feature_name)
        limits = FeatureFlagService.get_feature_limits(request.user, feature_name)
        
        from numerology.subscription_utils import get_user_subscription_tier
        tier = get_user_subscription_tier(request.user)
        
        response_data = {
            'feature_name': feature_name,
            'has_access': has_access,
            'limits': limits,
            'subscription_tier': tier
        }
        
        response_serializer = FeatureCheckResponseSerializer(data=response_data)
        response_serializer.is_valid()
        
        return Response(response_serializer.validated_data)


# Admin views (staff only)
class AdminFeatureFlagToggleView(APIView):
    """Admin view to toggle feature access for a tier."""
    
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, flag_id):
        """Toggle feature access for a tier."""
        flag = get_object_or_404(FeatureFlag, id=flag_id)
        tier = request.data.get('tier')
        is_enabled = request.data.get('is_enabled', True)
        
        if tier not in ['free', 'basic', 'premium', 'elite']:
            return Response(
                {'error': 'Invalid tier. Must be one of: free, basic, premium, elite'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        access = FeatureFlagManager.toggle_tier_access(flag, tier, is_enabled)
        
        return Response({
            'success': True,
            'feature_flag': flag.name,
            'tier': tier,
            'is_enabled': access.is_enabled
        })
