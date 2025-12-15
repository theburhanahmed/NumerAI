"""
API views for MEUS (Multi-Entity Universe System).
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import date, timedelta
from accounts.models import User
from numerology.models import NumerologyProfile
from numerology.numerology import NumerologyCalculator
from feature_flags.services import FeatureFlagService
from .models import (
    EntityProfile,
    EntityRelationship,
    EntityInfluence,
    UniverseEvent,
    AssetProfile
)
from .serializers import (
    EntityProfileSerializer,
    EntityRelationshipSerializer,
    EntityInfluenceSerializer,
    UniverseEventSerializer,
    AssetProfileSerializer,
    CrossEntityAnalysisSerializer
)
from .services import (
    CompatibilityEngine,
    InfluenceScoringService,
    CycleSynchronizationService,
    GraphGeneratorService,
    RecommendationEngine
)


class EntityProfileListCreateView(ListCreateAPIView):
    """List and create entity profiles."""
    
    serializer_class = EntityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get user's entities with optional filtering."""
        queryset = EntityProfile.objects.filter(
            user=self.request.user,
            is_active=True
        ).select_related('numerology_profile')
        
        # Filter by entity type
        entity_type = self.request.query_params.get('entity_type')
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)
        
        # Filter by relationship type
        relationship_type = self.request.query_params.get('relationship_type')
        if relationship_type:
            queryset = queryset.filter(relationship_type=relationship_type)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create entity and calculate numerology."""
        # Check feature flag
        if not FeatureFlagService.can_access(self.request.user, 'meus_entities'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Upgrade to Premium to access MEUS")
        
        entity = serializer.save(user=self.request.user)
        
        # Calculate numerology if DOB provided
        if entity.date_of_birth and entity.entity_type == 'person':
            calculator = NumerologyCalculator()
            profile_data = calculator.calculate_full_profile(
                entity.name,
                entity.date_of_birth
            )
            
            # Create or update numerology profile
            numerology_profile, created = NumerologyProfile.objects.get_or_create(
                user=entity.user,  # Use entity's user for now
                defaults=profile_data
            )
            if not created:
                for key, value in profile_data.items():
                    setattr(numerology_profile, key, value)
                numerology_profile.save()
            
            entity.numerology_profile = numerology_profile
            entity.save()
        
        return entity


class EntityProfileDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete entity profile."""
    
    serializer_class = EntityProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EntityProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get entity with full profile data."""
        obj = get_object_or_404(
            EntityProfile,
            id=self.kwargs['id'],
            user=self.request.user
        )
        return obj
    
    def perform_destroy(self, instance):
        """Soft delete by setting is_active=False."""
        instance.is_active = False
        instance.save()


class UniverseDashboardView(APIView):
    """Get universe intelligence dashboard data."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get dashboard data."""
        # Check feature flag
        if not FeatureFlagService.can_access(request.user, 'meus_dashboard'):
            return Response(
                {'error': 'Upgrade to Premium to access MEUS Dashboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        entities = EntityProfile.objects.filter(user=request.user, is_active=True)
        
        # Generate network graph
        graph_service = GraphGeneratorService()
        network_graph = graph_service.generate_network_graph(request.user)
        
        # Get influence heatmap
        influence_service = InfluenceScoringService()
        now = timezone.now()
        current_month = f"{now.year}-{now.month:02d}"
        influences = influence_service.calculate_all_influences(
            request.user,
            period=current_month,
            cycle_period='month'
        )
        
        # Organize influences by type
        positive_influences = [i for i in influences if i.get('impact_type') == 'positive']
        negative_influences = [i for i in influences if i.get('impact_type') == 'negative']
        neutral_influences = [i for i in influences if i.get('impact_type') == 'neutral']
        
        # Get alerts and opportunities
        conflicts = graph_service.find_conflicts(request.user)
        harmonious = graph_service.find_harmonious_connections(request.user)
        
        alerts = []
        opportunities = []
        
        for conflict in conflicts:
            alerts.append({
                'type': 'conflict_warning',
                'message': f"Potential conflict between {conflict['entity_1_name']} and {conflict['entity_2_name']}",
                'entity_id': conflict['entity_1_id'],
                'severity': conflict['severity'],
                'expires_at': None
            })
        
        for harmony in harmonious[:5]:  # Top 5
            opportunities.append({
                'type': 'relationship',
                'message': f"Strong harmony between {harmony['entity_1_name']} and {harmony['entity_2_name']}",
                'entity_id': harmony['entity_1_id'],
                'timing': None
            })
        
        return Response({
            'summary': {
                'total_entities': entities.count(),
                'people_count': entities.filter(entity_type='person').count(),
                'assets_count': entities.filter(entity_type='asset').count(),
                'events_count': entities.filter(entity_type='event').count()
            },
            'network_graph': {
                'nodes': network_graph['nodes'],
                'edges': network_graph['edges']
            },
            'influence_heatmap': {
                'current_month': {
                    'positive_influences': positive_influences,
                    'negative_influences': negative_influences,
                    'neutral_influences': neutral_influences
                }
            },
            'alerts': alerts,
            'opportunities': opportunities
        })


class CrossEntityAnalysisView(APIView):
    """Perform cross-entity analysis."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Analyze multiple entities."""
        # Check feature flag
        if not FeatureFlagService.can_access(request.user, 'meus_analysis'):
            return Response(
                {'error': 'Upgrade to Premium to access cross-entity analysis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CrossEntityAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        entity_ids = serializer.validated_data['entity_ids']
        analysis_type = serializer.validated_data.get('analysis_type', 'full')
        
        # Get entities
        entities = EntityProfile.objects.filter(
            id__in=entity_ids,
            user=request.user,
            is_active=True
        )
        
        if entities.count() != len(entity_ids):
            return Response(
                {'error': 'Some entities not found or not accessible'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        engine = CompatibilityEngine()
        user_profile = getattr(request.user, 'numerology_profile', None)
        
        # Calculate compatibility matrix
        compatibility_matrix = engine.calculate_compatibility_matrix(
            list(entities),
            user_profile
        )
        
        # Calculate influences if needed
        influence_analysis = {}
        if analysis_type in ['influence', 'full']:
            influence_service = InfluenceScoringService()
            influence_analysis = {
                'positive_influences': [],
                'negative_influences': [],
                'recommendations': []
            }
            
            for entity in entities:
                influence = influence_service.calculate_influence(entity, request.user)
                if influence['impact_type'] == 'positive':
                    influence_analysis['positive_influences'].append({
                        'entity_id': str(entity.id),
                        'entity_name': entity.name,
                        **influence
                    })
                elif influence['impact_type'] == 'negative':
                    influence_analysis['negative_influences'].append({
                        'entity_id': str(entity.id),
                        'entity_name': entity.name,
                        **influence
                    })
        
        return Response({
            'compatibility_matrix': compatibility_matrix,
            'influence_analysis': influence_analysis,
            'calculated_at': timezone.now().isoformat()
        })


class NextActionsView(APIView):
    """Get AI-generated next action recommendations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get recommendations."""
        # Check feature flag
        if not FeatureFlagService.can_access(request.user, 'meus_recommendations'):
            return Response(
                {'error': 'Upgrade to Elite to access action recommendations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        limit = int(request.query_params.get('limit', 10))
        priority = request.query_params.get('priority', 'all')
        
        # Use recommendation engine
        engine = RecommendationEngine()
        now = timezone.now()
        current_date = now.date()
        
        recommendations = engine.generate_recommendations(
            request.user,
            current_date,
            limit=limit
        )
        
        # Filter by priority if specified
        if priority != 'all':
            recommendations = [r for r in recommendations if r.get('priority') == priority]
        
        return Response({
            'recommendations': recommendations,
            'generated_at': now.isoformat()
        })


class InfluenceMapView(APIView):
    """Get influence heatmap for a period."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get influence map."""
        period = request.query_params.get('period', 'month')
        period_value = request.query_params.get('period_value')
        
        if not period_value:
            now = timezone.now()
            if period == 'year':
                period_value = str(now.year)
            else:
                period_value = f"{now.year}-{now.month:02d}"
        
        influence_service = InfluenceScoringService()
        influences = influence_service.calculate_all_influences(
            request.user,
            period=period_value,
            cycle_period=period
        )
        
        # Organize by type
        positive_count = sum(1 for i in influences if i.get('impact_type') == 'positive')
        negative_count = sum(1 for i in influences if i.get('impact_type') == 'negative')
        neutral_count = sum(1 for i in influences if i.get('impact_type') == 'neutral')
        
        return Response({
            'period': period_value,
            'influences': influences,
            'heatmap_data': {
                'positive_count': positive_count,
                'negative_count': negative_count,
                'neutral_count': neutral_count
            }
        })


class UniverseEventListCreateView(ListCreateAPIView):
    """List and create universe events."""
    
    serializer_class = UniverseEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UniverseEvent.objects.filter(user=self.request.user).order_by('-event_date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UniverseEventDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete universe event."""
    
    serializer_class = UniverseEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UniverseEvent.objects.filter(user=self.request.user)
