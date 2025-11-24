"""
Compatibility analysis engine for NumerAI.
Enhanced compatibility algorithms using multiple numerology factors.
"""
from datetime import date
from typing import Dict, List, Tuple, Union
from .numerology import NumerologyCalculator
from .interpretations import get_interpretation


class CompatibilityAnalyzer:
    """
    Enhanced compatibility analyzer using multiple numerology factors.
    """
    
    # Weight factors for different numerology numbers in compatibility calculation
    WEIGHTS = {
        'life_path': 0.3,
        'destiny': 0.2,
        'soul_urge': 0.2,
        'personality': 0.2,
        'attitude': 0.1
    }
    
    # Relationship type specific weights
    RELATIONSHIP_WEIGHTS = {
        'romantic': {
            'life_path': 0.25,
            'destiny': 0.15,
            'soul_urge': 0.25,
            'personality': 0.2,
            'attitude': 0.15
        },
        'business': {
            'life_path': 0.3,
            'destiny': 0.25,
            'soul_urge': 0.1,
            'personality': 0.25,
            'attitude': 0.1
        },
        'friendship': {
            'life_path': 0.2,
            'destiny': 0.2,
            'soul_urge': 0.3,
            'personality': 0.2,
            'attitude': 0.1
        },
        'family': {
            'life_path': 0.3,
            'destiny': 0.15,
            'soul_urge': 0.15,
            'personality': 0.2,
            'attitude': 0.2
        }
    }
    
    # Additional compatibility rules for more detailed analysis
    COMPATIBILITY_RULES: Dict[str, Dict[Tuple[int, int], Dict[str, Union[str, int]]]] = {
        # Life Path compatibility rules
        'life_path': {
            (1, 1): {'strength': 'Shared leadership and independence', 'score_bonus': 10},
            (1, 8): {'strength': 'Dynamic leadership combination', 'score_bonus': 8},
            (2, 7): {'strength': 'Perfect balance of intuition and analysis', 'score_bonus': 9},
            (3, 6): {'strength': 'Creative and nurturing connection', 'score_bonus': 8},
            (4, 8): {'strength': 'Practical and ambitious partnership', 'score_bonus': 7},
            (5, 3): {'strength': 'Adventurous and expressive duo', 'score_bonus': 8},
            (6, 9): {'strength': 'Nurturing and humanitarian bond', 'score_bonus': 9},
            (7, 11): {'strength': 'Deep spiritual and intuitive connection', 'score_bonus': 10},
            (9, 11): {'strength': 'Humanitarian and illuminating partnership', 'score_bonus': 9},
            (22, 4): {'strength': 'Master builder and foundation creator', 'score_bonus': 10},
            (33, 6): {'strength': 'Master teacher and nurturer', 'score_bonus': 10},
        },
        # Soul Urge compatibility rules
        'soul_urge': {
            (1, 2): {'strength': 'Balanced independence and cooperation', 'score_bonus': 7},
            (3, 5): {'strength': 'Creative and adventurous spirits', 'score_bonus': 8},
            (6, 9): {'strength': 'Nurturing and humanitarian connection', 'score_bonus': 9},
            (7, 11): {'strength': 'Intellectual and spiritual alignment', 'score_bonus': 10},
        },
        # Destiny compatibility rules
        'destiny': {
            (1, 8): {'strength': 'Ambitious and goal-oriented partnership', 'score_bonus': 8},
            (2, 6): {'strength': 'Harmonious and supportive connection', 'score_bonus': 9},
            (3, 5): {'strength': 'Expressive and freedom-loving duo', 'score_bonus': 8},
            (4, 8): {'strength': 'Structured and successful alliance', 'score_bonus': 7},
            (7, 11): {'strength': 'Intellectual and visionary combination', 'score_bonus': 10},
            (9, 11): {'strength': 'Humanitarian and illuminating partnership', 'score_bonus': 9},
        },
        # Personality compatibility rules
        'personality': {
            (1, 3): {'strength': 'Confident and expressive pairing', 'score_bonus': 8},
            (2, 6): {'strength': 'Diplomatic and nurturing connection', 'score_bonus': 9},
            (4, 8): {'strength': 'Stable and ambitious partnership', 'score_bonus': 8},
            (5, 3): {'strength': 'Adventurous and creative duo', 'score_bonus': 8},
            (7, 9): {'strength': 'Intellectual and compassionate bond', 'score_bonus': 8},
        }
    }
    
    # Compatibility modifiers based on number patterns
    COMPATIBILITY_MODIFIERS = {
        'same_master_numbers': 15,  # Both have same master number
        'complementary_elements': 5,  # Fire (1,4,7) + Water (2,5,8) + Air (3,6,9)
        'opposite_numbers': -3,  # Numbers that are opposite on numerology wheel
        'karmic_debt_present': -10,  # Karmic debt present in either person
        'karmic_debt_complementary': 8,  # One person's karmic debt complements the other
    }
    
    # Element associations for compatibility
    NUMBER_ELEMENTS = {
        1: 'fire', 2: 'water', 3: 'air',
        4: 'fire', 5: 'water', 6: 'air',
        7: 'fire', 8: 'water', 9: 'air'
    }
    
    def __init__(self, relationship_type: str = 'romantic'):
        """
        Initialize analyzer with relationship type.
        
        Args:
            relationship_type: Type of relationship (romantic, business, friendship, family)
        """
        self.relationship_type = relationship_type
        self.weights = self.RELATIONSHIP_WEIGHTS.get(relationship_type, self.WEIGHTS)
    
    def _calculate_factor_compatibility(self, user_num: int, partner_num: int) -> int:
        """
        Calculate compatibility for a single numerology factor.
        
        Args:
            user_num: User's number for this factor
            partner_num: Partner's number for this factor
            
        Returns:
            Compatibility score (0-100)
        """
        # If numbers are the same, perfect match
        if user_num == partner_num:
            return 100
        
        # Master numbers have special compatibility
        master_numbers = {11, 22, 33}
        if user_num in master_numbers or partner_num in master_numbers:
            # Master numbers are compatible with themselves and reduced forms
            user_reduced = user_num if user_num <= 9 else (user_num - 9)  # 11->2, 22->4, 33->6
            partner_reduced = partner_num if partner_num <= 9 else (partner_num - 9)
            
            if user_reduced == partner_reduced:
                return 90
            elif abs(user_reduced - partner_reduced) <= 2:
                return 75
            else:
                return 60
        
        # Regular numbers: closer numbers are more compatible
        diff = abs(user_num - partner_num)
        if diff == 0:
            return 100
        elif diff == 1:
            return 90
        elif diff == 2:
            return 80
        elif diff == 3:
            return 70
        elif diff == 4:
            return 60
        elif diff == 5:
            return 50
        else:  # diff >= 6
            return 40
    
    def _calculate_advanced_compatibility(self, user_numbers: Dict[str, int], 
                                        partner_numbers: Dict[str, int]) -> int:
        """
        Calculate advanced compatibility modifiers based on patterns and elements.
        
        Args:
            user_numbers: Dictionary of user's numerology numbers
            partner_numbers: Dictionary of partner's numerology numbers
            
        Returns:
            Compatibility modifier (-20 to +20)
        """
        modifier = 0
        
        # Check for same master numbers
        user_masters = {k: v for k, v in user_numbers.items() if v in {11, 22, 33}}
        partner_masters = {k: v for k, v in partner_numbers.items() if v in {11, 22, 33}}
        
        for key, user_master in user_masters.items():
            if key in partner_masters and user_master == partner_masters[key]:
                modifier += self.COMPATIBILITY_MODIFIERS['same_master_numbers']
        
        # Check for complementary elements (based on Life Path primarily)
        user_life_path = user_numbers.get('life_path_number', 1)
        partner_life_path = partner_numbers.get('life_path_number', 1)
        
        # Reduce master numbers for element calculation
        if user_life_path > 9:
            user_element_num = user_life_path - 9 if user_life_path in {11, 22, 33} else user_life_path % 9 or 9
        else:
            user_element_num = user_life_path
            
        if partner_life_path > 9:
            partner_element_num = partner_life_path - 9 if partner_life_path in {11, 22, 33} else partner_life_path % 9 or 9
        else:
            partner_element_num = partner_life_path
        
        user_element = self.NUMBER_ELEMENTS.get(user_element_num, 'fire')
        partner_element = self.NUMBER_ELEMENTS.get(partner_element_num, 'fire')
        
        # Fire (1,4,7) complements Water (2,5,8) complements Air (3,6,9)
        if (user_element == 'fire' and partner_element == 'water') or \
           (user_element == 'water' and partner_element == 'air') or \
           (user_element == 'air' and partner_element == 'fire'):
            modifier += self.COMPATIBILITY_MODIFIERS['complementary_elements']
        
        # Check for karmic debt
        user_karmic = user_numbers.get('karmic_debt_number')
        partner_karmic = partner_numbers.get('karmic_debt_number')
        
        if user_karmic or partner_karmic:
            modifier += self.COMPATIBILITY_MODIFIERS['karmic_debt_present']
            
            # Check if karmic debts are complementary
            if user_karmic and partner_karmic:
                # 13 complements 16, 14 complements 19
                complementary_pairs = {(13, 16), (16, 13), (14, 19), (19, 14)}
                if (user_karmic, partner_karmic) in complementary_pairs:
                    modifier += self.COMPATIBILITY_MODIFIERS['karmic_debt_complementary']
        
        return modifier
    
    def calculate_compatibility_score(self, user_numbers: Dict[str, int], 
                                    partner_numbers: Dict[str, int]) -> Tuple[int, List[str], List[str]]:
        """
        Calculate enhanced compatibility score using multiple numerology factors.
        
        Args:
            user_numbers: Dictionary of user's numerology numbers
            partner_numbers: Dictionary of partner's numerology numbers
            
        Returns:
            Tuple of (compatibility_score, strengths, challenges)
        """
        # Mapping from weight keys to numerology number keys
        factor_mapping = {
            'life_path': 'life_path_number',
            'destiny': 'destiny_number',
            'soul_urge': 'soul_urge_number',
            'personality': 'personality_number',
            'attitude': 'attitude_number'
        }
        
        total_score = 0
        max_possible_score = 0
        strengths = []
        challenges = []
        
        # Calculate compatibility for each numerology factor
        for factor, weight in self.weights.items():
            numerology_key = factor_mapping.get(factor, factor)
            if numerology_key in user_numbers and numerology_key in partner_numbers:
                user_num = user_numbers[numerology_key]
                partner_num = partner_numbers[numerology_key]
                
                # Base compatibility score (0-100)
                factor_score = self._calculate_factor_compatibility(user_num, partner_num)
                
                # Apply relationship-specific weight
                weighted_score = factor_score * weight
                total_score += weighted_score
                max_possible_score += 100 * weight
                
                # Check for special compatibility rules
                rule_key = (min(user_num, partner_num), max(user_num, partner_num))
                if factor in self.COMPATIBILITY_RULES and rule_key in self.COMPATIBILITY_RULES.get(factor, {}):
                    rule = self.COMPATIBILITY_RULES[factor][rule_key]
                    strengths.append(rule['strength'])
        
        # Apply advanced compatibility modifiers
        modifier = self._calculate_advanced_compatibility(user_numbers, partner_numbers)
        
        # Normalize score to 0-100 range
        if max_possible_score > 0:
            normalized_score = int((total_score / max_possible_score) * 100)
            # Apply modifier with bounds checking
            normalized_score = max(0, min(100, normalized_score + modifier))
        else:
            normalized_score = 50 + modifier  # Default score if no factors calculated
            normalized_score = max(0, min(100, normalized_score))
        
        # Add general strengths and challenges based on score
        if normalized_score >= 80:
            strengths.append("High overall compatibility")
        elif normalized_score >= 60:
            strengths.append("Moderate compatibility with good potential")
        elif normalized_score >= 40:
            challenges.append("Mixed compatibility requiring effort")
        else:
            challenges.append("Low compatibility, significant differences")
        
        return normalized_score, strengths, challenges
    
    def generate_compatibility_advice(self, user_numbers: Dict[str, int], 
                                    partner_numbers: Dict[str, int],
                                    score: int, 
                                    strengths: List[str], 
                                    challenges: List[str]) -> str:
        """
        Generate personalized compatibility advice.
        
        Args:
            user_numbers: Dictionary of user's numerology numbers
            partner_numbers: Dictionary of partner's numerology numbers
            score: Compatibility score
            strengths: List of identified strengths
            challenges: List of identified challenges
            
        Returns:
            Personalized advice string
        """
        # Start with general advice based on score
        if score >= 80:
            advice = "You have excellent compatibility with strong potential for a lasting relationship. "
        elif score >= 60:
            advice = "You have moderate compatibility with good potential, but will need to work on some differences. "
        elif score >= 40:
            advice = "Your compatibility is mixed and will require effort and understanding from both sides. "
        else:
            advice = "You have significant differences that may create challenges in this relationship. "
        
        # Add insights based on key numerology factors
        life_path_diff = abs(user_numbers.get('life_path_number', 0) - partner_numbers.get('life_path_number', 0))
        if life_path_diff == 0:
            advice += "You share the same life path, which means you likely have similar approaches to life. "
        elif life_path_diff <= 2:
            advice += "Your life paths are complementary, suggesting compatible life goals. "
        else:
            advice += "Your life paths are quite different, which may lead to different priorities and approaches. "
        
        # Add insights from interpretations
        try:
            user_life_path_interp = get_interpretation(user_numbers.get('life_path_number', 1))
            partner_life_path_interp = get_interpretation(partner_numbers.get('life_path_number', 1))
            
            # Find commonalities in strengths
            user_strengths = set(user_life_path_interp.get('strengths', []))
            partner_strengths = set(partner_life_path_interp.get('strengths', []))
            common_strengths = user_strengths.intersection(partner_strengths)
            
            if common_strengths:
                advice += f"You both share strengths like {', '.join(list(common_strengths)[:3])}. "
        except:
            pass  # Silently handle if interpretations are not available
        
        # Add general advice about communication
        advice += "Focus on open communication and understanding each other's perspectives. "
        
        # Add relationship-specific advice
        if self.relationship_type == 'romantic':
            advice += "In romantic relationships, emotional connection and shared values are particularly important."
        elif self.relationship_type == 'business':
            advice += "In business partnerships, clear roles and complementary skills will be key to success."
        elif self.relationship_type == 'friendship':
            advice += "In friendships, shared interests and mutual respect form the foundation of a lasting bond."
        elif self.relationship_type == 'family':
            advice += "In family relationships, patience and understanding of each other's roles is essential."
        
        return advice
    
    def analyze_compatibility(self, user_full_name: str, user_birth_date: date,
                            partner_full_name: str, partner_birth_date: date) -> Dict:
        """
        Perform complete compatibility analysis.
        
        Args:
            user_full_name: User's full name
            user_birth_date: User's birth date
            partner_full_name: Partner's full name
            partner_birth_date: Partner's birth date
            
        Returns:
            Dictionary with complete compatibility analysis
        """
        try:
            calculator = NumerologyCalculator()
            
            # Calculate numerology numbers for both people
            user_numbers = calculator.calculate_all(user_full_name, user_birth_date)
            partner_numbers = calculator.calculate_all(partner_full_name, partner_birth_date)
            
            # Calculate compatibility score
            score, strengths, challenges = self.calculate_compatibility_score(user_numbers, partner_numbers)
            
            # Generate advice
            advice = self.generate_compatibility_advice(user_numbers, partner_numbers, score, strengths, challenges)
            
            return {
                'compatibility_score': score,
                'strengths': strengths,
                'challenges': challenges,
                'advice': advice,
                'user_numbers': user_numbers,
                'partner_numbers': partner_numbers
            }
        except Exception as e:
            # Log the error for debugging
            import traceback
            error_details = traceback.format_exc()
            print(f"Compatibility analysis error: {str(e)}")
            print(f"Traceback: {error_details}")
            raise