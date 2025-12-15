"""
Essence cycles calculator for advanced numerology.
"""
from typing import Dict, List, Tuple, Any
from datetime import date
from numerology.numerology import NumerologyCalculator


class EssenceCycleCalculator:
    """Calculate essence cycles (rare but powerful numerology feature)."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
    
    def calculate_essence_cycles(
        self,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Calculate essence cycles based on name and birth date.
        
        Essence cycles represent the underlying energy patterns
        that influence different periods of life.
        
        Args:
            full_name: Full name
            birth_date: Date of birth
            
        Returns:
            Essence cycles data
        """
        # Calculate name number
        name_number = self.calculator._sum_name(full_name)
        name_essence = self.calculator._reduce_to_single_digit(name_number, preserve_master=True)
        
        # Calculate birth essence
        day_essence = self.calculator._reduce_to_single_digit(birth_date.day, preserve_master=False)
        month_essence = self.calculator._reduce_to_single_digit(birth_date.month, preserve_master=False)
        year_essence = self.calculator._reduce_to_single_digit(birth_date.year, preserve_master=False)
        
        # Calculate essence periods
        essence_periods = []
        
        # Period 1: Birth to age 27 (Name Essence)
        essence_periods.append({
            'period': 1,
            'age_range': (0, 27),
            'essence_number': name_essence,
            'description': 'Name essence period - establishing identity',
            'focus': self._get_essence_focus(name_essence)
        })
        
        # Period 2: Age 28-54 (Day + Month Essence)
        day_month_essence = self.calculator._reduce_to_single_digit(
            day_essence + month_essence,
            preserve_master=True
        )
        essence_periods.append({
            'period': 2,
            'age_range': (28, 54),
            'essence_number': day_month_essence,
            'description': 'Day-Month essence period - personal growth',
            'focus': self._get_essence_focus(day_month_essence)
        })
        
        # Period 3: Age 55+ (Year Essence)
        essence_periods.append({
            'period': 3,
            'age_range': (55, 120),
            'essence_number': year_essence,
            'description': 'Year essence period - wisdom and legacy',
            'focus': self._get_essence_focus(year_essence)
        })
        
        return {
            'essence_periods': essence_periods,
            'current_essence': self._get_current_essence(essence_periods, birth_date),
            'essence_transitions': self._calculate_transitions(essence_periods, birth_date)
        }
    
    def _get_essence_focus(self, essence_number: int) -> str:
        """Get focus area for essence number."""
        focuses = {
            1: 'Leadership and independence',
            2: 'Cooperation and harmony',
            3: 'Creativity and expression',
            4: 'Stability and structure',
            5: 'Freedom and adventure',
            6: 'Nurturing and service',
            7: 'Spirituality and analysis',
            8: 'Material success and power',
            9: 'Humanitarianism and completion',
            11: 'Intuition and inspiration',
            22: 'Master building and vision',
            33: 'Master teaching and compassion'
        }
        return focuses.get(essence_number, 'Personal development')
    
    def _get_current_essence(
        self,
        essence_periods: List[Dict],
        birth_date: date
    ) -> Dict[str, Any]:
        """Get current essence period based on age."""
        from datetime import date as date_class
        today = date_class.today()
        age = today.year - birth_date.year - (
            (today.month, today.day) < (birth_date.month, birth_date.day)
        )
        
        for period in essence_periods:
            age_range = period['age_range']
            if age_range[0] <= age <= age_range[1]:
                return {
                    'period': period['period'],
                    'essence_number': period['essence_number'],
                    'description': period['description'],
                    'focus': period['focus'],
                    'age': age,
                    'years_remaining': age_range[1] - age
                }
        
        # Default to last period
        return {
            'period': essence_periods[-1]['period'],
            'essence_number': essence_periods[-1]['essence_number'],
            'description': essence_periods[-1]['description'],
            'focus': essence_periods[-1]['focus'],
            'age': age,
            'years_remaining': None
        }
    
    def _calculate_transitions(
        self,
        essence_periods: List[Dict],
        birth_date: date
    ) -> List[Dict[str, Any]]:
        """Calculate essence transition dates."""
        transitions = []
        
        for i, period in enumerate(essence_periods):
            if i == 0:
                continue
            
            prev_period = essence_periods[i-1]
            transition_age = prev_period['age_range'][1] + 1
            
            transition_date = date(
                birth_date.year + transition_age,
                birth_date.month,
                birth_date.day
            )
            
            transitions.append({
                'date': transition_date.isoformat(),
                'age': transition_age,
                'from_period': prev_period['period'],
                'to_period': period['period'],
                'from_essence': prev_period['essence_number'],
                'to_essence': period['essence_number'],
                'description': f"Transition from {prev_period['description']} to {period['description']}"
            })
        
        return transitions

