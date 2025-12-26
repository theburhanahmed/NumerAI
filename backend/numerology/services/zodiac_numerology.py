"""
Zodiac-Numerology Integration Service.

Provides astrological insights based on numerology, including:
- Ruling planet based on birth date
- Zodiac sign numerology compatibility
- Planet-number associations
"""
from datetime import date
from typing import Dict, List, Any, Optional


class ZodiacNumerologyService:
    """
    Service for zodiac-numerology integration.
    
    Combines traditional zodiac astrology with numerology
    to provide deeper insights.
    """
    
    # Planet-Number associations (Chaldean tradition)
    PLANET_NUMBER_MAP = {
        1: {'planet': 'Sun', 'symbol': '☉', 'element': 'Fire', 
            'traits': ['Leadership', 'Individuality', 'Creativity', 'Vitality'],
            'day': 'Sunday', 'color': 'Gold', 'gemstone': 'Ruby'},
        2: {'planet': 'Moon', 'symbol': '☽', 'element': 'Water',
            'traits': ['Intuition', 'Emotion', 'Nurturing', 'Receptivity'],
            'day': 'Monday', 'color': 'Silver', 'gemstone': 'Pearl'},
        3: {'planet': 'Jupiter', 'symbol': '♃', 'element': 'Fire',
            'traits': ['Expansion', 'Wisdom', 'Optimism', 'Abundance'],
            'day': 'Thursday', 'color': 'Yellow', 'gemstone': 'Yellow Sapphire'},
        4: {'planet': 'Uranus', 'symbol': '♅', 'element': 'Air',
            'traits': ['Innovation', 'Rebellion', 'Originality', 'Change'],
            'day': 'Sunday', 'color': 'Electric Blue', 'gemstone': 'Hessonite'},
        5: {'planet': 'Mercury', 'symbol': '☿', 'element': 'Air',
            'traits': ['Communication', 'Intelligence', 'Adaptability', 'Travel'],
            'day': 'Wednesday', 'color': 'Green', 'gemstone': 'Emerald'},
        6: {'planet': 'Venus', 'symbol': '♀', 'element': 'Earth',
            'traits': ['Love', 'Beauty', 'Harmony', 'Pleasure'],
            'day': 'Friday', 'color': 'Pink', 'gemstone': 'Diamond'},
        7: {'planet': 'Neptune', 'symbol': '♆', 'element': 'Water',
            'traits': ['Spirituality', 'Mysticism', 'Intuition', 'Dreams'],
            'day': 'Monday', 'color': 'Violet', 'gemstone': 'Cat\'s Eye'},
        8: {'planet': 'Saturn', 'symbol': '♄', 'element': 'Earth',
            'traits': ['Discipline', 'Structure', 'Karma', 'Responsibility'],
            'day': 'Saturday', 'color': 'Black', 'gemstone': 'Blue Sapphire'},
        9: {'planet': 'Mars', 'symbol': '♂', 'element': 'Fire',
            'traits': ['Energy', 'Courage', 'Action', 'Passion'],
            'day': 'Tuesday', 'color': 'Red', 'gemstone': 'Red Coral'},
    }
    
    # Zodiac signs with date ranges and ruling numbers
    ZODIAC_SIGNS = {
        'aries': {
            'name': 'Aries',
            'symbol': '♈',
            'element': 'Fire',
            'ruling_planet': 'Mars',
            'ruling_number': 9,
            'compatible_numbers': [1, 3, 5, 9],
            'date_range': {'start': (3, 21), 'end': (4, 19)},
            'traits': ['Courageous', 'Energetic', 'Pioneering', 'Dynamic']
        },
        'taurus': {
            'name': 'Taurus',
            'symbol': '♉',
            'element': 'Earth',
            'ruling_planet': 'Venus',
            'ruling_number': 6,
            'compatible_numbers': [2, 4, 6, 8],
            'date_range': {'start': (4, 20), 'end': (5, 20)},
            'traits': ['Reliable', 'Patient', 'Practical', 'Devoted']
        },
        'gemini': {
            'name': 'Gemini',
            'symbol': '♊',
            'element': 'Air',
            'ruling_planet': 'Mercury',
            'ruling_number': 5,
            'compatible_numbers': [1, 3, 5, 7],
            'date_range': {'start': (5, 21), 'end': (6, 20)},
            'traits': ['Adaptable', 'Curious', 'Communicative', 'Witty']
        },
        'cancer': {
            'name': 'Cancer',
            'symbol': '♋',
            'element': 'Water',
            'ruling_planet': 'Moon',
            'ruling_number': 2,
            'compatible_numbers': [2, 4, 6, 7],
            'date_range': {'start': (6, 21), 'end': (7, 22)},
            'traits': ['Nurturing', 'Protective', 'Intuitive', 'Emotional']
        },
        'leo': {
            'name': 'Leo',
            'symbol': '♌',
            'element': 'Fire',
            'ruling_planet': 'Sun',
            'ruling_number': 1,
            'compatible_numbers': [1, 3, 5, 9],
            'date_range': {'start': (7, 23), 'end': (8, 22)},
            'traits': ['Creative', 'Generous', 'Warm-hearted', 'Cheerful']
        },
        'virgo': {
            'name': 'Virgo',
            'symbol': '♍',
            'element': 'Earth',
            'ruling_planet': 'Mercury',
            'ruling_number': 5,
            'compatible_numbers': [2, 4, 5, 6, 8],
            'date_range': {'start': (8, 23), 'end': (9, 22)},
            'traits': ['Analytical', 'Practical', 'Diligent', 'Modest']
        },
        'libra': {
            'name': 'Libra',
            'symbol': '♎',
            'element': 'Air',
            'ruling_planet': 'Venus',
            'ruling_number': 6,
            'compatible_numbers': [2, 3, 6, 9],
            'date_range': {'start': (9, 23), 'end': (10, 22)},
            'traits': ['Diplomatic', 'Fair', 'Social', 'Idealistic']
        },
        'scorpio': {
            'name': 'Scorpio',
            'symbol': '♏',
            'element': 'Water',
            'ruling_planet': 'Mars',
            'ruling_number': 9,
            'compatible_numbers': [2, 4, 7, 9],
            'date_range': {'start': (10, 23), 'end': (11, 21)},
            'traits': ['Passionate', 'Resourceful', 'Brave', 'Determined']
        },
        'sagittarius': {
            'name': 'Sagittarius',
            'symbol': '♐',
            'element': 'Fire',
            'ruling_planet': 'Jupiter',
            'ruling_number': 3,
            'compatible_numbers': [1, 3, 5, 9],
            'date_range': {'start': (11, 22), 'end': (12, 21)},
            'traits': ['Optimistic', 'Adventurous', 'Philosophical', 'Honest']
        },
        'capricorn': {
            'name': 'Capricorn',
            'symbol': '♑',
            'element': 'Earth',
            'ruling_planet': 'Saturn',
            'ruling_number': 8,
            'compatible_numbers': [2, 4, 6, 8],
            'date_range': {'start': (12, 22), 'end': (1, 19)},
            'traits': ['Disciplined', 'Responsible', 'Self-controlled', 'Ambitious']
        },
        'aquarius': {
            'name': 'Aquarius',
            'symbol': '♒',
            'element': 'Air',
            'ruling_planet': 'Uranus',
            'ruling_number': 4,
            'compatible_numbers': [1, 4, 5, 7],
            'date_range': {'start': (1, 20), 'end': (2, 18)},
            'traits': ['Progressive', 'Original', 'Independent', 'Humanitarian']
        },
        'pisces': {
            'name': 'Pisces',
            'symbol': '♓',
            'element': 'Water',
            'ruling_planet': 'Neptune',
            'ruling_number': 7,
            'compatible_numbers': [2, 3, 6, 7, 9],
            'date_range': {'start': (2, 19), 'end': (3, 20)},
            'traits': ['Compassionate', 'Artistic', 'Intuitive', 'Gentle']
        }
    }
    
    def __init__(self, system: str = 'chaldean'):
        """
        Initialize the zodiac numerology service.
        
        Args:
            system: Numerology system to use ('chaldean' or 'pythagorean')
        """
        self.system = system.lower()
    
    def get_zodiac_sign(self, birth_date: date) -> Dict[str, Any]:
        """
        Determine zodiac sign from birth date.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Dictionary with zodiac sign information
        """
        month = birth_date.month
        day = birth_date.day
        
        for sign_key, sign_data in self.ZODIAC_SIGNS.items():
            start = sign_data['date_range']['start']
            end = sign_data['date_range']['end']
            
            # Handle Capricorn which spans year boundary
            if sign_key == 'capricorn':
                if (month == 12 and day >= start[1]) or (month == 1 and day <= end[1]):
                    return {**sign_data, 'key': sign_key}
            else:
                if (month == start[0] and day >= start[1]) or (month == end[0] and day <= end[1]):
                    return {**sign_data, 'key': sign_key}
        
        # Default fallback (shouldn't happen with valid dates)
        return self.ZODIAC_SIGNS['aries']
    
    def get_ruling_planet(self, life_path_number: int) -> Dict[str, Any]:
        """
        Get ruling planet based on life path number.
        
        Args:
            life_path_number: The life path number (1-9, 11, 22, 33)
            
        Returns:
            Dictionary with planet information
        """
        # Reduce master numbers for planet lookup
        number = life_path_number
        if number > 9:
            number = sum(int(d) for d in str(number))
            while number > 9:
                number = sum(int(d) for d in str(number))
        
        planet_info = self.PLANET_NUMBER_MAP.get(number, self.PLANET_NUMBER_MAP[1])
        
        return {
            'number': life_path_number,
            'reduced_number': number,
            **planet_info
        }
    
    def get_birth_day_planet(self, birth_date: date) -> Dict[str, Any]:
        """
        Get ruling planet based on birth day number.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Dictionary with planet information for birth day
        """
        day = birth_date.day
        # Reduce to single digit
        while day > 9:
            day = sum(int(d) for d in str(day))
        
        planet_info = self.PLANET_NUMBER_MAP.get(day, self.PLANET_NUMBER_MAP[1])
        
        return {
            'birth_day': birth_date.day,
            'reduced_number': day,
            **planet_info
        }
    
    def calculate_zodiac_numerology_compatibility(
        self, 
        birth_date: date, 
        life_path_number: int
    ) -> Dict[str, Any]:
        """
        Calculate compatibility between zodiac sign and life path number.
        
        Args:
            birth_date: Date of birth
            life_path_number: Life path number
            
        Returns:
            Dictionary with compatibility analysis
        """
        zodiac = self.get_zodiac_sign(birth_date)
        
        # Reduce life path for comparison
        lp_reduced = life_path_number
        if lp_reduced > 9:
            lp_reduced = sum(int(d) for d in str(lp_reduced))
            while lp_reduced > 9:
                lp_reduced = sum(int(d) for d in str(lp_reduced))
        
        # Check if life path is compatible with zodiac
        is_compatible = lp_reduced in zodiac['compatible_numbers']
        
        # Check if life path matches zodiac ruling number
        is_aligned = lp_reduced == zodiac['ruling_number']
        
        # Calculate compatibility score
        if is_aligned:
            score = 100
            level = 'Perfect Alignment'
        elif is_compatible:
            score = 75
            level = 'Highly Compatible'
        elif abs(lp_reduced - zodiac['ruling_number']) <= 2:
            score = 50
            level = 'Moderately Compatible'
        else:
            score = 25
            level = 'Growth Opportunity'
        
        return {
            'zodiac_sign': zodiac['name'],
            'zodiac_symbol': zodiac['symbol'],
            'zodiac_element': zodiac['element'],
            'zodiac_ruling_number': zodiac['ruling_number'],
            'zodiac_ruling_planet': zodiac['ruling_planet'],
            'life_path_number': life_path_number,
            'life_path_reduced': lp_reduced,
            'is_compatible': is_compatible,
            'is_aligned': is_aligned,
            'compatibility_score': score,
            'compatibility_level': level,
            'analysis': self._get_compatibility_analysis(zodiac, lp_reduced, is_aligned, is_compatible)
        }
    
    def _get_compatibility_analysis(
        self, 
        zodiac: Dict[str, Any], 
        life_path: int, 
        is_aligned: bool, 
        is_compatible: bool
    ) -> str:
        """Generate compatibility analysis text."""
        if is_aligned:
            return f"Your Life Path {life_path} perfectly aligns with your {zodiac['name']} zodiac sign (ruling number {zodiac['ruling_number']}). This indicates a harmonious integration of your cosmic energies, enhancing your natural {', '.join(zodiac['traits'][:2]).lower()} tendencies."
        
        if is_compatible:
            return f"Your Life Path {life_path} is highly compatible with your {zodiac['name']} sign. While not identical to your zodiac's ruling number ({zodiac['ruling_number']}), this combination creates a complementary energy that supports your growth."
        
        return f"Your Life Path {life_path} presents interesting dynamics with your {zodiac['name']} sign (ruling number {zodiac['ruling_number']}). This combination invites you to integrate different energies, offering unique opportunities for personal growth and self-discovery."
    
    def get_full_zodiac_numerology_profile(
        self, 
        birth_date: date, 
        life_path_number: int,
        driver_number: Optional[int] = None,
        conductor_number: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive zodiac-numerology profile.
        
        Args:
            birth_date: Date of birth
            life_path_number: Life path number
            driver_number: Optional driver number (Chaldean)
            conductor_number: Optional conductor number (Chaldean)
            
        Returns:
            Complete zodiac-numerology profile
        """
        zodiac = self.get_zodiac_sign(birth_date)
        life_path_planet = self.get_ruling_planet(life_path_number)
        birth_day_planet = self.get_birth_day_planet(birth_date)
        compatibility = self.calculate_zodiac_numerology_compatibility(birth_date, life_path_number)
        
        profile = {
            'zodiac': {
                'sign': zodiac['name'],
                'symbol': zodiac['symbol'],
                'element': zodiac['element'],
                'ruling_planet': zodiac['ruling_planet'],
                'ruling_number': zodiac['ruling_number'],
                'traits': zodiac['traits'],
                'compatible_numbers': zodiac['compatible_numbers']
            },
            'planets': {
                'life_path_planet': life_path_planet,
                'birth_day_planet': birth_day_planet,
            },
            'compatibility': compatibility,
            'lucky_elements': {
                'day': life_path_planet['day'],
                'color': life_path_planet['color'],
                'gemstone': life_path_planet['gemstone'],
                'element': life_path_planet['element']
            }
        }
        
        # Add driver/conductor planet info if provided
        if driver_number is not None:
            profile['planets']['driver_planet'] = self.get_ruling_planet(driver_number)
        if conductor_number is not None:
            profile['planets']['conductor_planet'] = self.get_ruling_planet(conductor_number)
        
        return profile
    
    def get_planetary_periods(self, birth_date: date) -> List[Dict[str, Any]]:
        """
        Calculate planetary periods (Dasha) based on numerology.
        
        This is a simplified numerological interpretation of planetary periods.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            List of planetary period information
        """
        current_year = date.today().year
        birth_year = birth_date.year
        age = current_year - birth_year
        
        # 9-year cycle based on numerology
        cycle_position = age % 9
        if cycle_position == 0:
            cycle_position = 9
        
        periods = []
        for i in range(1, 10):
            period_planet = self.PLANET_NUMBER_MAP[i]
            is_current = (i == cycle_position)
            
            periods.append({
                'number': i,
                'planet': period_planet['planet'],
                'symbol': period_planet['symbol'],
                'is_current': is_current,
                'traits': period_planet['traits'],
                'element': period_planet['element']
            })
        
        return periods


# Convenience function for quick zodiac lookup
def get_zodiac_for_date(birth_date: date) -> Dict[str, Any]:
    """
    Quick helper to get zodiac sign for a date.
    
    Args:
        birth_date: Date of birth
        
    Returns:
        Zodiac sign information
    """
    service = ZodiacNumerologyService()
    return service.get_zodiac_sign(birth_date)

