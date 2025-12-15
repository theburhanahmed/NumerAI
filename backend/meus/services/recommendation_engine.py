"""
Recommendation engine for MEUS next actions.
"""
from typing import Dict, List, Optional, Any
from datetime import date, datetime, timedelta
from django.utils import timezone
from meus.models import EntityProfile, UniverseEvent
from accounts.models import User
from .influence_scoring import InfluenceScoringService
from .cycle_sync import CycleSynchronizationService
from .compatibility_engine import CompatibilityEngine


class RecommendationEngine:
    """Engine for generating AI-powered action recommendations."""
    
    def __init__(self):
        self.influence_service = InfluenceScoringService()
        self.cycle_service = CycleSynchronizationService()
        self.compatibility_engine = CompatibilityEngine()
    
    def generate_recommendations(
        self,
        user: User,
        current_date: Optional[date] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered action recommendations.
        
        Args:
            user: User instance
            current_date: Current date (defaults to today)
            limit: Maximum number of recommendations
            
        Returns:
            List of recommendation dictionaries
        """
        if not current_date:
            current_date = timezone.now().date()
        
        recommendations = []
        
        # Get all entities
        entities = EntityProfile.objects.filter(user=user, is_active=True)
        current_period = f"{current_date.year}-{current_date.month:02d}"
        
        # 1. Analyze entity influences
        for entity in entities:
            influence = self.influence_service.calculate_influence(
                entity, user, current_period
            )
            
            if influence['impact_type'] == 'positive' and influence['influence_strength'] > 75:
                recommendations.append(self._create_attention_recommendation(
                    entity, influence, current_date
                ))
            elif influence['impact_type'] == 'negative' and influence['influence_strength'] < 30:
                recommendations.append(self._create_avoidance_recommendation(
                    entity, influence, current_date
                ))
        
        # 2. Identify timing opportunities
        timing_opportunities = self._find_timing_opportunities(user, entities, current_date)
        recommendations.extend(timing_opportunities)
        
        # 3. Flag conflicts
        conflicts = self._identify_conflicts(user, entities, current_date)
        recommendations.extend(conflicts)
        
        # 4. Prioritize and limit
        recommendations = self._prioritize_recommendations(recommendations)
        recommendations = recommendations[:limit]
        
        return recommendations
    
    def _create_attention_recommendation(
        self,
        entity: EntityProfile,
        influence: Dict[str, Any],
        current_date: date
    ) -> Dict[str, Any]:
        """Create attention recommendation for an entity."""
        return {
            'id': f"attention-{entity.id}",
            'type': 'attention',
            'priority': 'high' if influence['influence_strength'] > 85 else 'medium',
            'title': 'Who needs your attention this week',
            'message': f"Focus on strengthening relationship with {entity.name}",
            'entity_id': str(entity.id),
            'entity_name': entity.name,
            'reasoning': self._generate_reasoning(entity, influence),
            'action_items': [
                f"Schedule a meeting with {entity.name} this week",
                "Avoid discussing financial matters during challenging periods"
            ],
            'timing': {
                'start': current_date.isoformat(),
                'end': (current_date + timedelta(days=7)).isoformat()
            }
        }
    
    def _create_avoidance_recommendation(
        self,
        entity: EntityProfile,
        influence: Dict[str, Any],
        current_date: date
    ) -> Dict[str, Any]:
        """Create avoidance recommendation for an entity."""
        return {
            'id': f"avoid-{entity.id}",
            'type': 'avoidance',
            'priority': 'high',
            'title': 'Avoid conflict',
            'message': f"Avoid conflict with {entity.name} until next month",
            'entity_id': str(entity.id),
            'entity_name': entity.name,
            'reasoning': f"Current numerology cycles show misalignment with {entity.name}. Wait for better timing.",
            'action_items': [
                f"Postpone important discussions with {entity.name}",
                "Focus on other relationships this period"
            ],
            'timing': {
                'start': current_date.isoformat(),
                'end': (current_date + timedelta(days=30)).isoformat()
            }
        }
    
    def _find_timing_opportunities(
        self,
        user: User,
        entities: List[EntityProfile],
        current_date: date
    ) -> List[Dict[str, Any]]:
        """Find timing opportunities for actions."""
        opportunities = []
        
        # Check for property-related entities
        property_entities = entities.filter(entity_type='asset', asset_profile__asset_type='property')
        if property_entities.exists():
            # Find optimal timing for property purchase
            optimal_dates = self.cycle_service.find_optimal_timing(
                user,
                property_entities.first(),
                current_date,
                current_date + timedelta(days=60)
            )
            
            if optimal_dates:
                opportunities.append({
                    'id': 'timing-property',
                    'type': 'timing',
                    'priority': 'high',
                    'title': 'Best timing for property purchase',
                    'message': f"Optimal dates: {optimal_dates[0]['date']}",
                    'reasoning': 'Your Personal Year aligns with property numerology for stability.',
                    'action_items': [
                        'Schedule property viewings',
                        'Complete paperwork'
                    ],
                    'timing': {
                        'start': optimal_dates[0]['date'],
                        'end': optimal_dates[-1]['date'] if len(optimal_dates) > 1 else optimal_dates[0]['date']
                    }
                })
        
        return opportunities
    
    def _identify_conflicts(
        self,
        user: User,
        entities: List[EntityProfile],
        current_date: date
    ) -> List[Dict[str, Any]]:
        """Identify conflicts between entities."""
        conflicts = []
        
        # Check entity relationships for conflicts
        from meus.models import EntityRelationship
        conflict_rels = EntityRelationship.objects.filter(
            entity_1__user=user,
            compatibility_score__lt=40
        ).select_related('entity_1', 'entity_2')
        
        for rel in conflict_rels[:5]:  # Limit to 5
            conflicts.append({
                'id': f"conflict-{rel.id}",
                'type': 'conflict',
                'priority': 'medium',
                'title': 'Relationship conflict detected',
                'message': f"Potential conflict between {rel.entity_1.name} and {rel.entity_2.name}",
                'entity_id': str(rel.entity_1.id),
                'reasoning': f"Low compatibility score ({rel.compatibility_score}%) indicates potential challenges.",
                'action_items': [
                    'Mediate between conflicting parties',
                    'Avoid group activities with both present'
                ],
                'timing': {
                    'start': current_date.isoformat(),
                    'end': (current_date + timedelta(days=30)).isoformat()
                }
            })
        
        return conflicts
    
    def _prioritize_recommendations(
        self,
        recommendations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Prioritize recommendations."""
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        type_order = {'conflict': 3, 'avoidance': 2, 'attention': 2, 'timing': 1}
        
        recommendations.sort(
            key=lambda x: (
                priority_order.get(x.get('priority', 'low'), 0),
                type_order.get(x.get('type', ''), 0)
            ),
            reverse=True
        )
        
        return recommendations
    
    def _generate_reasoning(
        self,
        entity: EntityProfile,
        influence: Dict[str, Any]
    ) -> str:
        """Generate AI reasoning for recommendation."""
        compatibility = influence.get('compatibility_score', 0)
        strength = influence.get('influence_strength', 0)
        
        return (
            f"Based on numerology compatibility ({compatibility}%) and current cycles, "
            f"{entity.name} has a strong positive influence ({strength}%) on you this month. "
            f"This is an optimal time to strengthen your relationship."
        )

