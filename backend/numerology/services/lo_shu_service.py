"""
Enhanced Lo Shu Grid service with arrows and comparison features.
"""
from typing import Dict, List, Any, Tuple
from datetime import date
from numerology.numerology import NumerologyCalculator


class LoShuGridService:
    """Enhanced Lo Shu Grid service with visualization and comparison."""
    
    # Lo Shu Grid positions (3x3 grid)
    GRID_POSITIONS = {
        1: (0, 0),  # Top-left
        2: (0, 1),  # Top-center
        3: (0, 2),  # Top-right
        4: (1, 0),  # Middle-left
        5: (1, 1),  # Center
        6: (1, 2),  # Middle-right
        7: (2, 0),  # Bottom-left
        8: (2, 1),  # Bottom-center
        9: (2, 2),  # Bottom-right
    }
    
    # Arrow patterns (strength and weakness)
    ARROW_PATTERNS = {
        'strength': {
            'spiritual_arrow': [1, 5, 9],  # Diagonal top-left to bottom-right
            'material_arrow': [3, 5, 7],   # Diagonal top-right to bottom-left
            'mental_arrow': [2, 5, 8],     # Vertical center
            'emotional_arrow': [4, 5, 6],   # Horizontal center
            'action_arrow': [1, 2, 3],     # Top row
            'stability_arrow': [7, 8, 9],  # Bottom row
            'creativity_arrow': [1, 4, 7], # Left column
            'expression_arrow': [3, 6, 9], # Right column
        },
        'weakness': {
            'missing_spiritual': [1, 5, 9],
            'missing_material': [3, 5, 7],
            'missing_mental': [2, 5, 8],
            'missing_emotional': [4, 5, 6],
        }
    }
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
    
    def calculate_enhanced_grid(
        self,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Calculate enhanced Lo Shu Grid with arrows and interpretations.
        
        Args:
            full_name: Full name
            birth_date: Date of birth
            
        Returns:
            Enhanced grid data with arrows
        """
        # Get basic grid
        basic_grid = self.calculator.calculate_lo_shu_grid(full_name, birth_date)
        
        # Build position grid
        position_grid = self._build_position_grid(basic_grid)
        
        # Calculate arrows
        strength_arrows = self._calculate_strength_arrows(position_grid)
        weakness_arrows = self._calculate_weakness_arrows(position_grid, basic_grid)
        
        # Generate enhanced interpretation
        enhanced_interpretation = self._generate_enhanced_interpretation(
            basic_grid,
            strength_arrows,
            weakness_arrows
        )
        
        return {
            **basic_grid,
            'position_grid': position_grid,
            'strength_arrows': strength_arrows,
            'weakness_arrows': weakness_arrows,
            'arrow_interpretation': self._interpret_arrows(strength_arrows, weakness_arrows),
            'enhanced_interpretation': enhanced_interpretation,
            'personality_signature': self._calculate_personality_signature(position_grid),
            'remedy_suggestions': self._generate_remedy_suggestions(basic_grid, weakness_arrows)
        }
    
    def compare_grids(
        self,
        grid1: Dict[str, Any],
        grid2: Dict[str, Any],
        person1_name: str,
        person2_name: str
    ) -> Dict[str, Any]:
        """
        Compare two Lo Shu Grids for compatibility.
        
        Args:
            grid1: First person's grid data
            grid2: Second person's grid data
            person1_name: First person's name
            person2_name: Second person's name
            
        Returns:
            Comparison analysis
        """
        pos1 = grid1.get('position_grid', self._build_position_grid(grid1))
        pos2 = grid2.get('position_grid', self._build_position_grid(grid2))
        
        # Compare positions
        matching_positions = []
        complementary_positions = []
        conflicting_positions = []
        
        for num in range(1, 10):
            pos1_val = pos1.get(num, 0)
            pos2_val = pos2.get(num, 0)
            
            if pos1_val > 0 and pos2_val > 0:
                matching_positions.append(num)
            elif (pos1_val > 0 and pos2_val == 0) or (pos1_val == 0 and pos2_val > 0):
                complementary_positions.append(num)
            elif pos1_val == 0 and pos2_val == 0:
                conflicting_positions.append(num)
        
        # Compare arrows
        arrows1 = grid1.get('strength_arrows', [])
        arrows2 = grid2.get('strength_arrows', [])
        common_strength = [a for a in arrows1 if a in arrows2]
        common_weakness = [
            a for a in grid1.get('weakness_arrows', [])
            if a in grid2.get('weakness_arrows', [])
        ]
        
        # Calculate compatibility score
        compatibility_score = self._calculate_grid_compatibility(
            matching_positions,
            complementary_positions,
            conflicting_positions,
            common_strength,
            common_weakness
        )
        
        # Generate insights
        insights = self._generate_comparison_insights(
            matching_positions,
            complementary_positions,
            conflicting_positions,
            common_strength,
            common_weakness
        )
        
        # Generate recommendations
        recommendations = self._generate_comparison_recommendations(
            grid1,
            grid2,
            matching_positions,
            conflicting_positions
        )
        
        return {
            'person1_name': person1_name,
            'person2_name': person2_name,
            'compatibility_score': compatibility_score,
            'position_comparison': {
                'matching': matching_positions,
                'complementary': complementary_positions,
                'conflicting': conflicting_positions
            },
            'matching_positions': len(matching_positions),
            'complementary_positions': len(complementary_positions),
            'conflicting_positions': len(conflicting_positions),
            'common_strength_arrows': common_strength,
            'common_weakness_arrows': common_weakness,
            'insights': insights,
            'recommendations': recommendations
        }
    
    def _build_position_grid(self, grid_data: Dict[str, Any]) -> Dict[int, int]:
        """Build position grid mapping number to count."""
        position_grid = {}
        grid = grid_data.get('grid', {})
        
        for num in range(1, 10):
            pos_key = str(num)
            if pos_key in grid:
                position_grid[num] = grid[pos_key].get('count', 0)
            else:
                position_grid[num] = 0
        
        return position_grid
    
    def _calculate_strength_arrows(self, position_grid: Dict[int, int]) -> List[str]:
        """Calculate strength arrows (numbers present in arrow pattern)."""
        strength_arrows = []
        
        for arrow_name, positions in self.ARROW_PATTERNS['strength'].items():
            if all(position_grid.get(pos, 0) > 0 for pos in positions):
                strength_arrows.append(arrow_name)
        
        return strength_arrows
    
    def _calculate_weakness_arrows(
        self,
        position_grid: Dict[int, int],
        grid_data: Dict[str, Any]
    ) -> List[str]:
        """Calculate weakness arrows (missing numbers in arrow pattern)."""
        weakness_arrows = []
        missing_numbers = set(grid_data.get('missing_numbers', []))
        
        for arrow_name, positions in self.ARROW_PATTERNS['weakness'].items():
            if all(pos in missing_numbers for pos in positions):
                weakness_arrows.append(arrow_name)
        
        return weakness_arrows
    
    def _interpret_arrows(
        self,
        strength_arrows: List[str],
        weakness_arrows: List[str]
    ) -> str:
        """Generate interpretation of arrows."""
        interpretations = []
        
        arrow_meanings = {
            'spiritual_arrow': 'Strong spiritual connection and intuition',
            'material_arrow': 'Strong material success and practical abilities',
            'mental_arrow': 'Strong mental clarity and analytical thinking',
            'emotional_arrow': 'Strong emotional intelligence and empathy',
            'action_arrow': 'Strong drive for action and achievement',
            'stability_arrow': 'Strong foundation and stability',
            'creativity_arrow': 'Strong creative expression',
            'expression_arrow': 'Strong communication and expression',
        }
        
        for arrow in strength_arrows:
            if arrow in arrow_meanings:
                interpretations.append(arrow_meanings[arrow])
        
        if weakness_arrows:
            interpretations.append(f"Areas needing attention: {', '.join(weakness_arrows)}")
        
        return '. '.join(interpretations) if interpretations else 'Balanced grid with no dominant patterns'
    
    def _generate_enhanced_interpretation(
        self,
        grid_data: Dict[str, Any],
        strength_arrows: List[str],
        weakness_arrows: List[str]
    ) -> str:
        """Generate enhanced interpretation."""
        parts = []
        
        # Basic interpretation
        if grid_data.get('interpretation'):
            parts.append(grid_data['interpretation'])
        
        # Arrow insights
        if strength_arrows:
            parts.append(f"Your grid shows strength in: {', '.join([a.replace('_', ' ').title() for a in strength_arrows])}")
        
        if weakness_arrows:
            parts.append(f"Areas to develop: {', '.join([a.replace('_', ' ').title() for a in weakness_arrows])}")
        
        return ' '.join(parts)
    
    def _calculate_personality_signature(self, position_grid: Dict[int, int]) -> Dict[str, Any]:
        """Calculate personality signature from grid."""
        # Find dominant numbers
        dominant_numbers = sorted(
            [(num, count) for num, count in position_grid.items() if count > 0],
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        return {
            'dominant_numbers': [num for num, _ in dominant_numbers],
            'dominant_counts': [count for _, count in dominant_numbers],
            'signature_type': self._determine_signature_type(position_grid)
        }
    
    def _determine_signature_type(self, position_grid: Dict[int, int]) -> str:
        """Determine personality signature type."""
        total_present = sum(1 for count in position_grid.values() if count > 0)
        
        if total_present >= 7:
            return 'balanced'
        elif total_present >= 5:
            return 'focused'
        else:
            return 'specialized'
    
    def _generate_remedy_suggestions(
        self,
        grid_data: Dict[str, Any],
        weakness_arrows: List[str]
    ) -> List[str]:
        """Generate remedy suggestions for missing numbers."""
        suggestions = []
        missing_numbers = grid_data.get('missing_numbers', [])
        
        if not missing_numbers:
            return ['Your grid is well-balanced. Continue maintaining harmony in all areas.']
        
        number_remedies = {
            1: 'Focus on leadership and independence. Take initiative in new projects.',
            2: 'Develop cooperation and diplomacy. Work on partnerships.',
            3: 'Express creativity. Engage in artistic or communication activities.',
            4: 'Build stability and structure. Focus on organization and planning.',
            5: 'Embrace change and freedom. Explore new experiences.',
            6: 'Nurture relationships and service. Focus on family and community.',
            7: 'Develop spirituality and introspection. Practice meditation or study.',
            8: 'Focus on material success. Develop business and financial skills.',
            9: 'Engage in humanitarian work. Practice compassion and service.',
        }
        
        for num in missing_numbers:
            if num in number_remedies:
                suggestions.append(number_remedies[num])
        
        return suggestions
    
    def _calculate_grid_compatibility(
        self,
        matching: List[int],
        complementary: List[int],
        conflicting: List[int],
        common_strength: List[str],
        common_weakness: List[str]
    ) -> int:
        """Calculate compatibility score (0-100)."""
        score = 0
        
        # Matching positions boost compatibility
        score += len(matching) * 8
        
        # Complementary positions are good
        score += len(complementary) * 5
        
        # Conflicting positions reduce compatibility
        score -= len(conflicting) * 3
        
        # Common strength arrows boost
        score += len(common_strength) * 10
        
        # Common weakness arrows reduce
        score -= len(common_weakness) * 5
        
        return max(0, min(100, score))
    
    def _generate_comparison_insights(
        self,
        matching: List[int],
        complementary: List[int],
        conflicting: List[int],
        common_strength: List[str],
        common_weakness: List[str]
    ) -> List[str]:
        """Generate insights from comparison."""
        insights = []
        
        if len(matching) >= 5:
            insights.append('Strong numerological alignment - you share many core values and approaches.')
        elif len(matching) >= 3:
            insights.append('Good numerological compatibility - you have several shared strengths.')
        
        if len(complementary) >= 4:
            insights.append('Complementary strengths - you balance each other well.')
        
        if len(conflicting) >= 3:
            insights.append('Some conflicting areas - communication and understanding will be important.')
        
        if common_strength:
            insights.append(f'Shared strengths in: {", ".join([a.replace("_", " ").title() for a in common_strength])}')
        
        return insights
    
    def _generate_comparison_recommendations(
        self,
        grid1: Dict[str, Any],
        grid2: Dict[str, Any],
        matching: List[int],
        conflicting: List[int]
    ) -> List[str]:
        """Generate recommendations based on comparison."""
        recommendations = []
        
        if len(matching) >= 5:
            recommendations.append('Leverage your shared strengths for collaborative projects.')
        
        if conflicting:
            recommendations.append('Focus on understanding and respecting each other\'s different approaches.')
        
        # Check for complementary missing numbers
        missing1 = set(grid1.get('missing_numbers', []))
        missing2 = set(grid2.get('missing_numbers', []))
        complementary_missing = missing1.intersection(missing2)
        
        if complementary_missing:
            recommendations.append(f'Work together to develop areas represented by numbers: {", ".join(map(str, complementary_missing))}')
        
        return recommendations
