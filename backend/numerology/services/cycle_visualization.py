"""
Cycle visualization data generator for numerology.
"""
from typing import Dict, List, Any
from datetime import date, datetime
from numerology.numerology import NumerologyCalculator
from numerology.services.essence_cycles import EssenceCycleCalculator


class CycleVisualizationService:
    """Service for generating cycle visualization data."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
        self.essence_calculator = EssenceCycleCalculator()
    
    def generate_cycle_timeline(
        self,
        full_name: str,
        birth_date: date,
        start_year: int = None,
        end_year: int = None
    ) -> Dict[str, Any]:
        """
        Generate complete cycle timeline visualization data.
        
        Args:
            full_name: Full name
            birth_date: Date of birth
            start_year: Start year for timeline
            end_year: End year for timeline
            
        Returns:
            Timeline data with all cycles
        """
        if not start_year:
            start_year = date.today().year
        if not end_year:
            end_year = start_year + 9  # 9-year cycle
        
        # Calculate all cycles
        life_path = self.calculator.calculate_life_path_number(birth_date)
        pinnacles = self.calculator.calculate_pinnacles(birth_date)
        challenges = self.calculator.calculate_challenges(birth_date)
        essence_cycles = self.essence_calculator.calculate_essence_cycles(full_name, birth_date)
        
        # Generate yearly data
        yearly_cycles = []
        for year in range(start_year, end_year + 1):
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            
            # Determine which pinnacle is active
            active_pinnacle = self._get_active_pinnacle(birth_date, year)
            
            yearly_cycles.append({
                'year': year,
                'personal_year': personal_year,
                'pinnacle': active_pinnacle,
                'essence': self._get_year_essence(essence_cycles, birth_date, year)
            })
        
        return {
            'life_path': life_path,
            'pinnacles': pinnacles,
            'challenges': challenges,
            'essence_cycles': essence_cycles,
            'yearly_cycles': yearly_cycles,
            'timeline_range': {
                'start': start_year,
                'end': end_year
            }
        }
    
    def _get_active_pinnacle(self, birth_date: date, year: int) -> Dict[str, Any]:
        """Get active pinnacle for a given year."""
        age = year - birth_date.year
        pinnacles = self.calculator.calculate_pinnacles(birth_date)
        
        # Pinnacle periods (approximate)
        if age < 28:
            return {'number': pinnacles[0], 'period': 1, 'age_range': (0, 27)}
        elif age < 55:
            return {'number': pinnacles[1], 'period': 2, 'age_range': (28, 54)}
        elif age < 82:
            return {'number': pinnacles[2], 'period': 3, 'age_range': (55, 81)}
        else:
            return {'number': pinnacles[3], 'period': 4, 'age_range': (82, 120)}
    
    def _get_year_essence(
        self,
        essence_cycles: Dict,
        birth_date: date,
        year: int
    ) -> int:
        """Get essence number for a given year."""
        age = year - birth_date.year
        for period in essence_cycles['essence_periods']:
            age_range = period['age_range']
            if age_range[0] <= age <= age_range[1]:
                return period['essence_number']
        return essence_cycles['essence_periods'][-1]['essence_number']
    
    def calculate_cycle_compatibility(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any],
        target_year: int
    ) -> Dict[str, Any]:
        """
        Calculate cycle compatibility between two profiles for a year.
        
        Args:
            profile_1: First profile data (name, birth_date)
            profile_2: Second profile data (name, birth_date)
            target_year: Year to analyze
            
        Returns:
            Cycle compatibility analysis
        """
        py1 = self.calculator.calculate_personal_year_number(profile_1['birth_date'], target_year)
        py2 = self.calculator.calculate_personal_year_number(profile_2['birth_date'], target_year)
        
        pm1 = self.calculator.calculate_personal_month_number(
            profile_1['birth_date'],
            target_year,
            6  # Mid-year
        )
        pm2 = self.calculator.calculate_personal_month_number(
            profile_2['birth_date'],
            target_year,
            6
        )
        
        # Calculate alignment
        year_diff = abs(py1 - py2)
        month_diff = abs(pm1 - pm2)
        
        alignment_score = 100 - (year_diff * 15 + month_diff * 10)
        alignment_score = max(0, min(100, alignment_score))
        
        return {
            'year': target_year,
            'profile_1_cycles': {
                'personal_year': py1,
                'personal_month': pm1
            },
            'profile_2_cycles': {
                'personal_year': py2,
                'personal_month': pm2
            },
            'alignment_score': round(alignment_score),
            'alignment_level': self._get_alignment_level(alignment_score)
        }
    
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

