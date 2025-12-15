"""
Cycle synchronization service for MEUS.
"""
from typing import Dict, List, Optional, Any
from datetime import date, datetime
from django.utils import timezone
from meus.models import EntityProfile
from accounts.models import User
from numerology.models import NumerologyProfile


class CycleSynchronizationService:
    """Service for synchronizing entity cycles with user cycles."""
    
    def synchronize_cycles(
        self,
        user: User,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Synchronize all entity cycles with user's cycles.
        
        Args:
            user: User instance
            target_date: Target date for cycle calculation
            
        Returns:
            Synchronization analysis
        """
        if not target_date:
            target_date = timezone.now().date()
        
        user_profile = getattr(user, 'numerology_profile', None)
        if not user_profile:
            return {
                "synchronized": False,
                "error": "User has no numerology profile"
            }
        
        entities = EntityProfile.objects.filter(user=user, is_active=True)
        
        user_cycles = self._get_user_cycles(user_profile, target_date)
        
        synchronized_entities = []
        misaligned_entities = []
        aligned_periods = []
        challenge_periods = []
        
        for entity in entities:
            entity_profile = entity.numerology_profile
            if not entity_profile:
                continue
            
            entity_cycles = self._get_entity_cycles(entity_profile, target_date)
            alignment = self._calculate_alignment(user_cycles, entity_cycles)
            
            entity_data = {
                'entity_id': str(entity.id),
                'entity_name': entity.name,
                'alignment_score': alignment['score'],
                'alignment_status': alignment['status'],
                'user_cycles': user_cycles,
                'entity_cycles': entity_cycles
            }
            
            if alignment['score'] >= 70:
                synchronized_entities.append(entity_data)
                aligned_periods.append({
                    'entity': entity.name,
                    'period': f"{target_date.year}-{target_date.month:02d}",
                    'score': alignment['score']
                })
            else:
                misaligned_entities.append(entity_data)
                if alignment['score'] < 40:
                    challenge_periods.append({
                        'entity': entity.name,
                        'period': f"{target_date.year}-{target_date.month:02d}",
                        'score': alignment['score'],
                        'warning': 'High misalignment - potential challenges'
                    })
        
        return {
            "synchronized": True,
            "target_date": target_date.isoformat(),
            "user_cycles": user_cycles,
            "synchronized_entities": synchronized_entities,
            "misaligned_entities": misaligned_entities,
            "aligned_periods": aligned_periods,
            "challenge_periods": challenge_periods,
            "summary": {
                "total_entities": len(entities),
                "synchronized_count": len(synchronized_entities),
                "misaligned_count": len(misaligned_entities),
                "alignment_rate": len(synchronized_entities) / len(entities) * 100 if entities else 0
            }
        }
    
    def find_optimal_timing(
        self,
        user: User,
        entity: EntityProfile,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Find optimal timing for interactions with an entity.
        
        Args:
            user: User instance
            entity: Entity profile
            start_date: Start date for search
            end_date: End date for search
            
        Returns:
            List of optimal dates with scores
        """
        user_profile = getattr(user, 'numerology_profile', None)
        entity_profile = entity.numerology_profile
        
        if not user_profile or not entity_profile:
            return []
        
        optimal_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            user_cycles = self._get_user_cycles(user_profile, current_date)
            entity_cycles = self._get_entity_cycles(entity_profile, current_date)
            alignment = self._calculate_alignment(user_cycles, entity_cycles)
            
            if alignment['score'] >= 70:
                optimal_dates.append({
                    'date': current_date.isoformat(),
                    'score': alignment['score'],
                    'status': alignment['status'],
                    'user_cycles': user_cycles,
                    'entity_cycles': entity_cycles
                })
            
            # Move to next day
            from datetime import timedelta
            current_date += timedelta(days=1)
        
        # Sort by score descending
        optimal_dates.sort(key=lambda x: x['score'], reverse=True)
        
        return optimal_dates[:10]  # Return top 10
    
    def _get_user_cycles(
        self,
        profile: NumerologyProfile,
        target_date: date
    ) -> Dict[str, int]:
        """Get user's cycles for a specific date."""
        # Calculate Personal Year and Month for target date
        from numerology.numerology import NumerologyCalculator
        calculator = NumerologyCalculator()
        
        # Personal Year
        personal_year = calculator.calculate_personal_year_number(
            profile.user.date_of_birth,
            target_date.year
        )
        
        # Personal Month
        personal_month = calculator.calculate_personal_month_number(
            profile.user.date_of_birth,
            target_date.year,
            target_date.month
        )
        
        # Personal Day
        personal_day = calculator.calculate_personal_day_number(
            profile.user.date_of_birth,
            target_date
        )
        
        return {
            'personal_year': personal_year,
            'personal_month': personal_month,
            'personal_day': personal_day,
            'life_path': profile.life_path_number,
            'destiny': profile.destiny_number
        }
    
    def _get_entity_cycles(
        self,
        profile: NumerologyProfile,
        target_date: date
    ) -> Dict[str, int]:
        """Get entity's cycles for a specific date."""
        from numerology.numerology import NumerologyCalculator
        calculator = NumerologyCalculator()
        
        # Get entity's birth date from profile's user
        user = getattr(profile, 'user', None)
        if user and hasattr(user, 'date_of_birth') and user.date_of_birth:
            dob = user.date_of_birth
        else:
            # Fallback - use stored cycles if available
            return {
                'personal_year': getattr(profile, 'personal_year_number', 1),
                'personal_month': getattr(profile, 'personal_month_number', 1),
                'personal_day': 1,  # Would need to calculate daily
                'life_path': profile.life_path_number,
                'destiny': profile.destiny_number
            }
        
        personal_year = calculator.calculate_personal_year_number(dob, target_date.year)
        personal_month = calculator.calculate_personal_month_number(dob, target_date.year, target_date.month)
        personal_day = calculator.calculate_personal_day_number(dob, target_date)
        
        return {
            'personal_year': personal_year,
            'personal_month': personal_month,
            'personal_day': personal_day,
            'life_path': profile.life_path_number,
            'destiny': profile.destiny_number
        }
    
    def _calculate_alignment(
        self,
        user_cycles: Dict[str, int],
        entity_cycles: Dict[str, int]
    ) -> Dict[str, Any]:
        """Calculate alignment between user and entity cycles."""
        # Calculate differences
        year_diff = abs(user_cycles['personal_year'] - entity_cycles['personal_year'])
        month_diff = abs(user_cycles['personal_month'] - entity_cycles['personal_month'])
        day_diff = abs(user_cycles['personal_day'] - entity_cycles['personal_day'])
        
        # Calculate alignment scores (closer = higher)
        year_score = max(0, 100 - year_diff * 20)
        month_score = max(0, 100 - month_diff * 15)
        day_score = max(0, 100 - day_diff * 10)
        
        # Weighted average
        alignment_score = (year_score * 0.5 + month_score * 0.3 + day_score * 0.2)
        
        # Determine status
        if alignment_score >= 80:
            status = "highly_aligned"
        elif alignment_score >= 60:
            status = "aligned"
        elif alignment_score >= 40:
            status = "neutral"
        else:
            status = "misaligned"
        
        return {
            'score': round(alignment_score),
            'status': status,
            'year_diff': year_diff,
            'month_diff': month_diff,
            'day_diff': day_diff
        }

