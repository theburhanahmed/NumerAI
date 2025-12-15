"""
Enhanced relationship numerology service with multi-partner comparison, sexual energy, and marriage harmony.
"""
from typing import Dict, List, Any, Optional, Tuple
from datetime import date
from numerology.numerology import NumerologyCalculator
from numerology.compatibility import CompatibilityAnalyzer


class RelationshipNumerologyService:
    """Enhanced service for relationship numerology analysis."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
        self.compatibility_analyzer = CompatibilityAnalyzer()
    
    def calculate_enhanced_compatibility(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any],
        relationship_type: str = 'romantic'
    ) -> Dict[str, Any]:
        """
        Calculate enhanced compatibility with detailed analysis.
        
        Args:
            profile_1: First person's numerology profile
            profile_2: Second person's numerology profile
            relationship_type: Type of relationship (romantic, business, friendship, family)
            
        Returns:
            Enhanced compatibility analysis
        """
        # Basic compatibility scores
        compatibility_scores = self.compatibility_analyzer.calculate_compatibility_scores(
            profile_1,
            profile_2,
            relationship_type=relationship_type
        )
        
        # Calculate sexual energy
        sexual_energy = self._calculate_sexual_energy(profile_1, profile_2)
        
        # Calculate marriage harmony
        marriage_harmony = self._calculate_marriage_harmony(profile_1, profile_2)
        
        # Calculate breakup risk
        breakup_risk = self._calculate_breakup_risk(profile_1, profile_2)
        
        # Calculate communication style
        communication_style = self._calculate_communication_style(profile_1, profile_2)
        
        # Calculate financial compatibility
        financial_compatibility = self._calculate_financial_compatibility(profile_1, profile_2)
        
        # Calculate emotional compatibility
        emotional_compatibility = self._calculate_emotional_compatibility(profile_1, profile_2)
        
        # Generate detailed insights
        insights = self._generate_relationship_insights(
            compatibility_scores,
            sexual_energy,
            marriage_harmony,
            breakup_risk
        )
        
        return {
            'overall_compatibility': compatibility_scores.get('overall_score', 0),
            'compatibility_scores': compatibility_scores,
            'sexual_energy': sexual_energy,
            'marriage_harmony': marriage_harmony,
            'breakup_risk': breakup_risk,
            'communication_style': communication_style,
            'financial_compatibility': financial_compatibility,
            'emotional_compatibility': emotional_compatibility,
            'insights': insights,
            'recommendations': self._generate_recommendations(
                compatibility_scores,
                sexual_energy,
                marriage_harmony,
                breakup_risk
            )
        }
    
    def compare_multiple_partners(
        self,
        user_profile: Dict[str, Any],
        partner_profiles: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare user with multiple partners.
        
        Args:
            user_profile: User's numerology profile
            partner_profiles: List of partner profiles with names
            
        Returns:
            Comparison analysis
        """
        comparisons = []
        
        for partner in partner_profiles:
            partner_profile = partner.get('profile', {})
            partner_name = partner.get('name', 'Unknown')
            
            compatibility = self.calculate_enhanced_compatibility(
                user_profile,
                partner_profile,
                relationship_type='romantic'
            )
            
            comparisons.append({
                'partner_name': partner_name,
                'partner_id': partner.get('id'),
                **compatibility
            })
        
        # Rank partners
        comparisons.sort(key=lambda x: x.get('overall_compatibility', 0), reverse=True)
        
        # Generate summary
        summary = {
            'total_partners': len(comparisons),
            'best_match': comparisons[0] if comparisons else None,
            'average_compatibility': sum(c.get('overall_compatibility', 0) for c in comparisons) / len(comparisons) if comparisons else 0,
            'compatibility_range': {
                'highest': comparisons[0].get('overall_compatibility', 0) if comparisons else 0,
                'lowest': comparisons[-1].get('overall_compatibility', 0) if comparisons else 0
            }
        }
        
        return {
            'summary': summary,
            'comparisons': comparisons,
            'rankings': [
                {
                    'rank': idx + 1,
                    'partner_name': comp['partner_name'],
                    'compatibility': comp['overall_compatibility']
                }
                for idx, comp in enumerate(comparisons)
            ]
        }
    
    def calculate_marriage_harmony_cycles(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any],
        marriage_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calculate marriage harmony cycles over time.
        
        Args:
            profile_1: First person's profile
            profile_2: Second person's profile
            marriage_date: Date of marriage (optional)
            
        Returns:
            Marriage harmony cycle analysis
        """
        if not marriage_date:
            marriage_date = date.today()
        
        # Calculate base harmony
        base_harmony = self._calculate_marriage_harmony(profile_1, profile_2)
        
        # Calculate yearly cycles
        yearly_cycles = []
        for year_offset in range(10):  # Next 10 years
            year = marriage_date.year + year_offset
            
            # Calculate personal years
            dob1 = profile_1.get('birth_date')
            dob2 = profile_2.get('birth_date')
            
            if dob1 and dob2:
                py1 = self.calculator.calculate_personal_year_number(dob1, year)
                py2 = self.calculator.calculate_personal_year_number(dob2, year)
                
                # Calculate harmony for this year
                year_harmony = self._calculate_year_harmony(py1, py2, base_harmony)
                
                yearly_cycles.append({
                    'year': year,
                    'years_married': year_offset,
                    'personal_year_1': py1,
                    'personal_year_2': py2,
                    'harmony_score': year_harmony['score'],
                    'harmony_level': year_harmony['level'],
                    'key_themes': year_harmony['themes']
                })
        
        # Identify critical periods
        critical_periods = [
            cycle for cycle in yearly_cycles
            if cycle['harmony_score'] < 50
        ]
        
        # Identify peak periods
        peak_periods = [
            cycle for cycle in yearly_cycles
            if cycle['harmony_score'] >= 80
        ]
        
        return {
            'base_harmony': base_harmony,
            'yearly_cycles': yearly_cycles,
            'critical_periods': critical_periods,
            'peak_periods': peak_periods,
            'overall_trend': self._calculate_harmony_trend(yearly_cycles)
        }
    
    def _calculate_sexual_energy(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate sexual energy compatibility."""
        lp1 = profile_1.get('life_path_number', 1)
        lp2 = profile_2.get('life_path_number', 1)
        su1 = profile_1.get('soul_urge_number', 1)
        su2 = profile_2.get('soul_urge_number', 1)
        
        # Sexual energy numbers (high energy)
        high_energy_numbers = {1, 5, 8}
        medium_energy_numbers = {3, 7, 9}
        
        energy1 = 1 if lp1 in high_energy_numbers else (0.7 if lp1 in medium_energy_numbers else 0.5)
        energy2 = 1 if lp2 in high_energy_numbers else (0.7 if lp2 in medium_energy_numbers else 0.5)
        
        # Soul Urge adds intensity
        intensity1 = 1 if su1 in high_energy_numbers else 0.8
        intensity2 = 1 if su2 in high_energy_numbers else 0.8
        
        # Calculate compatibility
        energy_compatibility = (energy1 + energy2) / 2 * 100
        intensity_compatibility = (intensity1 + intensity2) / 2 * 100
        
        overall_sexual_energy = (energy_compatibility * 0.6 + intensity_compatibility * 0.4)
        
        return {
            'score': round(overall_sexual_energy),
            'level': 'high' if overall_sexual_energy >= 75 else 'moderate' if overall_sexual_energy >= 50 else 'low',
            'energy_compatibility': round(energy_compatibility),
            'intensity_compatibility': round(intensity_compatibility),
            'description': self._get_sexual_energy_description(overall_sexual_energy, lp1, lp2)
        }
    
    def _calculate_marriage_harmony(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate marriage harmony score."""
        lp1 = profile_1.get('life_path_number', 1)
        lp2 = profile_2.get('life_path_number', 1)
        d1 = profile_1.get('destiny_number', 1)
        d2 = profile_2.get('destiny_number', 1)
        su1 = profile_1.get('soul_urge_number', 1)
        su2 = profile_2.get('soul_urge_number', 1)
        
        # Harmony factors
        life_path_harmony = self._calculate_number_harmony(lp1, lp2)
        destiny_harmony = self._calculate_number_harmony(d1, d2)
        soul_harmony = self._calculate_number_harmony(su1, su2)
        
        # Weighted average
        harmony_score = (
            life_path_harmony * 0.4 +
            destiny_harmony * 0.35 +
            soul_harmony * 0.25
        )
        
        return {
            'score': round(harmony_score),
            'level': 'excellent' if harmony_score >= 80 else 'good' if harmony_score >= 65 else 'moderate' if harmony_score >= 50 else 'challenging',
            'life_path_harmony': life_path_harmony,
            'destiny_harmony': destiny_harmony,
            'soul_harmony': soul_harmony,
            'description': self._get_marriage_harmony_description(harmony_score)
        }
    
    def _calculate_breakup_risk(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate breakup risk factors."""
        lp1 = profile_1.get('life_path_number', 1)
        lp2 = profile_2.get('life_path_number', 1)
        
        # High breakup risk combinations
        high_risk_pairs = [
            (1, 1),  # Two leaders
            (5, 5),  # Two freedom seekers
            (7, 7),  # Two introverts
            (1, 5),  # Leader + Freedom seeker
            (4, 5),  # Stability + Change
        ]
        
        risk_score = 30  # Base risk
        
        # Check for high-risk pairs
        pair = tuple(sorted([lp1, lp2]))
        if pair in high_risk_pairs:
            risk_score += 25
        
        # Check for challenging differences
        diff = abs(lp1 - lp2)
        if diff >= 7:
            risk_score += 15
        elif diff >= 5:
            risk_score += 10
        
        # Check compatibility
        compatibility = self.compatibility_analyzer.calculate_compatibility_scores(
            profile_1,
            profile_2,
            relationship_type='romantic'
        )
        
        overall_score = compatibility.get('overall_score', 50)
        if overall_score < 40:
            risk_score += 20
        elif overall_score < 50:
            risk_score += 10
        
        risk_score = min(100, risk_score)
        
        return {
            'score': risk_score,
            'level': 'high' if risk_score >= 60 else 'moderate' if risk_score >= 40 else 'low',
            'risk_factors': self._identify_risk_factors(profile_1, profile_2),
            'mitigation_strategies': self._get_mitigation_strategies(risk_score, profile_1, profile_2)
        }
    
    def _calculate_communication_style(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate communication style compatibility."""
        pn1 = profile_1.get('personality_number', 1)
        pn2 = profile_2.get('personality_number', 1)
        
        # Communication styles by number
        styles = {
            1: 'direct', 2: 'diplomatic', 3: 'expressive', 4: 'structured',
            5: 'dynamic', 6: 'nurturing', 7: 'analytical', 8: 'authoritative', 9: 'compassionate'
        }
        
        style1 = styles.get(pn1, 'balanced')
        style2 = styles.get(pn2, 'balanced')
        
        # Calculate compatibility
        diff = abs(pn1 - pn2)
        compatibility = max(0, 100 - diff * 10)
        
        return {
            'person_1_style': style1,
            'person_2_style': style2,
            'compatibility': round(compatibility),
            'description': self._get_communication_description(style1, style2, compatibility)
        }
    
    def _calculate_financial_compatibility(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate financial compatibility."""
        d1 = profile_1.get('destiny_number', 1)
        d2 = profile_2.get('destiny_number', 1)
        
        # Financial numbers
        financial_numbers = {4, 8, 22}
        
        financial1 = 1 if d1 in financial_numbers else 0.6
        financial2 = 1 if d2 in financial_numbers else 0.6
        
        compatibility = ((financial1 + financial2) / 2) * 100
        
        return {
            'score': round(compatibility),
            'level': 'high' if compatibility >= 75 else 'moderate' if compatibility >= 50 else 'low',
            'description': self._get_financial_description(d1, d2, compatibility)
        }
    
    def _calculate_emotional_compatibility(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate emotional compatibility."""
        su1 = profile_1.get('soul_urge_number', 1)
        su2 = profile_2.get('soul_urge_number', 1)
        
        # Emotional numbers
        emotional_numbers = {2, 6, 9}
        
        emotional1 = 1 if su1 in emotional_numbers else 0.7
        emotional2 = 1 if su2 in emotional_numbers else 0.7
        
        harmony = self._calculate_number_harmony(su1, su2)
        
        compatibility = (harmony * 0.6 + ((emotional1 + emotional2) / 2) * 100 * 0.4)
        
        return {
            'score': round(compatibility),
            'level': 'high' if compatibility >= 75 else 'moderate' if compatibility >= 50 else 'low',
            'description': self._get_emotional_description(su1, su2, compatibility)
        }
    
    def _calculate_number_harmony(self, num1: int, num2: int) -> float:
        """Calculate harmony between two numbers."""
        diff = abs(num1 - num2)
        
        if diff == 0:
            return 100
        elif diff <= 2:
            return 85
        elif diff <= 4:
            return 70
        elif diff <= 6:
            return 55
        else:
            return 40
    
    def _calculate_year_harmony(
        self,
        py1: int,
        py2: int,
        base_harmony: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate harmony for a specific year."""
        year_harmony = self._calculate_number_harmony(py1, py2)
        
        # Combine with base harmony
        combined_score = (base_harmony['score'] * 0.7 + year_harmony * 0.3)
        
        return {
            'score': round(combined_score),
            'level': 'excellent' if combined_score >= 80 else 'good' if combined_score >= 65 else 'moderate' if combined_score >= 50 else 'challenging',
            'themes': self._get_year_themes(py1, py2)
        }
    
    def _calculate_harmony_trend(self, cycles: List[Dict[str, Any]]) -> str:
        """Calculate overall trend in harmony."""
        if not cycles:
            return 'stable'
        
        scores = [c['harmony_score'] for c in cycles]
        first_half = sum(scores[:len(scores)//2]) / (len(scores)//2)
        second_half = sum(scores[len(scores)//2:]) / (len(scores) - len(scores)//2)
        
        if second_half > first_half + 5:
            return 'improving'
        elif second_half < first_half - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _generate_relationship_insights(
        self,
        compatibility_scores: Dict[str, Any],
        sexual_energy: Dict[str, Any],
        marriage_harmony: Dict[str, Any],
        breakup_risk: Dict[str, Any]
    ) -> List[str]:
        """Generate relationship insights."""
        insights = []
        
        overall = compatibility_scores.get('overall_score', 0)
        if overall >= 80:
            insights.append('Excellent overall compatibility - strong foundation for a lasting relationship.')
        elif overall >= 65:
            insights.append('Good compatibility - with understanding and effort, this relationship can thrive.')
        elif overall < 50:
            insights.append('Challenging compatibility - requires significant effort and understanding.')
        
        if sexual_energy['score'] >= 75:
            insights.append('Strong sexual chemistry and physical attraction.')
        elif sexual_energy['score'] < 50:
            insights.append('Lower sexual energy - focus on emotional and intellectual connection.')
        
        if marriage_harmony['score'] >= 80:
            insights.append('Excellent marriage potential - strong harmony in core values.')
        elif marriage_harmony['score'] < 50:
            insights.append('Marriage may require extra effort and compromise.')
        
        if breakup_risk['score'] >= 60:
            insights.append('Higher breakup risk - focus on communication and understanding.')
        
        return insights
    
    def _generate_recommendations(
        self,
        compatibility_scores: Dict[str, Any],
        sexual_energy: Dict[str, Any],
        marriage_harmony: Dict[str, Any],
        breakup_risk: Dict[str, Any]
    ) -> List[str]:
        """Generate relationship recommendations."""
        recommendations = []
        
        if compatibility_scores.get('overall_score', 0) < 60:
            recommendations.append('Focus on building understanding and respect for each other\'s differences.')
        
        if sexual_energy['score'] < 60:
            recommendations.append('Work on maintaining physical intimacy and connection.')
        
        if marriage_harmony['score'] < 65:
            recommendations.append('Before marriage, ensure alignment on core values and life goals.')
        
        if breakup_risk['score'] >= 60:
            recommendations.append('Prioritize open communication and conflict resolution.')
            recommendations.append('Consider relationship counseling or numerology-based remedies.')
        
        return recommendations
    
    def _identify_risk_factors(
        self,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> List[str]:
        """Identify specific risk factors."""
        risks = []
        lp1 = profile_1.get('life_path_number', 1)
        lp2 = profile_2.get('life_path_number', 1)
        
        if lp1 == 1 and lp2 == 1:
            risks.append('Both are natural leaders - power struggles may occur')
        if lp1 == 5 or lp2 == 5:
            risks.append('Freedom-seeking nature may cause commitment issues')
        if abs(lp1 - lp2) >= 7:
            risks.append('Significant personality differences require extra understanding')
        
        return risks
    
    def _get_mitigation_strategies(
        self,
        risk_score: float,
        profile_1: Dict[str, Any],
        profile_2: Dict[str, Any]
    ) -> List[str]:
        """Get strategies to mitigate breakup risk."""
        strategies = []
        
        if risk_score >= 60:
            strategies.append('Establish clear communication protocols')
            strategies.append('Set boundaries and respect each other\'s space')
            strategies.append('Focus on shared goals and values')
            strategies.append('Consider professional relationship counseling')
        
        return strategies
    
    def _get_sexual_energy_description(self, score: float, lp1: int, lp2: int) -> str:
        """Get sexual energy description."""
        if score >= 75:
            return f'High sexual chemistry between Life Path {lp1} and {lp2}. Strong physical attraction and passion.'
        elif score >= 50:
            return f'Moderate sexual energy. Physical connection can be developed through emotional intimacy.'
        else:
            return f'Lower sexual energy. Focus on building emotional and intellectual connection first.'
    
    def _get_marriage_harmony_description(self, score: float) -> str:
        """Get marriage harmony description."""
        if score >= 80:
            return 'Excellent marriage compatibility. Strong foundation for a harmonious union.'
        elif score >= 65:
            return 'Good marriage potential. With understanding and compromise, a successful marriage is possible.'
        elif score >= 50:
            return 'Moderate marriage compatibility. Requires effort and understanding from both partners.'
        else:
            return 'Challenging marriage compatibility. Significant effort and professional guidance may be needed.'
    
    def _get_communication_description(self, style1: str, style2: str, compatibility: float) -> str:
        """Get communication style description."""
        if compatibility >= 75:
            return f'Compatible communication styles ({style1} and {style2}). Easy understanding and connection.'
        elif compatibility >= 50:
            return f'Different but complementary styles ({style1} and {style2}). Requires understanding and adaptation.'
        else:
            return f'Challenging communication styles ({style1} and {style2}). Focus on active listening and patience.'
    
    def _get_financial_description(self, d1: int, d2: int, compatibility: float) -> str:
        """Get financial compatibility description."""
        if compatibility >= 75:
            return 'Strong financial compatibility. Similar values and approaches to money.'
        elif compatibility >= 50:
            return 'Moderate financial compatibility. Open communication about finances is important.'
        else:
            return 'Different financial approaches. Establish clear financial agreements and goals.'
    
    def _get_emotional_description(self, su1: int, su2: int, compatibility: float) -> str:
        """Get emotional compatibility description."""
        if compatibility >= 75:
            return 'Strong emotional connection. Deep understanding and empathy between partners.'
        elif compatibility >= 50:
            return 'Moderate emotional compatibility. Emotional intimacy can be developed over time.'
        else:
            return 'Different emotional needs. Focus on understanding and meeting each other\'s emotional requirements.'
    
    def _get_year_themes(self, py1: int, py2: int) -> List[str]:
        """Get themes for a year based on personal years."""
        themes = []
        
        if py1 == py2:
            themes.append('Synchronized growth and shared experiences')
        elif abs(py1 - py2) <= 2:
            themes.append('Harmonious personal development')
        else:
            themes.append('Different growth phases - understanding needed')
        
        return themes

