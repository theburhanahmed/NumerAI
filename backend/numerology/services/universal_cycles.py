"""
Universal cycles calculator for numerology.
"""
from typing import Dict, Any, List
from datetime import date
from numerology.numerology import NumerologyCalculator


class UniversalCycleCalculator:
    """Calculate universal year, month, and day cycles."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
    
    def calculate_universal_year(self, year: int) -> Dict[str, Any]:
        """
        Calculate universal year number.
        
        Args:
            year: Year to calculate
            
        Returns:
            Universal year data
        """
        year_sum = sum(int(d) for d in str(year))
        universal_year = self.calculator._reduce_to_single_digit(year_sum, preserve_master=True)
        
        return {
            'year': year,
            'universal_year_number': universal_year,
            'description': self._get_universal_year_description(universal_year),
            'themes': self._get_universal_year_themes(universal_year)
        }
    
    def calculate_universal_month(
        self,
        year: int,
        month: int
    ) -> Dict[str, Any]:
        """
        Calculate universal month number.
        
        Args:
            year: Year
            month: Month (1-12)
            
        Returns:
            Universal month data
        """
        universal_year = self.calculate_universal_year(year)
        month_sum = universal_year['universal_year_number'] + month
        universal_month = self.calculator._reduce_to_single_digit(month_sum, preserve_master=True)
        
        return {
            'year': year,
            'month': month,
            'universal_year_number': universal_year['universal_year_number'],
            'universal_month_number': universal_month,
            'description': self._get_universal_month_description(universal_month),
            'themes': self._get_universal_month_themes(universal_month)
        }
    
    def calculate_universal_day(
        self,
        year: int,
        month: int,
        day: int
    ) -> Dict[str, Any]:
        """
        Calculate universal day number.
        
        Args:
            year: Year
            month: Month
            day: Day
            
        Returns:
            Universal day data
        """
        universal_month = self.calculate_universal_month(year, month)
        day_sum = universal_month['universal_month_number'] + day
        universal_day = self.calculator._reduce_to_single_digit(day_sum, preserve_master=True)
        
        return {
            'date': date(year, month, day).isoformat(),
            'universal_year_number': universal_month['universal_year_number'],
            'universal_month_number': universal_month['universal_month_number'],
            'universal_day_number': universal_day,
            'description': self._get_universal_day_description(universal_day)
        }
    
    def _get_universal_year_description(self, number: int) -> str:
        """Get description for universal year number."""
        descriptions = {
            1: 'Year of new beginnings and leadership',
            2: 'Year of cooperation and partnerships',
            3: 'Year of creativity and expression',
            4: 'Year of stability and building foundations',
            5: 'Year of change and freedom',
            6: 'Year of responsibility and service',
            7: 'Year of introspection and spiritual growth',
            8: 'Year of material success and achievement',
            9: 'Year of completion and humanitarianism',
            11: 'Year of intuition and inspiration',
            22: 'Year of master building and vision',
            33: 'Year of master teaching and compassion'
        }
        return descriptions.get(number, 'Year of personal growth')
    
    def _get_universal_year_themes(self, number: int) -> List[str]:
        """Get themes for universal year."""
        themes = {
            1: ['New beginnings', 'Leadership', 'Independence', 'Initiative'],
            2: ['Cooperation', 'Partnerships', 'Diplomacy', 'Balance'],
            3: ['Creativity', 'Expression', 'Communication', 'Joy'],
            4: ['Stability', 'Structure', 'Hard work', 'Foundation building'],
            5: ['Change', 'Freedom', 'Adventure', 'Exploration'],
            6: ['Responsibility', 'Service', 'Family', 'Nurturing'],
            7: ['Spirituality', 'Analysis', 'Introspection', 'Wisdom'],
            8: ['Material success', 'Achievement', 'Power', 'Authority'],
            9: ['Completion', 'Humanitarianism', 'Service', 'Letting go'],
            11: ['Intuition', 'Inspiration', 'Enlightenment', 'Idealism'],
            22: ['Master building', 'Vision', 'Large-scale projects', 'Practical idealism'],
            33: ['Master teaching', 'Compassion', 'Healing', 'Universal love']
        }
        return themes.get(number, ['Growth', 'Development'])
    
    def _get_universal_month_description(self, number: int) -> str:
        """Get description for universal month."""
        descriptions = {
            1: 'Month of new starts',
            2: 'Month of cooperation',
            3: 'Month of creativity',
            4: 'Month of building',
            5: 'Month of change',
            6: 'Month of service',
            7: 'Month of reflection',
            8: 'Month of achievement',
            9: 'Month of completion'
        }
        return descriptions.get(number, 'Month of growth')
    
    def _get_universal_month_themes(self, number: int) -> List[str]:
        """Get themes for universal month."""
        return self._get_universal_year_themes(number)
    
    def _get_universal_day_description(self, number: int) -> str:
        """Get description for universal day."""
        return f"Day of {self._get_universal_year_description(number).lower()}"

