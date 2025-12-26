"""
Feng Shui × Numerology hybrid analysis service.
"""
from typing import Dict, List, Optional, Any
from numerology.models import NumerologyProfile, FengShuiAnalysis, SpaceOptimization
from numerology.numerology import NumerologyCalculator
from accounts.models import User


class FengShuiHybridService:
    """Service for combining Feng Shui and Numerology analysis."""
    
    # Feng Shui direction mappings
    DIRECTION_NUMBERS = {
        'north': 1,
        'northeast': 8,
        'east': 3,
        'southeast': 4,
        'south': 9,
        'southwest': 2,
        'west': 7,
        'northwest': 6,
        'center': 5
    }
    
    # Color to number mappings
    COLOR_NUMBERS = {
        'red': 1, 'orange': 2, 'yellow': 3, 'green': 4, 'blue': 5,
        'indigo': 6, 'violet': 7, 'pink': 8, 'white': 9, 'black': 0,
        'gold': 8, 'silver': 7, 'brown': 4, 'gray': 5
    }
    
    # Element to number mappings
    ELEMENT_NUMBERS = {
        'water': 1,
        'earth': 2,
        'wood': 3,
        'wood': 4,
        'fire': 9,
        'metal': 6,
        'metal': 7
    }
    
    def __init__(self, system: str = 'pythagorean'):
        """
        Initialize analyzer with numerology system.
        
        Args:
            system: 'pythagorean', 'chaldean', or 'vedic'
        """
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
    
    def analyze_house_vibration(
        self,
        house_number: str,
        owner_profile: Optional[NumerologyProfile] = None
    ) -> Dict[str, Any]:
        """
        Calculate house numerology vibration.
        
        Args:
            house_number: House/flat number (e.g., "123", "45A")
            owner_profile: Optional owner's numerology profile for compatibility
            
        Returns:
            Dictionary with vibration analysis
        """
        # Extract digits from house number
        digits = ''.join(c for c in house_number if c.isdigit())
        
        if not digits:
            raise ValueError("House number must contain at least one digit")
        
        # Calculate vibration number
        total = sum(int(d) for d in digits)
        vibration_number = self.calculator._reduce_to_single_digit(total, preserve_master=True)
        
        # Interpret vibration
        interpretation = self._interpret_house_vibration(vibration_number)
        
        # Calculate compatibility with owner if provided
        compatibility = None
        if owner_profile:
            compatibility = self._calculate_house_owner_compatibility(
                vibration_number,
                owner_profile.life_path_number
            )
        
        return {
            'house_number': house_number,
            'vibration_number': vibration_number,
            'interpretation': interpretation,
            'compatibility_with_owner': compatibility,
            'raw_digits': digits
        }
    
    def combine_feng_shui_numerology(
        self,
        house_data: Dict[str, Any],
        numerology_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Combine Feng Shui and Numerology analysis.
        
        Args:
            house_data: Feng Shui analysis data
            numerology_data: Numerology analysis data
            
        Returns:
            Dictionary with hybrid analysis
        """
        house_vibration = house_data.get('vibration_number', 0)
        owner_life_path = numerology_data.get('life_path_number', 0)
        
        # Calculate hybrid score
        hybrid_score = self._calculate_hybrid_score(house_vibration, owner_life_path)
        
        # Analyze energy flow
        energy_flow = self._analyze_energy_flow(house_data, numerology_data)
        
        # Generate recommendations
        recommendations = self._generate_hybrid_recommendations(
            house_data,
            numerology_data,
            hybrid_score
        )
        
        return {
            'hybrid_score': hybrid_score,
            'energy_flow': energy_flow,
            'recommendations': recommendations,
            'house_vibration': house_vibration,
            'owner_life_path': owner_life_path,
            'compatibility': self._calculate_compatibility(house_vibration, owner_life_path)
        }
    
    def optimize_space_layout(
        self,
        room_data: Dict[str, Any],
        numerology_profile: NumerologyProfile
    ) -> Dict[str, Any]:
        """
        Optimize space layout based on numerology.
        
        Args:
            room_data: Room information (name, number, direction, etc.)
            numerology_profile: Owner's numerology profile
            
        Returns:
            Dictionary with optimization recommendations
        """
        room_name = room_data.get('room_name', '')
        room_number = room_data.get('room_number', '')
        direction = room_data.get('direction', '')
        
        # Calculate room vibration
        room_vibration = None
        if room_number:
            digits = ''.join(c for c in room_number if c.isdigit())
            if digits:
                total = sum(int(d) for d in digits)
                room_vibration = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        # Get favorable colors
        color_recommendations = self.recommend_colors_and_numbers(
            room_data,
            numerology_profile
        )
        
        # Get favorable directions
        direction_compatibility = None
        if direction:
            direction_compatibility = self.check_direction_compatibility(
                direction,
                numerology_profile
            )
        
        # Calculate energy flow score
        energy_flow_score = self._calculate_room_energy_flow(
            room_vibration,
            numerology_profile.life_path_number,
            direction
        )
        
        # Layout suggestions
        layout_suggestions = self._generate_layout_suggestions(
            room_vibration,
            numerology_profile,
            direction
        )
        
        return {
            'room_name': room_name,
            'room_number': room_number,
            'room_vibration': room_vibration,
            'color_recommendations': color_recommendations.get('colors', []),
            'number_combinations': color_recommendations.get('numbers', []),
            'direction_compatibility': direction_compatibility,
            'energy_flow_score': energy_flow_score,
            'layout_suggestions': layout_suggestions
        }
    
    def analyze_energy_flow(
        self,
        property_layout: Dict[str, Any],
        numerology: NumerologyProfile
    ) -> Dict[str, Any]:
        """
        Analyze energy flow in property based on numerology.
        
        Args:
            property_layout: Property layout information
            numerology: Numerology profile
            
        Returns:
            Dictionary with energy flow analysis
        """
        rooms = property_layout.get('rooms', [])
        main_entrance = property_layout.get('main_entrance', {})
        
        energy_analysis = {
            'overall_flow': 'neutral',
            'strength_score': 50,
            'room_analyses': [],
            'blockages': [],
            'enhancements': []
        }
        
        # Analyze each room
        for room in rooms:
            room_analysis = self._analyze_room_energy(room, numerology)
            energy_analysis['room_analyses'].append(room_analysis)
        
        # Analyze main entrance
        if main_entrance:
            entrance_analysis = self._analyze_entrance_energy(main_entrance, numerology)
            energy_analysis['entrance'] = entrance_analysis
        
        # Calculate overall flow
        if energy_analysis['room_analyses']:
            avg_score = sum(
                r.get('energy_score', 50) for r in energy_analysis['room_analyses']
            ) / len(energy_analysis['room_analyses'])
            energy_analysis['strength_score'] = int(avg_score)
            
            if avg_score >= 75:
                energy_analysis['overall_flow'] = 'excellent'
            elif avg_score >= 60:
                energy_analysis['overall_flow'] = 'good'
            elif avg_score >= 40:
                energy_analysis['overall_flow'] = 'moderate'
            else:
                energy_analysis['overall_flow'] = 'needs_improvement'
        
        return energy_analysis
    
    def recommend_colors_and_numbers(
        self,
        room: Dict[str, Any],
        numerology: NumerologyProfile
    ) -> Dict[str, Any]:
        """
        Recommend colors and number combinations for a room.
        
        Args:
            room: Room information
            numerology: Numerology profile
            
        Returns:
            Dictionary with color and number recommendations
        """
        life_path = numerology.life_path_number
        destiny = numerology.destiny_number
        
        # Favorable numbers for this person
        favorable_numbers = self._get_favorable_numbers(life_path, destiny)
        
        # Colors corresponding to favorable numbers
        recommended_colors = []
        for num in favorable_numbers:
            color = self._number_to_color(num)
            if color:
                recommended_colors.append({
                    'color': color,
                    'number': num,
                    'reason': f'Supports your {self._number_meaning(num)} energy'
                })
        
        # Number combinations for room
        number_combinations = self._generate_number_combinations(favorable_numbers)
        
        return {
            'colors': recommended_colors,
            'numbers': number_combinations,
            'primary_color': recommended_colors[0]['color'] if recommended_colors else None,
            'accent_colors': [c['color'] for c in recommended_colors[1:3]]
        }
    
    def check_direction_compatibility(
        self,
        direction: str,
        numerology: NumerologyProfile
    ) -> Dict[str, Any]:
        """
        Check compatibility of direction with numerology.
        
        Args:
            direction: Compass direction
            numerology: Numerology profile
            
        Returns:
            Dictionary with compatibility analysis
        """
        direction_lower = direction.lower()
        direction_number = self.DIRECTION_NUMBERS.get(direction_lower, 0)
        
        if direction_number == 0:
            return {
                'compatible': False,
                'score': 0,
                'message': f'Unknown direction: {direction}'
            }
        
        life_path = numerology.life_path_number
        life_path_reduced = self.calculator._reduce_to_single_digit(life_path, preserve_master=False)
        
        # Calculate compatibility
        compatibility_score = self._calculate_direction_compatibility(
            direction_number,
            life_path_reduced
        )
        
        return {
            'direction': direction,
            'direction_number': direction_number,
            'compatible': compatibility_score >= 60,
            'score': compatibility_score,
            'message': self._get_direction_message(direction_number, life_path_reduced)
        }
    
    def _interpret_house_vibration(self, vibration_number: int) -> Dict[str, Any]:
        """Interpret house vibration number."""
        interpretations = {
            1: {
                'energy': 'Leadership and Independence',
                'suitable_for': 'Entrepreneurs, leaders, independent workers',
                'atmosphere': 'Dynamic, active, pioneering',
                'challenges': 'May be too intense for some, potential conflicts'
            },
            2: {
                'energy': 'Harmony and Cooperation',
                'suitable_for': 'Families, partnerships, collaborative work',
                'atmosphere': 'Peaceful, harmonious, diplomatic',
                'challenges': 'May lack drive, potential indecisiveness'
            },
            3: {
                'energy': 'Creativity and Expression',
                'suitable_for': 'Artists, writers, communicators',
                'atmosphere': 'Joyful, creative, expressive',
                'challenges': 'May be scattered, lack focus'
            },
            4: {
                'energy': 'Stability and Structure',
                'suitable_for': 'Families seeking stability, organized work',
                'atmosphere': 'Stable, reliable, practical',
                'challenges': 'May be too rigid, resistant to change'
            },
            5: {
                'energy': 'Freedom and Change',
                'suitable_for': 'Adventurous individuals, dynamic work',
                'atmosphere': 'Active, changeable, free-flowing',
                'challenges': 'May lack stability, too restless'
            },
            6: {
                'energy': 'Nurturing and Responsibility',
                'suitable_for': 'Families, caregivers, service-oriented work',
                'atmosphere': 'Caring, nurturing, responsible',
                'challenges': 'May be over-responsible, interfering'
            },
            7: {
                'energy': 'Spirituality and Analysis',
                'suitable_for': 'Spiritual seekers, researchers, analysts',
                'atmosphere': 'Quiet, introspective, analytical',
                'challenges': 'May be too isolated, over-analytical'
            },
            8: {
                'energy': 'Material Success and Power',
                'suitable_for': 'Business professionals, ambitious individuals',
                'atmosphere': 'Powerful, successful, material-focused',
                'challenges': 'May be too materialistic, power struggles'
            },
            9: {
                'energy': 'Humanitarianism and Completion',
                'suitable_for': 'Humanitarians, teachers, healers',
                'atmosphere': 'Compassionate, giving, completion-oriented',
                'challenges': 'May be over-giving, burnout risk'
            }
        }
        
        return interpretations.get(vibration_number, {
            'energy': 'Unknown',
            'suitable_for': 'Requires further analysis',
            'atmosphere': 'Neutral',
            'challenges': 'Unknown'
        })
    
    def _calculate_house_owner_compatibility(
        self,
        house_vibration: int,
        owner_life_path: int
    ) -> Dict[str, Any]:
        """Calculate compatibility between house and owner."""
        house_num = self.calculator._reduce_to_single_digit(house_vibration, preserve_master=False)
        owner_num = self.calculator._reduce_to_single_digit(owner_life_path, preserve_master=False)
        
        # Compatibility calculation
        compatibility_score = self._calculate_compatibility(house_vibration, owner_life_path)
        
        return {
            'score': compatibility_score,
            'compatible': compatibility_score >= 70,
            'message': self._get_compatibility_message(house_num, owner_num, compatibility_score)
        }
    
    def _calculate_hybrid_score(
        self,
        house_vibration: int,
        owner_life_path: int
    ) -> int:
        """Calculate overall hybrid compatibility score."""
        compatibility = self._calculate_compatibility(house_vibration, owner_life_path)
        
        # Adjust based on master numbers
        if house_vibration in [11, 22, 33] or owner_life_path in [11, 22, 33]:
            compatibility += 5
        
        return min(100, max(0, compatibility))
    
    def _analyze_energy_flow(
        self,
        house_data: Dict[str, Any],
        numerology_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze energy flow in the property."""
        return {
            'strength': 'moderate',
            'score': 60,
            'recommendations': ['Ensure proper ventilation', 'Balance yin and yang energies']
        }
    
    def _generate_hybrid_recommendations(
        self,
        house_data: Dict[str, Any],
        numerology_data: Dict[str, Any],
        hybrid_score: int
    ) -> List[Dict[str, Any]]:
        """Generate recommendations for improving hybrid compatibility."""
        recommendations = []
        
        if hybrid_score < 60:
            recommendations.append({
                'type': 'improvement',
                'priority': 'high',
                'title': 'Enhance Compatibility',
                'description': 'Consider adding elements that bridge the gap between house and owner energies',
                'actions': [
                    'Add colors that complement both vibrations',
                    'Place objects with favorable numbers',
                    'Adjust room layouts for better energy flow'
                ]
            })
        
        if hybrid_score >= 70:
            recommendations.append({
                'type': 'maintenance',
                'priority': 'medium',
                'title': 'Maintain Harmony',
                'description': 'Your house and personal energy are well-aligned',
                'actions': [
                    'Keep the space clean and organized',
                    'Maintain current color schemes',
                    'Continue practices that support your numerology'
                ]
            })
        
        return recommendations
    
    def _calculate_room_energy_flow(
        self,
        room_vibration: Optional[int],
        owner_life_path: int,
        direction: Optional[str]
    ) -> int:
        """Calculate energy flow score for a room."""
        base_score = 50
        
        if room_vibration:
            compatibility = self._calculate_compatibility(room_vibration, owner_life_path)
            base_score = compatibility
        
        if direction:
            direction_num = self.DIRECTION_NUMBERS.get(direction.lower(), 0)
            if direction_num > 0:
                direction_compat = self._calculate_direction_compatibility(
                    direction_num,
                    self.calculator._reduce_to_single_digit(owner_life_path, preserve_master=False)
                )
                base_score = (base_score + direction_compat) // 2
        
        return base_score
    
    def _generate_layout_suggestions(
        self,
        room_vibration: Optional[int],
        numerology: NumerologyProfile,
        direction: Optional[str]
    ) -> List[str]:
        """Generate layout suggestions for a room."""
        suggestions = []
        
        life_path = numerology.life_path_number
        life_path_reduced = self.calculator._reduce_to_single_digit(life_path, preserve_master=False)
        
        if life_path_reduced == 1:
            suggestions.append('Place furniture to support leadership and independence')
            suggestions.append('Create clear pathways for movement')
        elif life_path_reduced == 2:
            suggestions.append('Arrange furniture for harmony and cooperation')
            suggestions.append('Use pairs of items to enhance partnership energy')
        elif life_path_reduced == 3:
            suggestions.append('Create spaces for creativity and expression')
            suggestions.append('Include areas for communication and socializing')
        elif life_path_reduced == 4:
            suggestions.append('Organize space with clear structure and order')
            suggestions.append('Use practical and functional arrangements')
        elif life_path_reduced == 5:
            suggestions.append('Allow for flexibility and change in layout')
            suggestions.append('Create dynamic and adaptable spaces')
        elif life_path_reduced == 6:
            suggestions.append('Design for comfort and nurturing')
            suggestions.append('Include family-friendly arrangements')
        elif life_path_reduced == 7:
            suggestions.append('Create quiet spaces for reflection')
            suggestions.append('Include areas for study and analysis')
        elif life_path_reduced == 8:
            suggestions.append('Arrange for success and achievement')
            suggestions.append('Use powerful and commanding placements')
        elif life_path_reduced == 9:
            suggestions.append('Design for humanitarian and giving energy')
            suggestions.append('Include spaces for teaching and healing')
        
        return suggestions
    
    def _analyze_room_energy(
        self,
        room: Dict[str, Any],
        numerology: NumerologyProfile
    ) -> Dict[str, Any]:
        """Analyze energy of a specific room."""
        room_number = room.get('number', '')
        direction = room.get('direction', '')
        
        room_vibration = None
        if room_number:
            digits = ''.join(c for c in room_number if c.isdigit())
            if digits:
                total = sum(int(d) for d in digits)
                room_vibration = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        energy_score = self._calculate_room_energy_flow(
            room_vibration,
            numerology.life_path_number,
            direction
        )
        
        return {
            'room_name': room.get('name', 'Unknown'),
            'room_number': room_number,
            'room_vibration': room_vibration,
            'direction': direction,
            'energy_score': energy_score,
            'status': 'good' if energy_score >= 60 else 'needs_improvement'
        }
    
    def _analyze_entrance_energy(
        self,
        entrance: Dict[str, Any],
        numerology: NumerologyProfile
    ) -> Dict[str, Any]:
        """Analyze energy of main entrance."""
        direction = entrance.get('direction', '')
        entrance_number = entrance.get('number', '')
        
        entrance_vibration = None
        if entrance_number:
            digits = ''.join(c for c in entrance_number if c.isdigit())
            if digits:
                total = sum(int(d) for d in digits)
                entrance_vibration = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        compatibility = None
        if direction:
            compatibility = self.check_direction_compatibility(direction, numerology)
        
        return {
            'direction': direction,
            'entrance_number': entrance_number,
            'entrance_vibration': entrance_vibration,
            'compatibility': compatibility,
            'importance': 'high'  # Entrance is always important in Feng Shui
        }
    
    def _get_favorable_numbers(self, life_path: int, destiny: int) -> List[int]:
        """Get favorable numbers for a person."""
        life_path_reduced = self.calculator._reduce_to_single_digit(life_path, preserve_master=False)
        destiny_reduced = self.calculator._reduce_to_single_digit(destiny, preserve_master=False)
        
        # Favorable numbers are those that complement or enhance
        favorable = [life_path_reduced, destiny_reduced]
        
        # Add complementary numbers
        complementary_map = {
            1: [8, 9], 2: [7, 9], 3: [6, 9], 4: [5, 6],
            5: [4, 5], 6: [3, 4], 7: [2, 8], 8: [1, 7], 9: [1, 2, 3]
        }
        
        for num in [life_path_reduced, destiny_reduced]:
            if num in complementary_map:
                favorable.extend(complementary_map[num])
        
        # Remove duplicates and return unique list
        return list(set([n for n in favorable if 1 <= n <= 9]))
    
    def _generate_number_combinations(self, favorable_numbers: List[int]) -> List[Dict[str, Any]]:
        """Generate favorable number combinations."""
        combinations = []
        
        for i, num1 in enumerate(favorable_numbers):
            for num2 in favorable_numbers[i+1:]:
                combinations.append({
                    'numbers': [num1, num2],
                    'combined': self.calculator._reduce_to_single_digit(num1 + num2, preserve_master=False),
                    'meaning': f'Combination of {num1} and {num2}'
                })
        
        return combinations[:5]  # Return top 5 combinations
    
    def _number_to_color(self, number: int) -> Optional[str]:
        """Convert number to corresponding color."""
        number_color_map = {
            1: 'red', 2: 'orange', 3: 'yellow', 4: 'green', 5: 'blue',
            6: 'indigo', 7: 'violet', 8: 'pink', 9: 'white'
        }
        return number_color_map.get(number)
    
    def _number_meaning(self, number: int) -> str:
        """Get meaning of a number."""
        meanings = {
            1: 'leadership', 2: 'harmony', 3: 'creativity', 4: 'stability',
            5: 'freedom', 6: 'nurturing', 7: 'spirituality', 8: 'success', 9: 'completion'
        }
        return meanings.get(number, 'neutral')
    
    def _calculate_direction_compatibility(
        self,
        direction_number: int,
        life_path_reduced: int
    ) -> int:
        """Calculate compatibility between direction and life path."""
        # Simplified compatibility: closer numbers are more compatible
        diff = abs(direction_number - life_path_reduced)
        
        if diff == 0:
            return 90
        elif diff <= 2:
            return 75
        elif diff <= 4:
            return 60
        else:
            return 45
    
    def _get_direction_message(
        self,
        direction_number: int,
        life_path_reduced: int
    ) -> str:
        """Get message about direction compatibility."""
        compatibility = self._calculate_direction_compatibility(direction_number, life_path_reduced)
        
        if compatibility >= 75:
            return 'This direction is highly favorable for you'
        elif compatibility >= 60:
            return 'This direction is generally favorable'
        else:
            return 'This direction may require adjustments for optimal energy'
    
    def _calculate_compatibility(self, number1: int, number2: int) -> int:
        """Calculate compatibility between two numbers."""
        num1 = self.calculator._reduce_to_single_digit(number1, preserve_master=False)
        num2 = self.calculator._reduce_to_single_digit(number2, preserve_master=False)
        
        # Compatibility based on numerology principles
        if num1 == num2:
            return 85
        
        # Complementary pairs
        complementary_pairs = [(1, 8), (2, 7), (3, 6), (4, 5)]
        if (num1, num2) in complementary_pairs or (num2, num1) in complementary_pairs:
            return 80
        
        # Calculate difference
        diff = abs(num1 - num2)
        if diff == 1:
            return 70
        elif diff == 2:
            return 65
        elif diff == 3:
            return 60
        elif diff == 4:
            return 55
        else:
            return 50
    
    def _get_compatibility_message(
        self,
        house_num: int,
        owner_num: int,
        score: int
    ) -> str:
        """Get compatibility message."""
        if score >= 80:
            return f'Excellent compatibility between house ({house_num}) and owner ({owner_num})'
        elif score >= 70:
            return f'Good compatibility between house ({house_num}) and owner ({owner_num})'
        elif score >= 60:
            return f'Moderate compatibility - some adjustments may be beneficial'
        else:
            return f'Lower compatibility - consider enhancements to improve energy flow'

