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
        try:
            modifier = 0
            
            # Check for same master numbers (only for single integer values)
            master_numbers = {11, 22, 33}
            user_masters = {}
            partner_masters = {}
            
            # Only check integer values for master numbers
            for k, v in user_numbers.items():
                # Ensure we only check hashable types
                if isinstance(v, int) and v in master_numbers:
                    user_masters[k] = v
                    
            for k, v in partner_numbers.items():
                # Ensure we only check hashable types
                if isinstance(v, int) and v in master_numbers:
                    partner_masters[k] = v
            
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
            # Handle both single values and lists
            user_karmic = user_numbers.get('karmic_debt_number') or user_numbers.get('karmic_debt_numbers')
            partner_karmic = partner_numbers.get('karmic_debt_number') or partner_numbers.get('karmic_debt_numbers')
            
            # Normalize to lists for consistent handling
            if user_karmic and not isinstance(user_karmic, list):
                user_karmic = [user_karmic]
            if partner_karmic and not isinstance(partner_karmic, list):
                partner_karmic = [partner_karmic]
                
            if user_karmic or partner_karmic:
                modifier += self.COMPATIBILITY_MODIFIERS['karmic_debt_present']
                
                # Check if karmic debts are complementary
                if user_karmic and partner_karmic:
                    # 13 complements 16, 14 complements 19
                    complementary_pairs = {(13, 16), (16, 13), (14, 19), (19, 14)}
                    # Check all combinations
                    for user_debt in user_karmic:
                        for partner_debt in partner_karmic:
                            if (user_debt, partner_debt) in complementary_pairs:
                                modifier += self.COMPATIBILITY_MODIFIERS['karmic_debt_complementary']
                                break  # Only count once
            
            return modifier
        except Exception as e:
            # Log the error but don't let it break the compatibility calculation
            print(f"Error in _calculate_advanced_compatibility: {str(e)}")
            return 0
    
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
        try:
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
                    
                    # Skip if either value is not an integer
                    if not isinstance(user_num, int) or not isinstance(partner_num, int):
                        continue
                    
                    # Base compatibility score (0-100)
                    factor_score = self._calculate_factor_compatibility(user_num, partner_num)
                    
                    # Apply relationship-specific weight
                    weighted_score = factor_score * weight
                    total_score += weighted_score
                    max_possible_score += 100 * weight
                    
                    # Check for special compatibility rules
                    try:
                        rule_key = (min(user_num, partner_num), max(user_num, partner_num))
                        if factor in self.COMPATIBILITY_RULES and rule_key in self.COMPATIBILITY_RULES.get(factor, {}):
                            rule = self.COMPATIBILITY_RULES[factor][rule_key]
                            strengths.append(rule['strength'])
                    except Exception:
                        # Skip rule checking if there's an error
                        pass
            
            # Apply advanced compatibility modifiers
            try:
                modifier = self._calculate_advanced_compatibility(user_numbers, partner_numbers)
            except Exception as e:
                print(f"Error calculating advanced compatibility: {str(e)}")
                modifier = 0
            
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
        except Exception as e:
            print(f"Error in calculate_compatibility_score: {str(e)}")
            # Return a default score with minimal information
            return 50, ["Compatibility calculation completed with some limitations"], ["Some compatibility factors could not be calculated"]
    
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
    
    def detailed_compatibility_breakdown(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Provide detailed number-by-number compatibility breakdown.
        
        Args:
            user_numbers: User's numerology numbers
            partner_numbers: Partner's numerology numbers
            
        Returns:
            Detailed breakdown analysis
        """
        breakdown = {}
        
        # Analyze each number pair
        number_types = ['life_path_number', 'destiny_number', 'soul_urge_number', 
                       'personality_number', 'attitude_number', 'maturity_number']
        
        for num_type in number_types:
            user_num = user_numbers.get(num_type, 0)
            partner_num = partner_numbers.get(num_type, 0)
            
            if user_num and partner_num:
                compatibility = self._calculate_factor_compatibility(user_num, partner_num)
                breakdown[num_type] = {
                    'user_number': user_num,
                    'partner_number': partner_num,
                    'compatibility_score': compatibility,
                    'compatibility_level': 'excellent' if compatibility >= 80 else 'good' if compatibility >= 65 else 'moderate' if compatibility >= 50 else 'challenging',
                    'analysis': self._get_number_pair_analysis(num_type, user_num, partner_num),
                    'strengths': self._get_number_pair_strengths(user_num, partner_num),
                    'challenges': self._get_number_pair_challenges(user_num, partner_num)
                }
        
        return {
            'breakdown': breakdown,
            'overall_assessment': self._generate_overall_assessment(breakdown),
            'key_insights': self._extract_key_insights(breakdown)
        }
    
    def relationship_timeline_predictions(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int],
        relationship_start_date: date,
        years_ahead: int = 10
    ) -> Dict[str, Any]:
        """
        Predict relationship compatibility over time.
        
        Args:
            user_numbers: User's numerology numbers
            partner_numbers: Partner's numerology numbers
            relationship_start_date: When relationship started
            years_ahead: Years to predict ahead
            
        Returns:
            Timeline predictions
        """
        from datetime import timedelta
        
        calculator = NumerologyCalculator()
        user_birth_date = user_numbers.get('birth_date')
        partner_birth_date = partner_numbers.get('birth_date')
        
        if not user_birth_date or not partner_birth_date:
            return {'error': 'Birth dates required for timeline predictions'}
        
        timeline = []
        current_date = relationship_start_date
        
        for year_offset in range(years_ahead + 1):
            year = relationship_start_date.year + year_offset
            
            # Calculate personal years
            user_py = calculator.calculate_personal_year_number(user_birth_date, year)
            partner_py = calculator.calculate_personal_year_number(partner_birth_date, year)
            
            # Calculate compatibility for this year
            year_compatibility = self._calculate_year_compatibility(
                user_py, partner_py, user_numbers, partner_numbers
            )
            
            timeline.append({
                'year': year,
                'years_together': year_offset,
                'user_personal_year': user_py,
                'partner_personal_year': partner_py,
                'compatibility_score': year_compatibility['score'],
                'compatibility_level': year_compatibility['level'],
                'key_themes': year_compatibility['themes'],
                'predictions': year_compatibility['predictions']
            })
        
        return {
            'relationship_start_date': relationship_start_date.isoformat(),
            'timeline': timeline,
            'trend': self._calculate_timeline_trend(timeline),
            'critical_periods': [t for t in timeline if t['compatibility_score'] < 50],
            'peak_periods': [t for t in timeline if t['compatibility_score'] >= 80]
        }
    
    def conflict_resolution_guidance(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int],
        conflict_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Provide conflict resolution guidance based on numerology.
        
        Args:
            user_numbers: User's numerology numbers
            partner_numbers: Partner's numerology numbers
            conflict_type: Type of conflict (optional)
            
        Returns:
            Conflict resolution guidance
        """
        # Identify potential conflict areas
        conflict_areas = self._identify_conflict_areas(user_numbers, partner_numbers)
        
        # Get communication styles
        user_style = self._get_communication_style(user_numbers)
        partner_style = self._get_communication_style(partner_numbers)
        
        # Generate resolution strategies
        strategies = self._generate_resolution_strategies(
            user_numbers, partner_numbers, conflict_areas, user_style, partner_style
        )
        
        return {
            'conflict_areas': conflict_areas,
            'user_communication_style': user_style,
            'partner_communication_style': partner_style,
            'resolution_strategies': strategies,
            'prevention_tips': self._get_conflict_prevention_tips(user_numbers, partner_numbers)
        }
    
    def communication_style_analysis(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Analyze communication styles based on numerology.
        
        Args:
            user_numbers: User's numerology numbers
            partner_numbers: Partner's numerology numbers
            
        Returns:
            Communication style analysis
        """
        user_style = self._get_communication_style(user_numbers)
        partner_style = self._get_communication_style(partner_numbers)
        
        # Calculate communication compatibility
        compatibility = self._calculate_communication_compatibility(user_style, partner_style)
        
        return {
            'user_style': user_style,
            'partner_style': partner_style,
            'compatibility': compatibility,
            'communication_tips': self._get_communication_tips(user_style, partner_style),
            'potential_challenges': self._identify_communication_challenges(user_style, partner_style)
        }
    
    def _get_number_pair_analysis(
        self,
        num_type: str,
        user_num: int,
        partner_num: int
    ) -> str:
        """Get analysis for a number pair."""
        diff = abs(user_num - partner_num)
        
        if diff == 0:
            return f'Both have {num_type.replace("_", " ")} {user_num} - shared energy and understanding'
        elif diff <= 2:
            return f'Numbers {user_num} and {partner_num} are complementary - good harmony'
        elif diff <= 4:
            return f'Numbers {user_num} and {partner_num} have moderate alignment'
        else:
            return f'Numbers {user_num} and {partner_num} differ significantly - may require understanding'
    
    def _get_number_pair_strengths(self, user_num: int, partner_num: int) -> List[str]:
        """Get strengths for a number pair."""
        strengths = []
        
        if user_num == partner_num:
            strengths.append('Shared energy creates strong connection')
        elif abs(user_num - partner_num) == 1:
            strengths.append('Complementary energies enhance each other')
        elif user_num + partner_num in [10, 11, 22]:
            strengths.append('Numbers combine to create powerful synergy')
        
        return strengths
    
    def _get_number_pair_challenges(self, user_num: int, partner_num: int) -> List[str]:
        """Get challenges for a number pair."""
        challenges = []
        
        if abs(user_num - partner_num) > 6:
            challenges.append('Significant differences may require compromise')
        
        # Specific challenging combinations
        challenging_pairs = [(1, 1), (5, 5), (7, 7)]
        if (user_num, partner_num) in challenging_pairs or (partner_num, user_num) in challenging_pairs:
            challenges.append('Both share same energy - may need balance')
        
        return challenges
    
    def _generate_overall_assessment(self, breakdown: Dict[str, Any]) -> Dict[str, Any]:
        """Generate overall assessment from breakdown."""
        scores = [b['compatibility_score'] for b in breakdown.values()]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        excellent = sum(1 for s in scores if s >= 80)
        good = sum(1 for s in scores if 65 <= s < 80)
        moderate = sum(1 for s in scores if 50 <= s < 65)
        challenging = sum(1 for s in scores if s < 50)
        
        return {
            'average_score': round(avg_score),
            'score_distribution': {
                'excellent': excellent,
                'good': good,
                'moderate': moderate,
                'challenging': challenging
            },
            'strongest_area': max(breakdown.items(), key=lambda x: x[1]['compatibility_score'])[0] if breakdown else None,
            'weakest_area': min(breakdown.items(), key=lambda x: x[1]['compatibility_score'])[0] if breakdown else None
        }
    
    def _extract_key_insights(self, breakdown: Dict[str, Any]) -> List[str]:
        """Extract key insights from breakdown."""
        insights = []
        
        for num_type, data in breakdown.items():
            if data['compatibility_score'] >= 80:
                insights.append(f'Strong {num_type.replace("_", " ")} compatibility')
            elif data['compatibility_score'] < 50:
                insights.append(f'{num_type.replace("_", " ")} may require attention')
        
        return insights
    
    def _calculate_year_compatibility(
        self,
        user_py: int,
        partner_py: int,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int]
    ) -> Dict[str, Any]:
        """Calculate compatibility for a specific year."""
        # Base compatibility from personal years
        py_compatibility = self._calculate_factor_compatibility(user_py, partner_py)
        
        # Adjust based on base numbers
        base_score = self.calculate_compatibility_score(user_numbers, partner_numbers)[0]
        
        # Combine scores
        year_score = (py_compatibility * 0.6 + base_score * 0.4)
        
        return {
            'score': round(year_score),
            'level': 'excellent' if year_score >= 80 else 'good' if year_score >= 65 else 'moderate' if year_score >= 50 else 'challenging',
            'themes': self._get_year_themes(user_py, partner_py),
            'predictions': self._get_year_predictions(user_py, partner_py, year_score)
        }
    
    def _get_year_themes(self, user_py: int, partner_py: int) -> List[str]:
        """Get themes for a year based on personal years."""
        themes = []
        
        if user_py == partner_py:
            themes.append('Synchronized personal years - strong alignment')
        elif abs(user_py - partner_py) <= 2:
            themes.append('Harmonious personal year cycles')
        else:
            themes.append('Different personal year cycles - may require understanding')
        
        return themes
    
    def _get_year_predictions(
        self,
        user_py: int,
        partner_py: int,
        score: float
    ) -> List[str]:
        """Get predictions for a year."""
        predictions = []
        
        if score >= 80:
            predictions.append('Excellent year for relationship growth')
            predictions.append('Strong support for joint goals')
        elif score >= 65:
            predictions.append('Good year for relationship development')
        elif score >= 50:
            predictions.append('Moderate year - focus on communication')
        else:
            predictions.append('Challenging year - extra effort needed')
            predictions.append('Consider relationship counseling or support')
        
        return predictions
    
    def _calculate_timeline_trend(self, timeline: List[Dict[str, Any]]) -> str:
        """Calculate overall trend from timeline."""
        if len(timeline) < 2:
            return 'stable'
        
        first_half = sum(t['compatibility_score'] for t in timeline[:len(timeline)//2]) / (len(timeline)//2)
        second_half = sum(t['compatibility_score'] for t in timeline[len(timeline)//2:]) / (len(timeline) - len(timeline)//2)
        
        if second_half > first_half + 5:
            return 'improving'
        elif second_half < first_half - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _identify_conflict_areas(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """Identify potential conflict areas."""
        conflict_areas = []
        
        number_types = ['life_path_number', 'destiny_number', 'soul_urge_number', 'personality_number']
        
        for num_type in number_types:
            user_num = user_numbers.get(num_type, 0)
            partner_num = partner_numbers.get(num_type, 0)
            
            if user_num and partner_num:
                diff = abs(user_num - partner_num)
                if diff > 6:  # Significant difference
                    conflict_areas.append({
                        'area': num_type.replace('_', ' '),
                        'user_number': user_num,
                        'partner_number': partner_num,
                        'difference': diff,
                        'severity': 'high' if diff > 7 else 'moderate'
                    })
        
        return conflict_areas
    
    def _get_communication_style(self, numbers: Dict[str, int]) -> Dict[str, Any]:
        """Get communication style based on numerology."""
        personality = numbers.get('personality_number', 1)
        soul_urge = numbers.get('soul_urge_number', 1)
        
        styles = {
            1: {'style': 'direct', 'approach': 'assertive', 'preference': 'clear and concise'},
            2: {'style': 'diplomatic', 'approach': 'cooperative', 'preference': 'harmonious discussion'},
            3: {'style': 'expressive', 'approach': 'creative', 'preference': 'enthusiastic sharing'},
            4: {'style': 'practical', 'approach': 'structured', 'preference': 'organized communication'},
            5: {'style': 'dynamic', 'approach': 'flexible', 'preference': 'varied and exciting'},
            6: {'style': 'nurturing', 'approach': 'caring', 'preference': 'supportive dialogue'},
            7: {'style': 'analytical', 'approach': 'thoughtful', 'preference': 'deep meaningful talks'},
            8: {'style': 'authoritative', 'approach': 'decisive', 'preference': 'goal-oriented discussion'},
            9: {'style': 'compassionate', 'approach': 'understanding', 'preference': 'empathetic communication'}
        }
        
        # Combine personality and soul urge
        primary_style = styles.get(personality, styles[1])
        secondary_style = styles.get(soul_urge, styles[1])
        
        return {
            'primary_style': primary_style,
            'secondary_influence': secondary_style,
            'overall_approach': self._combine_communication_styles(primary_style, secondary_style)
        }
    
    def _combine_communication_styles(
        self,
        primary: Dict[str, Any],
        secondary: Dict[str, Any]
    ) -> str:
        """Combine primary and secondary communication styles."""
        if primary['style'] == secondary['style']:
            return f"Strong {primary['style']} communicator"
        else:
            return f"{primary['style']} with {secondary['style']} influences"
    
    def _generate_resolution_strategies(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int],
        conflict_areas: List[Dict[str, Any]],
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate conflict resolution strategies."""
        strategies = []
        
        for conflict in conflict_areas:
            strategies.append({
                'conflict_area': conflict['area'],
                'strategy': self._get_area_specific_strategy(conflict, user_style, partner_style),
                'communication_approach': self._get_conflict_communication_approach(user_style, partner_style)
            })
        
        return strategies
    
    def _get_area_specific_strategy(
        self,
        conflict: Dict[str, Any],
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> str:
        """Get strategy for specific conflict area."""
        area = conflict['area']
        
        if 'life path' in area.lower():
            return 'Focus on understanding each other\'s life paths and finding common ground'
        elif 'soul urge' in area.lower():
            return 'Acknowledge each other\'s inner desires and find ways to support them'
        elif 'personality' in area.lower():
            return 'Respect different personality expressions and communication styles'
        else:
            return 'Open dialogue and mutual understanding are key'
    
    def _get_conflict_communication_approach(
        self,
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> str:
        """Get communication approach for conflicts."""
        user_primary = user_style['primary_style']['style']
        partner_primary = partner_style['primary_style']['style']
        
        if user_primary == 'direct' and partner_primary == 'diplomatic':
            return 'User should be mindful of tone, partner should express needs directly'
        elif user_primary == 'analytical' and partner_primary == 'expressive':
            return 'Balance logical discussion with emotional expression'
        else:
            return 'Use each other\'s communication strengths to resolve conflicts'
    
    def _get_conflict_prevention_tips(
        self,
        user_numbers: Dict[str, int],
        partner_numbers: Dict[str, int]
    ) -> List[str]:
        """Get tips for preventing conflicts."""
        tips = []
        
        tips.append('Regular communication about needs and expectations')
        tips.append('Respect each other\'s numerology-based tendencies')
        tips.append('Find activities that align with both numerologies')
        tips.append('Use numerology insights to understand differences')
        
        return tips
    
    def _calculate_communication_compatibility(
        self,
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate communication compatibility."""
        user_primary = user_style['primary_style']['style']
        partner_primary = partner_style['primary_style']['style']
        
        # Compatible style pairs
        compatible_pairs = [
            ('direct', 'diplomatic'),
            ('expressive', 'nurturing'),
            ('analytical', 'compassionate'),
            ('practical', 'authoritative')
        ]
        
        is_compatible = (user_primary, partner_primary) in compatible_pairs or \
                       (partner_primary, user_primary) in compatible_pairs
        
        score = 70 if is_compatible else 50
        
        return {
            'score': score,
            'level': 'good' if score >= 65 else 'moderate',
            'compatibility': 'compatible' if is_compatible else 'different but workable'
        }
    
    def _get_communication_tips(
        self,
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> List[str]:
        """Get communication tips based on styles."""
        tips = []
        
        user_primary = user_style['primary_style']['style']
        partner_primary = partner_style['primary_style']['style']
        
        if user_primary == 'direct' and partner_primary == 'diplomatic':
            tips.append('User: soften directness, Partner: be more direct when needed')
        elif user_primary == 'analytical' and partner_primary == 'expressive':
            tips.append('Balance logic with emotion in discussions')
        else:
            tips.append('Adapt communication to each other\'s style')
        
        return tips
    
    def _identify_communication_challenges(
        self,
        user_style: Dict[str, Any],
        partner_style: Dict[str, Any]
    ) -> List[str]:
        """Identify potential communication challenges."""
        challenges = []
        
        user_primary = user_style['primary_style']['style']
        partner_primary = partner_style['primary_style']['style']
        
        if user_primary == 'direct' and partner_primary == 'sensitive':
            challenges.append('Direct communication may be too harsh for partner')
        elif user_primary == 'analytical' and partner_primary == 'emotional':
            challenges.append('Logic vs emotion may create misunderstandings')
        
        return challenges