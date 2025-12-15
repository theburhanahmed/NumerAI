"""
Name Correction service for phonetic optimization and cultural compatibility.
"""
from typing import Dict, List, Any, Optional, Tuple
from ..numerology import NumerologyCalculator


class NameCorrectionService:
    """Service for name correction and optimization."""
    
    # Phonetic variations for common sounds
    PHONETIC_MAP = {
        'C': ['K', 'S'],
        'K': ['C', 'Q'],
        'S': ['C', 'Z'],
        'Z': ['S'],
        'F': ['PH', 'V'],
        'PH': ['F'],
        'V': ['F'],
        'J': ['G', 'Y'],
        'G': ['J'],
        'Y': ['I', 'J'],
        'I': ['Y', 'E'],
        'E': ['I', 'A'],
        'A': ['E', 'O'],
        'O': ['A', 'U'],
        'U': ['O'],
        'Q': ['K', 'C'],
        'X': ['KS', 'Z'],
        'W': ['V', 'U']
    }
    
    # Cultural compatibility mappings
    CULTURAL_COMPATIBILITY = {
        'western': ['A', 'E', 'I', 'O', 'U', 'L', 'M', 'N', 'R', 'S', 'T'],
        'eastern': ['A', 'E', 'I', 'O', 'U', 'K', 'L', 'M', 'N', 'R', 'S', 'T'],
        'south_asian': ['A', 'E', 'I', 'O', 'U', 'K', 'H', 'M', 'N', 'R', 'S', 'T'],
        'middle_eastern': ['A', 'E', 'I', 'O', 'U', 'H', 'K', 'M', 'N', 'R', 'S', 'T']
    }
    
    def __init__(self, system: str = 'pythagorean'):
        """Initialize with calculation system."""
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
    
    def analyze_name(
        self,
        name: str,
        target_number: Optional[int] = None,
        cultural_context: str = 'western'
    ) -> Dict[str, Any]:
        """
        Analyze name and provide correction suggestions.
        
        Args:
            name: Current name
            target_number: Desired numerology number (optional)
            cultural_context: Cultural context for compatibility
        
        Returns:
            Analysis with suggestions
        """
        # Calculate current name numbers
        current_numbers = self.calculator.calculate_all(name, None)  # Name-only calculation
        current_expression = current_numbers.get('destiny_number', 0)
        
        # Generate suggestions
        suggestions = self._generate_suggestions(
            name,
            current_expression,
            target_number,
            cultural_context
        )
        
        # Analyze phonetic optimization
        phonetic_analysis = self._analyze_phonetics(name, cultural_context)
        
        # Cultural compatibility analysis
        cultural_analysis = self._analyze_cultural_compatibility(name, cultural_context)
        
        return {
            'original_name': name,
            'current_expression': current_expression,
            'target_number': target_number,
            'suggestions': suggestions,
            'phonetic_analysis': phonetic_analysis,
            'cultural_analysis': cultural_analysis,
            'recommendations': self._generate_recommendations(
                current_expression,
                target_number,
                suggestions,
                phonetic_analysis,
                cultural_analysis
            )
        }
    
    def _generate_suggestions(
        self,
        name: str,
        current_expression: int,
        target_number: Optional[int],
        cultural_context: str
    ) -> List[Dict[str, Any]]:
        """Generate name correction suggestions."""
        suggestions = []
        
        if target_number and target_number != current_expression:
            # Generate variations to reach target number
            variations = self._generate_variations(name, target_number, cultural_context)
            suggestions.extend(variations)
        else:
            # Suggest improvements for current number
            improvements = self._suggest_improvements(name, current_expression, cultural_context)
            suggestions.extend(improvements)
        
        return suggestions[:10]  # Return top 10 suggestions
    
    def _generate_variations(
        self,
        name: str,
        target_number: int,
        cultural_context: str
    ) -> List[Dict[str, Any]]:
        """Generate name variations to reach target number."""
        variations = []
        name_upper = name.upper().replace(' ', '')
        
        # Try single letter changes
        for i, char in enumerate(name_upper):
            if char in self.PHONETIC_MAP:
                for replacement in self.PHONETIC_MAP[char]:
                    new_name = name_upper[:i] + replacement + name_upper[i+1:]
                    new_expression = self._calculate_expression_number(new_name)
                    
                    if new_expression == target_number:
                        variations.append({
                            'name': new_name.title(),
                            'expression': new_expression,
                            'change': f"Changed '{char}' to '{replacement}' at position {i+1}",
                            'score': 100,
                            'type': 'phonetic_substitution'
                        })
        
        # Try adding/removing letters
        # Add vowel
        for vowel in ['A', 'E', 'I', 'O', 'U']:
            for pos in range(len(name_upper) + 1):
                new_name = name_upper[:pos] + vowel + name_upper[pos:]
                new_expression = self._calculate_expression_number(new_name)
                
                if new_expression == target_number:
                    variations.append({
                        'name': new_name.title(),
                        'expression': new_expression,
                        'change': f"Added '{vowel}' at position {pos+1}",
                        'score': 90,
                        'type': 'letter_addition'
                    })
        
        # Sort by score
        variations.sort(key=lambda x: x['score'], reverse=True)
        return variations[:5]
    
    def _suggest_improvements(
        self,
        name: str,
        current_expression: int,
        cultural_context: str
    ) -> List[Dict[str, Any]]:
        """Suggest improvements for current name."""
        improvements = []
        
        # Suggest numbers that harmonize with current
        harmonious_numbers = self._get_harmonious_numbers(current_expression)
        
        for target in harmonious_numbers:
            if target != current_expression:
                variations = self._generate_variations(name, target, cultural_context)
                improvements.extend(variations[:2])  # Top 2 for each target
        
        return improvements[:5]
    
    def _calculate_expression_number(self, name: str) -> int:
        """Calculate expression number for a name."""
        total = 0
        for char in name:
            if char in self.calculator.letter_values:
                total += self.calculator.letter_values[char]
        return self.calculator._reduce_to_single_digit(total, preserve_master=False)
    
    def _get_harmonious_numbers(self, number: int) -> List[int]:
        """Get numbers that harmonize with given number."""
        # Numbers that complement or enhance
        if number == 1:
            return [1, 5, 7]
        elif number == 2:
            return [2, 4, 6]
        elif number == 3:
            return [3, 6, 9]
        elif number == 4:
            return [4, 2, 8]
        elif number == 5:
            return [5, 1, 7]
        elif number == 6:
            return [6, 2, 3]
        elif number == 7:
            return [7, 1, 5]
        elif number == 8:
            return [8, 4]
        elif number == 9:
            return [9, 3, 6]
        return [number]
    
    def _analyze_phonetics(self, name: str, cultural_context: str) -> Dict[str, Any]:
        """Analyze phonetic properties of name."""
        name_upper = name.upper().replace(' ', '')
        
        # Count vowels and consonants
        vowels = sum(1 for c in name_upper if c in self.calculator.VOWELS)
        consonants = len(name_upper) - vowels
        
        # Check for difficult pronunciations
        difficult_combinations = ['X', 'Q', 'Z', 'J']
        difficult_count = sum(1 for c in name_upper if c in difficult_combinations)
        
        # Phonetic score (higher is better)
        phonetic_score = 100 - (difficult_count * 10) - (abs(vowels - consonants) * 5)
        phonetic_score = max(0, min(100, phonetic_score))
        
        return {
            'vowels': vowels,
            'consonants': consonants,
            'difficult_letters': difficult_count,
            'phonetic_score': phonetic_score,
            'pronunciation_ease': 'easy' if phonetic_score >= 80 else 'moderate' if phonetic_score >= 60 else 'difficult',
            'suggestions': self._get_phonetic_suggestions(name_upper, difficult_combinations)
        }
    
    def _get_phonetic_suggestions(self, name: str, difficult_letters: List[str]) -> List[str]:
        """Get suggestions for phonetic improvements."""
        suggestions = []
        
        for char in name:
            if char in difficult_letters and char in self.PHONETIC_MAP:
                for replacement in self.PHONETIC_MAP[char]:
                    suggestions.append(f"Consider replacing '{char}' with '{replacement}' for easier pronunciation")
                    break
        
        return suggestions[:3]
    
    def _analyze_cultural_compatibility(self, name: str, cultural_context: str) -> Dict[str, Any]:
        """Analyze cultural compatibility of name."""
        name_upper = name.upper().replace(' ', '')
        compatible_letters = self.CULTURAL_COMPATIBILITY.get(cultural_context, [])
        
        compatible_count = sum(1 for c in name_upper if c in compatible_letters)
        compatibility_score = int((compatible_count / len(name_upper)) * 100) if name_upper else 0
        
        incompatible_letters = [c for c in name_upper if c not in compatible_letters]
        
        return {
            'cultural_context': cultural_context,
            'compatibility_score': compatibility_score,
            'compatible_letters': compatible_count,
            'incompatible_letters': incompatible_letters,
            'compatibility_level': 'high' if compatibility_score >= 80 else 'moderate' if compatibility_score >= 60 else 'low',
            'suggestions': self._get_cultural_suggestions(name_upper, incompatible_letters, cultural_context)
        }
    
    def _get_cultural_suggestions(
        self,
        name: str,
        incompatible_letters: List[str],
        cultural_context: str
    ) -> List[str]:
        """Get suggestions for cultural compatibility."""
        suggestions = []
        
        for char in set(incompatible_letters):
            if char in self.PHONETIC_MAP:
                for replacement in self.PHONETIC_MAP[char]:
                    if replacement in self.CULTURAL_COMPATIBILITY.get(cultural_context, []):
                        suggestions.append(f"Consider '{replacement}' instead of '{char}' for better {cultural_context} compatibility")
                        break
        
        return suggestions[:3]
    
    def _generate_recommendations(
        self,
        current_expression: int,
        target_number: Optional[int],
        suggestions: List[Dict],
        phonetic_analysis: Dict,
        cultural_analysis: Dict
    ) -> List[str]:
        """Generate overall recommendations."""
        recommendations = []
        
        if target_number and target_number != current_expression:
            recommendations.append(f"To reach expression number {target_number}, consider the suggested name variations.")
        
        if phonetic_analysis['phonetic_score'] < 70:
            recommendations.append("Consider phonetic improvements for easier pronunciation.")
        
        if cultural_analysis['compatibility_score'] < 70:
            recommendations.append(f"Consider adjustments for better {cultural_analysis['cultural_context']} cultural compatibility.")
        
        if suggestions:
            recommendations.append(f"Found {len(suggestions)} name variation suggestions.")
        
        return recommendations

