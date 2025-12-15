"""
Influence scoring service for MEUS.
"""
from typing import Dict, List, Optional, Any
from datetime import date, datetime
from django.utils import timezone
from django.db.models import Q
from meus.models import EntityProfile, EntityInfluence
from accounts.models import User
from numerology.models import NumerologyProfile
from .compatibility_engine import CompatibilityEngine


class InfluenceScoringService:
    """Service for calculating entity influence on users."""
    
    def __init__(self):
        self.compatibility_engine = CompatibilityEngine()
    
    def calculate_influence(
        self,
        entity: EntityProfile,
        user: User,
        current_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate entity's influence on user.
        
        Args:
            entity: Entity profile
            user: User instance
            current_period: Current period ('2026' or '2026-04')
            
        Returns:
            Influence analysis dictionary
        """
        if not current_period:
            now = timezone.now()
            current_period = f"{now.year}-{now.month:02d}"
        
        # Get numerology profiles
        user_profile = getattr(user, 'numerology_profile', None)
        entity_profile = entity.numerology_profile
        
        if not user_profile or not entity_profile:
            return {
                "influence_strength": 0,
                "impact_type": "neutral",
                "impact_areas": {}
            }
        
        # Calculate compatibility (50% weight)
        compatibility = self._get_compatibility_score(entity, user_profile)
        
        # Relationship strength (20% weight)
        relationship_strength = self._get_relationship_strength(entity.relationship_type)
        
        # Cycle alignment (20% weight)
        cycle_alignment = self._check_cycle_alignment(entity, user_profile, current_period)
        
        # Historical pattern (10% weight) - placeholder for future
        historical_pattern = 50  # Default neutral
        
        # Calculate influence strength
        influence_strength = (
            compatibility * 0.5 +
            relationship_strength * 0.2 +
            cycle_alignment * 0.2 +
            historical_pattern * 0.1
        )
        
        # Determine impact type
        if influence_strength > 70:
            impact_type = "positive"
        elif influence_strength < 40:
            impact_type = "negative"
        else:
            impact_type = "neutral"
        
        # Calculate impact areas
        impact_areas = self._calculate_impact_areas(
            entity, user_profile, compatibility
        )
        
        return {
            "influence_strength": round(influence_strength),
            "impact_type": impact_type,
            "impact_areas": impact_areas,
            "compatibility_score": compatibility,
            "relationship_strength": relationship_strength,
            "cycle_alignment": cycle_alignment
        }
    
    def calculate_all_influences(
        self,
        user: User,
        period: str = None,
        cycle_period: str = "month"
    ) -> List[Dict[str, Any]]:
        """
        Calculate influences for all user's entities.
        
        Args:
            user: User instance
            period: Period value ('2026' or '2026-04')
            cycle_period: 'year' or 'month'
            
        Returns:
            List of influence dictionaries
        """
        if not period:
            now = timezone.now()
            if cycle_period == "year":
                period = str(now.year)
            else:
                period = f"{now.year}-{now.month:02d}"
        
        entities = EntityProfile.objects.filter(user=user, is_active=True)
        influences = []
        
        for entity in entities:
            influence_data = self.calculate_influence(entity, user, period)
            
            # Save to database
            influence, _ = EntityInfluence.objects.update_or_create(
                user=user,
                entity=entity,
                cycle_period=cycle_period,
                cycle_value=period,
                defaults={
                    'influence_strength': influence_data['influence_strength'],
                    'impact_type': influence_data['impact_type'],
                    'impact_areas': influence_data['impact_areas']
                }
            )
            
            influences.append({
                'entity_id': str(entity.id),
                'entity_name': entity.name,
                'entity_type': entity.entity_type,
                **influence_data
            })
        
        return influences
    
    def _get_compatibility_score(
        self,
        entity: EntityProfile,
        user_profile: NumerologyProfile
    ) -> float:
        """Get compatibility score between entity and user."""
        entity_profile = entity.numerology_profile
        if not entity_profile:
            return 50  # Neutral
        
        # Use compatibility engine
        compatibility = self.compatibility_engine.calculate_compatibility(
            entity,
            EntityProfile(
                name=user_profile.user.full_name,
                numerology_profile=user_profile
            ),
            user_profile
        )
        
        return compatibility.get('overall_score', 50)
    
    def _get_relationship_strength(self, relationship_type: Optional[str]) -> float:
        """Get relationship strength modifier (0-100)."""
        strengths = {
            'family': 90,
            'partner': 95,
            'child': 85,
            'business_partner': 80,
            'friend': 75,
            'colleague': 60,
            'client': 50,
            'other': 50,
        }
        return strengths.get(relationship_type, 50)
    
    def _check_cycle_alignment(
        self,
        entity: EntityProfile,
        user_profile: NumerologyProfile,
        current_period: str
    ) -> float:
        """Check cycle alignment between entity and user."""
        entity_profile = entity.numerology_profile
        if not entity_profile:
            return 50  # Neutral
        
        # Get current cycles
        user_py = getattr(user_profile, 'personal_year_number', 1)
        user_pm = getattr(user_profile, 'personal_month_number', 1)
        
        entity_py = getattr(entity_profile, 'personal_year_number', 1)
        entity_pm = getattr(entity_profile, 'personal_month_number', 1)
        
        # Calculate alignment
        year_diff = abs(user_py - entity_py)
        month_diff = abs(user_pm - entity_pm)
        
        # Alignment score (closer = higher)
        year_alignment = max(0, 100 - year_diff * 15)
        month_alignment = max(0, 100 - month_diff * 15)
        
        return (year_alignment + month_alignment) / 2
    
    def _calculate_impact_areas(
        self,
        entity: EntityProfile,
        user_profile: NumerologyProfile,
        compatibility: float
    ) -> Dict[str, int]:
        """Calculate impact on different life areas."""
        entity_profile = entity.numerology_profile
        if not entity_profile:
            return {
                "health": 50,
                "money": 50,
                "career": 50,
                "relationships": 50,
                "stability": 50
            }
        
        # Base impact from compatibility
        base_impact = compatibility
        
        # Adjust based on Life Path numbers
        user_lp = getattr(user_profile, 'life_path_number', 1)
        entity_lp = getattr(entity_profile, 'life_path_number', 1)
        
        # Different areas affected by different number combinations
        impact_areas = {
            "health": base_impact,
            "money": base_impact,
            "career": base_impact,
            "relationships": base_impact,
            "stability": base_impact
        }
        
        # Adjust based on number meanings
        # Health: affected by 1, 4, 6
        if entity_lp in [1, 4, 6]:
            impact_areas["health"] = min(100, base_impact + 10)
        
        # Money: affected by 4, 8
        if entity_lp in [4, 8]:
            impact_areas["money"] = min(100, base_impact + 15)
        
        # Career: affected by 1, 8, 22
        if entity_lp in [1, 8, 22]:
            impact_areas["career"] = min(100, base_impact + 15)
        
        # Relationships: affected by 2, 6, 9
        if entity_lp in [2, 6, 9]:
            impact_areas["relationships"] = min(100, base_impact + 15)
        
        # Stability: affected by 4, 7
        if entity_lp in [4, 7]:
            impact_areas["stability"] = min(100, base_impact + 10)
        
        return {k: round(v) for k, v in impact_areas.items()}

