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
    
    def generate_name_suggestions(
        self,
        current_name: str,
        target_number: Optional[int] = None,
        cultural_context: str = 'western',
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Generate AI-powered name suggestions.
        
        Args:
            current_name: Current name
            target_number: Target expression number
            cultural_context: Cultural context
            limit: Maximum suggestions to return
            
        Returns:
            Name suggestions with analysis
        """
        analysis = self.analyze_name(current_name, target_number, cultural_context)
        
        # Enhance suggestions with AI-like scoring
        enhanced_suggestions = []
        for suggestion in analysis['suggestions']:
            # Calculate additional scores
            phonetic_score = self._calculate_suggestion_phonetic_score(suggestion['name'])
            cultural_score = self._calculate_suggestion_cultural_score(suggestion['name'], cultural_context)
            similarity_score = self._calculate_similarity_score(current_name, suggestion['name'])
            
            enhanced_suggestions.append({
                **suggestion,
                'phonetic_score': phonetic_score,
                'cultural_score': cultural_score,
                'similarity_score': similarity_score,
                'overall_score': (
                    suggestion.get('score', 50) * 0.4 +
                    phonetic_score * 0.3 +
                    cultural_score * 0.2 +
                    similarity_score * 0.1
                )
            })
        
        # Sort by overall score
        enhanced_suggestions.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return {
            'original_name': current_name,
            'target_number': target_number,
            'suggestions': enhanced_suggestions[:limit],
            'analysis': {
                'phonetic': analysis['phonetic_analysis'],
                'cultural': analysis['cultural_analysis']
            }
        }
    
    def optimize_name_vibration(
        self,
        current_name: str,
        target_vibration: Optional[int] = None,
        optimization_goals: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Optimize name vibration for specific goals.
        
        Args:
            current_name: Current name
            target_vibration: Target vibration number
            optimization_goals: List of goals (e.g., ['success', 'harmony', 'creativity'])
            
        Returns:
            Optimization analysis
        """
        current_expression = self._calculate_expression_number(current_name.upper().replace(' ', ''))
        
        if not target_vibration:
            # Determine optimal vibration based on goals
            target_vibration = self._determine_optimal_vibration(optimization_goals or [])
        
        # Generate optimized variations
        optimized_names = self._generate_optimized_variations(
            current_name,
            current_expression,
            target_vibration
        )
        
        return {
            'original_name': current_name,
            'current_vibration': current_expression,
            'target_vibration': target_vibration,
            'optimization_goals': optimization_goals or [],
            'optimized_names': optimized_names,
            'vibration_improvement': abs(target_vibration - current_expression),
            'recommendations': self._get_vibration_recommendations(current_expression, target_vibration)
        }
    
    def analyze_phonetic_compatibility(
        self,
        name1: str,
        name2: str,
        relationship_type: str = 'general'
    ) -> Dict[str, Any]:
        """
        Analyze phonetic compatibility between two names.
        
        Args:
            name1: First name
            name2: Second name
            relationship_type: Type of relationship
            
        Returns:
            Phonetic compatibility analysis
        """
        phonetic1 = self._analyze_phonetics(name1, 'western')
        phonetic2 = self._analyze_phonetics(name2, 'western')
        
        # Calculate compatibility
        vowel_compatibility = abs(phonetic1['vowels'] - phonetic2['vowels']) <= 2
        consonant_compatibility = abs(phonetic1['consonants'] - phonetic2['consonants']) <= 2
        score_compatibility = abs(phonetic1['phonetic_score'] - phonetic2['phonetic_score']) <= 20
        
        compatibility_score = 50  # Base
        if vowel_compatibility:
            compatibility_score += 20
        if consonant_compatibility:
            compatibility_score += 20
        if score_compatibility:
            compatibility_score += 10
        
        return {
            'name1': {
                'name': name1,
                'phonetic_analysis': phonetic1
            },
            'name2': {
                'name': name2,
                'phonetic_analysis': phonetic2
            },
            'compatibility_score': min(100, compatibility_score),
            'compatibility_level': 'high' if compatibility_score >= 80 else 'moderate' if compatibility_score >= 60 else 'low',
            'analysis': {
                'vowel_harmony': vowel_compatibility,
                'consonant_harmony': consonant_compatibility,
                'score_alignment': score_compatibility
            },
            'recommendations': self._get_phonetic_compatibility_recommendations(
                compatibility_score, relationship_type
            )
        }
    
    def calculate_name_change_timing(
        self,
        birth_date,
        current_name: str,
        new_name: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Calculate optimal timing for name change.
        
        Args:
            birth_date: Date of birth
            current_name: Current name
            new_name: Proposed new name
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            Optimal timing analysis
        """
        from datetime import timedelta
        from ..services.timing_numerology import TimingNumerologyService
        
        timing_service = TimingNumerologyService()
        
        current_expression = self._calculate_expression_number(current_name.upper().replace(' ', ''))
        new_expression = self._calculate_expression_number(new_name.upper().replace(' ', ''))
        
        optimal_dates = []
        current = start_date
        
        while current <= end_date:
            personal_day = self.calculator.calculate_personal_day_number(birth_date, current)
            personal_month = self.calculator.calculate_personal_month_number(
                birth_date, current.year, current.month
            )
            personal_year = self.calculator.calculate_personal_year_number(birth_date, current.year)
            
            # Calculate alignment score
            alignment_score = self._calculate_name_change_alignment(
                current_expression,
                new_expression,
                personal_day,
                personal_month,
                personal_year
            )
            
            optimal_dates.append({
                'date': current.isoformat(),
                'alignment_score': alignment_score,
                'personal_day': personal_day,
                'personal_month': personal_month,
                'personal_year': personal_year,
                'recommendation': self._get_name_change_recommendation(alignment_score)
            })
            
            current += timedelta(days=1)
        
        optimal_dates.sort(key=lambda x: x['alignment_score'], reverse=True)
        
        return {
            'current_name': current_name,
            'new_name': new_name,
            'current_expression': current_expression,
            'new_expression': new_expression,
            'top_dates': optimal_dates[:10],
            'all_dates': optimal_dates,
            'recommendations': self._get_name_change_timing_recommendations(
                current_expression, new_expression
            )
        }
    
    def compare_name_variations(
        self,
        base_name: str,
        name_variations: List[str]
    ) -> Dict[str, Any]:
        """
        Compare multiple name variations.
        
        Args:
            base_name: Original/base name
            name_variations: List of name variations to compare
            
        Returns:
            Comparison analysis
        """
        base_expression = self._calculate_expression_number(base_name.upper().replace(' ', ''))
        base_phonetic = self._analyze_phonetics(base_name, 'western')
        
        comparisons = []
        for variation in name_variations:
            var_expression = self._calculate_expression_number(variation.upper().replace(' ', ''))
            var_phonetic = self._analyze_phonetics(variation, 'western')
            
            # Calculate similarity to base
            similarity = self._calculate_similarity_score(base_name, variation)
            
            # Calculate improvement
            expression_improvement = var_expression - base_expression
            phonetic_improvement = var_phonetic['phonetic_score'] - base_phonetic['phonetic_score']
            
            comparisons.append({
                'name': variation,
                'expression_number': var_expression,
                'phonetic_score': var_phonetic['phonetic_score'],
                'similarity_to_base': similarity,
                'expression_improvement': expression_improvement,
                'phonetic_improvement': phonetic_improvement,
                'overall_score': (
                    (100 - abs(expression_improvement)) * 0.5 +
                    var_phonetic['phonetic_score'] * 0.3 +
                    similarity * 0.2
                )
            })
        
        comparisons.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return {
            'base_name': base_name,
            'base_expression': base_expression,
            'base_phonetic_score': base_phonetic['phonetic_score'],
            'comparisons': comparisons,
            'best_variation': comparisons[0] if comparisons else None,
            'summary': self._generate_comparison_summary(comparisons)
        }
    
    def _calculate_suggestion_phonetic_score(self, name: str) -> float:
        """Calculate phonetic score for a suggestion."""
        phonetic = self._analyze_phonetics(name, 'western')
        return phonetic['phonetic_score']
    
    def _calculate_suggestion_cultural_score(self, name: str, cultural_context: str) -> float:
        """Calculate cultural score for a suggestion."""
        cultural = self._analyze_cultural_compatibility(name, cultural_context)
        return cultural['compatibility_score']
    
    def _calculate_similarity_score(self, name1: str, name2: str) -> float:
        """Calculate similarity score between two names."""
        name1_clean = name1.upper().replace(' ', '')
        name2_clean = name2.upper().replace(' ', '')
        
        # Simple similarity based on common characters
        common_chars = set(name1_clean) & set(name2_clean)
        total_chars = len(set(name1_clean) | set(name2_clean))
        
        if total_chars == 0:
            return 0
        
        similarity = (len(common_chars) / total_chars) * 100
        return similarity
    
    def _determine_optimal_vibration(self, goals: List[str]) -> int:
        """Determine optimal vibration based on goals."""
        goal_vibrations = {
            'success': 8,
            'harmony': 2,
            'creativity': 3,
            'stability': 4,
            'leadership': 1,
            'service': 6,
            'wisdom': 7,
            'completion': 9
        }
        
        # Return most common goal vibration, or default to 8
        goal_numbers = [goal_vibrations.get(g.lower(), 8) for g in goals]
        if goal_numbers:
            from collections import Counter
            most_common = Counter(goal_numbers).most_common(1)[0][0]
            return most_common
        
        return 8  # Default to success
    
    def _generate_optimized_variations(
        self,
        current_name: str,
        current_expression: int,
        target_vibration: int
    ) -> List[Dict[str, Any]]:
        """Generate optimized name variations."""
        variations = self._generate_variations(current_name, target_vibration, 'western')
        
        # Enhance with optimization scores
        optimized = []
        for var in variations:
            optimized.append({
                **var,
                'optimization_score': 100 if var['expression'] == target_vibration else 50,
                'vibration_alignment': abs(var['expression'] - target_vibration)
            })
        
        return sorted(optimized, key=lambda x: x['optimization_score'], reverse=True)[:5]
    
    def _get_vibration_recommendations(
        self,
        current: int,
        target: int
    ) -> List[str]:
        """Get recommendations for vibration optimization."""
        recommendations = []
        
        diff = abs(current - target)
        if diff > 4:
            recommendations.append(f'Significant vibration change needed (from {current} to {target})')
            recommendations.append('Consider multiple letter changes or name restructuring')
        elif diff > 2:
            recommendations.append(f'Moderate vibration adjustment needed (from {current} to {target})')
            recommendations.append('Single or double letter changes may suffice')
        else:
            recommendations.append(f'Minor vibration adjustment (from {current} to {target})')
            recommendations.append('Small phonetic changes should work')
        
        return recommendations
    
    def _get_phonetic_compatibility_recommendations(
        self,
        score: float,
        relationship_type: str
    ) -> List[str]:
        """Get recommendations for phonetic compatibility."""
        recommendations = []
        
        if score >= 80:
            recommendations.append('Excellent phonetic compatibility - names flow well together')
        elif score >= 60:
            recommendations.append('Good phonetic compatibility - names work well together')
        else:
            recommendations.append('Consider phonetic adjustments for better harmony')
        
        if relationship_type == 'romantic':
            recommendations.append('For romantic relationships, phonetic harmony enhances connection')
        
        return recommendations
    
    def _calculate_name_change_alignment(
        self,
        current_expression: int,
        new_expression: int,
        personal_day: int,
        personal_month: int,
        personal_year: int
    ) -> int:
        """Calculate alignment score for name change timing."""
        score = 50  # Base score
        
        # Good days for changes (5 is change day, but also 1, 3 for new beginnings)
        if personal_day in [1, 3, 5]:
            score += 20
        elif personal_day in [2, 4, 6]:
            score += 10
        
        # Good months for changes
        if personal_month in [1, 3, 5]:
            score += 15
        
        # Good years for changes
        if personal_year in [1, 3, 5]:
            score += 15
        
        # Bonus if new expression aligns with personal day
        if new_expression == personal_day:
            score += 10
        
        return min(100, max(0, score))
    
    def _get_name_change_recommendation(self, score: int) -> str:
        """Get recommendation for name change timing."""
        if score >= 80:
            return 'Excellent timing - highly recommended'
        elif score >= 70:
            return 'Good timing - recommended'
        elif score >= 60:
            return 'Moderate timing - acceptable'
        else:
            return 'Not ideal timing - consider alternative dates'
    
    def _get_name_change_timing_recommendations(
        self,
        current_expression: int,
        new_expression: int
    ) -> List[str]:
        """Get general recommendations for name change timing."""
        recommendations = []
        
        recommendations.append('Choose dates with Personal Day 1, 3, or 5 for change energy')
        recommendations.append('Personal Year 1, 3, or 5 support name changes')
        recommendations.append('Avoid Personal Day 4 or 7 for name changes (stability vs change)')
        
        if abs(current_expression - new_expression) > 4:
            recommendations.append('Major vibration change - ensure strong alignment with personal cycles')
        
        return recommendations
    
    def _generate_comparison_summary(self, comparisons: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary of name comparisons."""
        if not comparisons:
            return {}
        
        best = comparisons[0]
        avg_score = sum(c['overall_score'] for c in comparisons) / len(comparisons)
        
        return {
            'total_variations': len(comparisons),
            'best_name': best['name'],
            'best_score': best['overall_score'],
            'average_score': avg_score,
            'improvements_found': len([c for c in comparisons if c['overall_score'] > 50])
        }

