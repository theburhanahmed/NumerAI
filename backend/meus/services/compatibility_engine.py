"""
Cross-entity compatibility engine for MEUS.
"""
from typing import Dict, List, Tuple, Optional, Any
from datetime import date
from django.db.models import Q
from meus.models import EntityProfile, EntityRelationship
from numerology.numerology import NumerologyCalculator
from numerology.compatibility import CompatibilityAnalyzer


class CompatibilityEngine:
    """Engine for calculating compatibility between entities."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
        self.analyzer = CompatibilityAnalyzer()
    
    def calculate_compatibility(
        self,
        entity_1: EntityProfile,
        entity_2: EntityProfile,
        user_profile: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Calculate compatibility between two entities.
        
        Args:
            entity_1: First entity profile
            entity_2: Second entity profile
            user_profile: Optional user profile for context
            
        Returns:
            Compatibility analysis dictionary
        """
        # Get numerology profiles
        profile_1 = entity_1.numerology_profile
        profile_2 = entity_2.numerology_profile
        
        if not profile_1 or not profile_2:
            return {
                "overall_score": 0,
                "error": "Missing numerology profiles",
                "life_path_compatibility": "unknown",
                "destiny_compatibility": "unknown",
                "cycle_alignment": "unknown",
                "details": "Cannot calculate compatibility without numerology profiles"
            }
        
        # Calculate Life Path compatibility (40% weight)
        life_path_score = self._calculate_life_path_compatibility(
            profile_1.life_path_number,
            profile_2.life_path_number
        )
        
        # Calculate Destiny compatibility (30% weight)
        destiny_score = self._calculate_destiny_compatibility(
            profile_1.destiny_number,
            profile_2.destiny_number
        )
        
        # Calculate cycle alignment (20% weight)
        cycle_alignment = self._calculate_cycle_alignment(
            profile_1,
            profile_2
        )
        
        # Relationship type modifier (10% weight)
        relationship_modifier = self._get_relationship_modifier(
            entity_1.relationship_type
        )
        
        # Calculate overall compatibility
        compatibility = (
            life_path_score * 0.4 +
            destiny_score * 0.3 +
            cycle_alignment * 0.2 +
            relationship_modifier * 0.1
        )
        
        return {
            "overall_score": round(compatibility),
            "life_path_compatibility": self._get_compatibility_level(life_path_score),
            "destiny_compatibility": self._get_compatibility_level(destiny_score),
            "cycle_alignment": self._get_alignment_level(cycle_alignment),
            "life_path_score": life_path_score,
            "destiny_score": destiny_score,
            "cycle_alignment_score": cycle_alignment,
            "relationship_modifier": relationship_modifier,
            "details": self._generate_compatibility_details(
                profile_1, profile_2, life_path_score, destiny_score, cycle_alignment
            )
        }
    
    def calculate_compatibility_matrix(
        self,
        entities: List[EntityProfile],
        user_profile: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculate compatibility matrix for multiple entities.
        
        Args:
            entities: List of entity profiles
            user_profile: Optional user profile
            
        Returns:
            List of compatibility results
        """
        results = []
        
        for i, entity_1 in enumerate(entities):
            for entity_2 in entities[i+1:]:
                compatibility = self.calculate_compatibility(entity_1, entity_2, user_profile)
                results.append({
                    "entity_1_id": str(entity_1.id),
                    "entity_1_name": entity_1.name,
                    "entity_2_id": str(entity_2.id),
                    "entity_2_name": entity_2.name,
                    **compatibility
                })
        
        return results
    
    def _calculate_life_path_compatibility(self, lp1: int, lp2: int) -> float:
        """Calculate Life Path compatibility score (0-100)."""
        # Use existing compatibility analyzer
        compatibility_data = self.analyzer.calculate_compatibility_scores(
            {'life_path_number': lp1},
            {'life_path_number': lp2},
            relationship_type='friendship'  # Default, can be customized
        )
        
        return compatibility_data.get('life_path_score', 50)
    
    def _calculate_destiny_compatibility(self, d1: int, d2: int) -> float:
        """Calculate Destiny compatibility score (0-100)."""
        # Use existing compatibility analyzer
        compatibility_data = self.analyzer.calculate_compatibility_scores(
            {'destiny_number': d1},
            {'destiny_number': d2},
            relationship_type='friendship'
        )
        
        return compatibility_data.get('destiny_score', 50)
    
    def _calculate_cycle_alignment(
        self,
        profile_1: Any,
        profile_2: Any
    ) -> float:
        """Calculate cycle alignment score (0-100)."""
        # Check Personal Year alignment
        py1 = getattr(profile_1, 'personal_year_number', 1)
        py2 = getattr(profile_2, 'personal_year_number', 1)
        
        # Check Personal Month alignment
        pm1 = getattr(profile_1, 'personal_month_number', 1)
        pm2 = getattr(profile_2, 'personal_month_number', 1)
        
        # Calculate alignment
        year_alignment = 100 - abs(py1 - py2) * 10
        month_alignment = 100 - abs(pm1 - pm2) * 10
        
        # Average alignment
        alignment = (year_alignment + month_alignment) / 2
        
        return max(0, min(100, alignment))
    
    def _get_relationship_modifier(self, relationship_type: Optional[str]) -> float:
        """Get relationship type modifier (0-100)."""
        modifiers = {
            'family': 90,
            'partner': 85,
            'friend': 80,
            'business_partner': 75,
            'colleague': 70,
            'client': 65,
            'other': 60,
        }
        return modifiers.get(relationship_type, 60)
    
    def _get_compatibility_level(self, score: float) -> str:
        """Get compatibility level from score."""
        if score >= 80:
            return "excellent"
        elif score >= 65:
            return "good"
        elif score >= 50:
            return "moderate"
        elif score >= 35:
            return "challenging"
        else:
            return "difficult"
    
    def _get_alignment_level(self, score: float) -> str:
        """Get alignment level from score."""
        if score >= 80:
            return "highly_aligned"
        elif score >= 60:
            return "aligned"
        elif score >= 40:
            return "neutral"
        else:
            return "misaligned"
    
    def _generate_compatibility_details(
        self,
        profile_1: Any,
        profile_2: Any,
        life_path_score: float,
        destiny_score: float,
        cycle_alignment: float
    ) -> str:
        """Generate detailed compatibility description."""
        details = []
        
        lp_level = self._get_compatibility_level(life_path_score)
        details.append(f"Life Path compatibility: {lp_level} ({life_path_score:.0f}%)")
        
        dest_level = self._get_compatibility_level(destiny_score)
        details.append(f"Destiny compatibility: {dest_level} ({destiny_score:.0f}%)")
        
        align_level = self._get_alignment_level(cycle_alignment)
        details.append(f"Cycle alignment: {align_level} ({cycle_alignment:.0f}%)")
        
        return ". ".join(details)
    
    def get_or_create_relationship(
        self,
        entity_1: EntityProfile,
        entity_2: EntityProfile,
        user_profile: Optional[Any] = None,
        force_recalculate: bool = False
    ) -> Tuple[EntityRelationship, bool]:
        """
        Get or create entity relationship with compatibility analysis.
        
        Args:
            entity_1: First entity
            entity_2: Second entity
            user_profile: Optional user profile
            force_recalculate: Force recalculation even if cached
            
        Returns:
            Tuple of (EntityRelationship, created)
        """
        # Ensure consistent ordering (smaller UUID first)
        if str(entity_1.id) > str(entity_2.id):
            entity_1, entity_2 = entity_2, entity_1
        
        relationship, created = EntityRelationship.objects.get_or_create(
            entity_1=entity_1,
            entity_2=entity_2,
            defaults={}
        )
        
        # Recalculate if needed
        if force_recalculate or not relationship.compatibility_score or created:
            compatibility = self.calculate_compatibility(entity_1, entity_2, user_profile)
            
            relationship.compatibility_score = compatibility.get('overall_score', 0)
            relationship.influence_score = compatibility.get('overall_score', 0) - 50  # Center at 0
            relationship.analysis_data = compatibility
            relationship.relationship_type = self._determine_relationship_type(
                compatibility.get('overall_score', 50)
            )
            relationship.save()
        
        return relationship, created
    
    def _determine_relationship_type(self, score: float) -> str:
        """Determine relationship type from compatibility score."""
        if score >= 75:
            return "harmony"
        elif score >= 60:
            return "compatible"
        elif score >= 40:
            return "neutral"
        elif score >= 25:
            return "challenging"
        else:
            return "conflict"

