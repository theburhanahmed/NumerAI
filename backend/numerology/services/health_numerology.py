"""
Health numerology service for health cycles, stress/vitality numbers, and medical timing.
"""
from typing import Dict, List, Any, Optional
from datetime import date, timedelta
from numerology.numerology import NumerologyCalculator
from numerology.services.timing_numerology import TimingNumerologyService


class HealthNumerologyService:
    """Service for health-related numerology analysis."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
        self.timing_service = TimingNumerologyService(calculation_system)
    
    def calculate_health_cycles(
        self,
        birth_date: date,
        full_name: str,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate health risk cycles and vitality periods.
        
        Args:
            birth_date: Date of birth
            full_name: Full name
            start_year: Start year for analysis
            end_year: End year for analysis
            
        Returns:
            Health cycle analysis
        """
        if not start_year:
            start_year = date.today().year
        if not end_year:
            end_year = start_year + 9
        
        # Calculate Life Path
        life_path = self.calculator.calculate_life_path_number(birth_date)
        
        # Calculate health numbers
        health_number = self._calculate_health_number(birth_date, full_name)
        vitality_number = self._calculate_vitality_number(birth_date, full_name)
        stress_number = self._calculate_stress_number(birth_date, full_name)
        
        # Calculate yearly health windows
        yearly_health = []
        for year in range(start_year, end_year + 1):
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            health_score = self._calculate_year_health_score(personal_year, health_number)
            
            yearly_health.append({
                'year': year,
                'personal_year': personal_year,
                'health_score': health_score,
                'risk_level': self._get_risk_level(health_score),
                'vitality_level': self._calculate_vitality_level(personal_year, vitality_number),
                'stress_level': self._calculate_stress_level(personal_year, stress_number),
                'recommendations': self._get_year_health_recommendations(personal_year, health_score)
            })
        
        # Identify health risk periods
        risk_periods = [y for y in yearly_health if y['health_score'] < 50]
        
        # Identify vitality periods
        vitality_periods = [y for y in yearly_health if y['vitality_level'] == 'high']
        
        return {
            'life_path': life_path,
            'health_number': health_number,
            'vitality_number': vitality_number,
            'stress_number': stress_number,
            'yearly_health_analysis': yearly_health,
            'risk_periods': risk_periods,
            'vitality_periods': vitality_periods,
            'overall_health_trend': self._calculate_health_trend(yearly_health),
            'health_recommendations': self._generate_health_recommendations(health_number, vitality_number, stress_number)
        }
    
    def calculate_medical_timing(
        self,
        birth_date: date,
        procedure_type: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Calculate optimal timing for medical procedures.
        
        Args:
            birth_date: Date of birth
            procedure_type: Type of procedure (surgery, dental, checkup, therapy)
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            Optimal medical timing analysis
        """
        # Use timing service for best dates
        best_dates = self.timing_service.find_best_dates(
            birth_date,
            'surgery',  # Medical procedures use surgery timing
            start_date,
            end_date,
            limit=10
        )
        
        # Filter and enhance for medical context
        from datetime import datetime
        medical_dates = []
        for date_info in best_dates['best_dates']:
            target_date = datetime.strptime(date_info['date'], '%Y-%m-%d').date()
            
            # Calculate additional medical factors
            health_score = self._calculate_date_health_score(birth_date, target_date)
            recovery_potential = self._calculate_recovery_potential(birth_date, target_date)
            
            medical_dates.append({
                **date_info,
                'health_score': health_score,
                'recovery_potential': recovery_potential,
                'medical_recommendations': self._get_medical_recommendations(
                    procedure_type,
                    date_info['personal_day'],
                    health_score
                )
            })
        
        # Find dates to avoid
        danger_dates = self.timing_service.find_danger_dates(
            birth_date,
            start_date,
            end_date
        )
        
        # Filter danger dates for medical context
        medical_danger_dates = [
            d for d in danger_dates['danger_dates']
            if d['score'] < 35  # Very low scores for medical procedures
        ]
        
        return {
            'procedure_type': procedure_type,
            'optimal_dates': medical_dates,
            'dates_to_avoid': medical_danger_dates,
            'general_recommendations': self._get_procedure_recommendations(procedure_type)
        }
    
    def calculate_emotional_vulnerabilities(
        self,
        birth_date: date,
        full_name: str
    ) -> Dict[str, Any]:
        """
        Calculate emotional vulnerabilities based on numerology.
        
        Args:
            birth_date: Date of birth
            full_name: Full name
            
        Returns:
            Emotional vulnerability analysis
        """
        # Calculate key numbers
        life_path = self.calculator.calculate_life_path_number(birth_date)
        soul_urge = self.calculator.calculate_soul_urge_number(full_name)
        personality = self.calculator.calculate_personality_number(full_name)
        
        # Identify vulnerabilities
        vulnerabilities = []
        
        # Life Path vulnerabilities
        lp_vulnerabilities = {
            1: 'Tendency to overwork and ignore health',
            2: 'Sensitivity to criticism and conflict',
            3: 'Emotional overwhelm and scattered energy',
            4: 'Stress from rigidity and resistance to change',
            5: 'Anxiety from too much change and instability',
            6: 'Over-responsibility leading to burnout',
            7: 'Isolation and overthinking',
            8: 'Stress from material pressures',
            9: 'Emotional exhaustion from giving too much'
        }
        
        if life_path in lp_vulnerabilities:
            vulnerabilities.append({
                'source': 'Life Path',
                'number': life_path,
                'vulnerability': lp_vulnerabilities[life_path],
                'severity': 'moderate'
            })
        
        # Soul Urge vulnerabilities
        su_vulnerabilities = {
            2: 'Deep need for harmony can cause emotional suppression',
            4: 'Need for stability can cause anxiety when disrupted',
            5: 'Need for freedom can cause restlessness',
            7: 'Need for solitude can cause isolation',
            9: 'Need to help others can cause self-neglect'
        }
        
        if soul_urge in su_vulnerabilities:
            vulnerabilities.append({
                'source': 'Soul Urge',
                'number': soul_urge,
                'vulnerability': su_vulnerabilities[soul_urge],
                'severity': 'moderate'
            })
        
        # Personality vulnerabilities
        pn_vulnerabilities = {
            1: 'Independence can lead to isolation',
            3: 'Expression can lead to emotional volatility',
            5: 'Adventure can lead to instability',
            7: 'Analysis can lead to overthinking'
        }
        
        if personality in pn_vulnerabilities:
            vulnerabilities.append({
                'source': 'Personality',
                'number': personality,
                'vulnerability': pn_vulnerabilities[personality],
                'severity': 'low'
            })
        
        # Calculate stress triggers
        stress_triggers = self._identify_stress_triggers(life_path, soul_urge, personality)
        
        # Generate coping strategies
        coping_strategies = self._generate_coping_strategies(vulnerabilities, stress_triggers)
        
        return {
            'life_path': life_path,
            'soul_urge': soul_urge,
            'personality': personality,
            'vulnerabilities': vulnerabilities,
            'stress_triggers': stress_triggers,
            'coping_strategies': coping_strategies,
            'emotional_strengths': self._identify_emotional_strengths(life_path, soul_urge, personality)
        }
    
    def _calculate_health_number(self, birth_date: date, full_name: str) -> int:
        """Calculate health number from birth date."""
        # Health number = reduce(month + day)
        month = self.calculator._reduce_to_single_digit(birth_date.month, preserve_master=False)
        day = self.calculator._reduce_to_single_digit(birth_date.day, preserve_master=False)
        health_sum = month + day
        return self.calculator._reduce_to_single_digit(health_sum, preserve_master=True)
    
    def _calculate_vitality_number(self, birth_date: date, full_name: str) -> int:
        """Calculate vitality number."""
        # Vitality = Life Path + Health Number
        life_path = self.calculator.calculate_life_path_number(birth_date)
        health_number = self._calculate_health_number(birth_date, full_name)
        vitality_sum = life_path + health_number
        return self.calculator._reduce_to_single_digit(vitality_sum, preserve_master=True)
    
    def _calculate_stress_number(self, birth_date: date, full_name: str) -> int:
        """Calculate stress number."""
        # Stress = Challenges from birth date
        challenges = self.calculator.calculate_challenges(birth_date)
        # Use first challenge as stress indicator
        return challenges[0] if challenges else 1
    
    def _calculate_year_health_score(self, personal_year: int, health_number: int) -> float:
        """Calculate health score for a year."""
        # Base score
        base_score = 70
        
        # Adjust based on personal year alignment with health number
        diff = abs(personal_year - health_number)
        
        if diff == 0:
            base_score += 20  # Perfect alignment
        elif diff <= 2:
            base_score += 10  # Good alignment
        elif diff <= 4:
            base_score += 0  # Neutral
        elif diff <= 6:
            base_score -= 10  # Poor alignment
        else:
            base_score -= 20  # Very poor alignment
        
        # Adjust for challenging personal years
        challenging_years = {5, 7}  # Change and introspection can be stressful
        if personal_year in challenging_years:
            base_score -= 5
        
        return max(0, min(100, base_score))
    
    def _calculate_vitality_level(self, personal_year: int, vitality_number: int) -> str:
        """Calculate vitality level for a year."""
        diff = abs(personal_year - vitality_number)
        
        if diff <= 1:
            return 'high'
        elif diff <= 3:
            return 'moderate'
        else:
            return 'low'
    
    def _calculate_stress_level(self, personal_year: int, stress_number: int) -> str:
        """Calculate stress level for a year."""
        diff = abs(personal_year - stress_number)
        
        if diff <= 1:
            return 'high'  # Personal year aligns with stress number
        elif diff <= 3:
            return 'moderate'
        else:
            return 'low'
    
    def _calculate_date_health_score(self, birth_date: date, target_date: date) -> float:
        """Calculate health score for a specific date."""
        personal_day = self.calculator.calculate_personal_day_number(birth_date, target_date)
        personal_month = self.calculator.calculate_personal_month_number(
            birth_date,
            target_date.year,
            target_date.month
        )
        
        # Health-supportive days
        health_days = {4, 6, 7}  # Stability, service, analysis
        health_months = {4, 6, 9}  # Stability, service, completion
        
        score = 70  # Base
        
        if personal_day in health_days:
            score += 15
        if personal_month in health_months:
            score += 10
        
        # Avoid change days for medical procedures
        if personal_day == 5:
            score -= 20
        
        return max(0, min(100, score))
    
    def _calculate_recovery_potential(self, birth_date: date, target_date: date) -> Dict[str, Any]:
        """Calculate recovery potential for a date."""
        personal_day = self.calculator.calculate_personal_day_number(birth_date, target_date)
        
        recovery_scores = {
            1: 70, 2: 80, 3: 75, 4: 90, 5: 60,
            6: 85, 7: 80, 8: 75, 9: 80
        }
        
        score = recovery_scores.get(personal_day, 70)
        
        return {
            'score': score,
            'level': 'high' if score >= 80 else 'moderate' if score >= 70 else 'low',
            'estimated_recovery_time': self._estimate_recovery_time(score)
        }
    
    def _estimate_recovery_time(self, score: float) -> str:
        """Estimate recovery time based on score."""
        if score >= 85:
            return 'Faster than average recovery expected'
        elif score >= 75:
            return 'Normal recovery time expected'
        elif score >= 65:
            return 'Slightly longer recovery may be needed'
        else:
            return 'Extended recovery time possible - take extra care'
    
    def _get_risk_level(self, score: float) -> str:
        """Get risk level from score."""
        if score >= 75:
            return 'low'
        elif score >= 60:
            return 'moderate'
        elif score >= 45:
            return 'elevated'
        else:
            return 'high'
    
    def _get_year_health_recommendations(self, personal_year: int, health_score: float) -> List[str]:
        """Get health recommendations for a year."""
        recommendations = []
        
        if health_score < 50:
            recommendations.append('Focus on preventive health measures')
            recommendations.append('Schedule regular health checkups')
            recommendations.append('Manage stress levels carefully')
        
        if personal_year == 5:
            recommendations.append('Be cautious with major lifestyle changes')
            recommendations.append('Maintain stability in health routines')
        
        if personal_year == 7:
            recommendations.append('Focus on rest and introspection')
            recommendations.append('Consider alternative healing methods')
        
        if health_score >= 75:
            recommendations.append('Good year for health improvements')
            recommendations.append('Ideal time for starting new health routines')
        
        return recommendations
    
    def _calculate_health_trend(self, yearly_health: List[Dict[str, Any]]) -> str:
        """Calculate overall health trend."""
        if not yearly_health:
            return 'stable'
        
        scores = [y['health_score'] for y in yearly_health]
        first_half = sum(scores[:len(scores)//2]) / (len(scores)//2)
        second_half = sum(scores[len(scores)//2:]) / (len(scores) - len(scores)//2)
        
        if second_half > first_half + 5:
            return 'improving'
        elif second_half < first_half - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _generate_health_recommendations(
        self,
        health_number: int,
        vitality_number: int,
        stress_number: int
    ) -> List[str]:
        """Generate general health recommendations."""
        recommendations = []
        
        # Health number recommendations
        health_recommendations = {
            1: 'Focus on physical activity and leadership in health',
            2: 'Prioritize balance and harmony in health routines',
            3: 'Engage in creative and expressive health activities',
            4: 'Maintain structured and consistent health routines',
            5: 'Balance activity with rest, avoid overexertion',
            6: 'Focus on family health and service to others',
            7: 'Emphasize mental health and spiritual practices',
            8: 'Balance work and health, avoid overwork',
            9: 'Focus on holistic health and helping others'
        }
        
        if health_number in health_recommendations:
            recommendations.append(health_recommendations[health_number])
        
        # Stress management
        if stress_number in [5, 7]:
            recommendations.append('Implement regular stress management techniques')
            recommendations.append('Consider meditation or mindfulness practices')
        
        # Vitality enhancement
        if vitality_number in [1, 4, 8]:
            recommendations.append('Focus on building physical strength and endurance')
        elif vitality_number in [2, 6, 9]:
            recommendations.append('Emphasize emotional and mental well-being')
        
        return recommendations
    
    def _get_medical_recommendations(
        self,
        procedure_type: str,
        personal_day: int,
        health_score: float
    ) -> List[str]:
        """Get medical recommendations for a procedure date."""
        recommendations = []
        
        if health_score < 60:
            recommendations.append('Consider postponing if not urgent')
            recommendations.append('Ensure all pre-procedure preparations are complete')
        
        if personal_day == 4:
            recommendations.append('Excellent day for procedures requiring stability')
        elif personal_day == 6:
            recommendations.append('Good day for procedures requiring care and attention')
        elif personal_day == 5:
            recommendations.append('Avoid if possible - day of change and instability')
        
        if procedure_type == 'surgery':
            recommendations.append('Ensure adequate rest before and after')
            recommendations.append('Follow all pre-surgical instructions carefully')
        elif procedure_type == 'therapy':
            recommendations.append('Good day for emotional healing work')
        
        return recommendations
    
    def _get_procedure_recommendations(self, procedure_type: str) -> List[str]:
        """Get general recommendations for procedure type."""
        recommendations = {
            'surgery': [
                'Choose dates with Personal Day 4, 6, or 7',
                'Avoid Personal Day 5 for major surgeries',
                'Ensure Personal Month supports healing (4, 6, or 9)'
            ],
            'dental': [
                'Personal Day 4 or 6 are ideal',
                'Avoid days with high stress numbers',
                'Schedule during stable Personal Months'
            ],
            'checkup': [
                'Any stable day is suitable',
                'Personal Day 4 or 6 preferred for thoroughness',
                'Avoid Personal Day 5 if possible'
            ],
            'therapy': [
                'Personal Day 2, 6, or 7 are excellent',
                'Personal Month 2 or 7 support emotional work',
                'Avoid high-stress periods'
            ]
        }
        
        return recommendations.get(procedure_type, [
            'Choose dates with favorable Personal Day numbers',
            'Align with stable Personal Months',
            'Avoid high-stress periods'
        ])
    
    def _identify_stress_triggers(
        self,
        life_path: int,
        soul_urge: int,
        personality: int
    ) -> List[str]:
        """Identify stress triggers."""
        triggers = []
        
        if life_path == 1:
            triggers.append('Overwork and taking on too much responsibility')
        if life_path == 2:
            triggers.append('Conflict and disharmony in relationships')
        if life_path == 4:
            triggers.append('Unexpected changes and lack of structure')
        if life_path == 5:
            triggers.append('Restriction and lack of freedom')
        if life_path == 7:
            triggers.append('Lack of alone time and constant social demands')
        
        if soul_urge == 2:
            triggers.append('Feeling unappreciated or unsupported')
        if soul_urge == 4:
            triggers.append('Instability and uncertainty')
        
        return triggers
    
    def _generate_coping_strategies(
        self,
        vulnerabilities: List[Dict[str, Any]],
        stress_triggers: List[str]
    ) -> List[str]:
        """Generate coping strategies."""
        strategies = []
        
        strategies.append('Practice regular meditation or mindfulness')
        strategies.append('Maintain a balanced daily routine')
        strategies.append('Ensure adequate rest and sleep')
        strategies.append('Engage in activities that align with your Life Path')
        
        if any(v['source'] == 'Life Path' and v['number'] in [1, 8] for v in vulnerabilities):
            strategies.append('Schedule regular breaks and downtime')
            strategies.append('Delegate responsibilities when possible')
        
        if any(v['source'] == 'Soul Urge' and v['number'] in [2, 6, 9] for v in vulnerabilities):
            strategies.append('Set boundaries to avoid over-giving')
            strategies.append('Practice self-care and self-compassion')
        
        return strategies
    
    def _identify_emotional_strengths(
        self,
        life_path: int,
        soul_urge: int,
        personality: int
    ) -> List[str]:
        """Identify emotional strengths."""
        strengths = []
        
        strengths_map = {
            1: 'Strong sense of self and independence',
            2: 'Natural empathy and understanding',
            3: 'Emotional expression and creativity',
            4: 'Emotional stability and reliability',
            5: 'Adaptability and resilience',
            6: 'Nurturing and caring nature',
            7: 'Emotional depth and wisdom',
            8: 'Emotional strength and determination',
            9: 'Compassion and humanitarian spirit'
        }
        
        if life_path in strengths_map:
            strengths.append(strengths_map[life_path])
        if soul_urge in strengths_map:
            strengths.append(strengths_map[soul_urge])
        
        return strengths
    
    def identify_health_risk_cycles(
        self,
        birth_date: date,
        full_name: str,
        years_ahead: int = 10
    ) -> Dict[str, Any]:
        """
        Identify health risk cycles over a period.
        
        Args:
            birth_date: Date of birth
            full_name: Full name
            years_ahead: Number of years to analyze (default 10)
            
        Returns:
            Dictionary with risk cycles and warnings
        """
        current_year = date.today().year
        health_cycles = self.calculate_health_cycles(
            birth_date,
            full_name,
            current_year,
            current_year + years_ahead
        )
        
        risk_periods = []
        for year_data in health_cycles['yearly_health_analysis']:
            if year_data['risk_level'] in ['elevated', 'high']:
                risk_periods.append({
                    'year': year_data['year'],
                    'risk_level': year_data['risk_level'],
                    'health_score': year_data['health_score'],
                    'stress_level': year_data['stress_level'],
                    'warnings': self._generate_risk_warnings(year_data),
                    'preventive_measures': self._get_preventive_measures(year_data)
                })
        
        return {
            'risk_periods': risk_periods,
            'total_risk_periods': len(risk_periods),
            'highest_risk_year': max(risk_periods, key=lambda x: x['health_score']) if risk_periods else None,
            'recommendations': self._generate_risk_cycle_recommendations(risk_periods)
        }
    
    def calculate_wellness_windows(
        self,
        birth_date: date,
        full_name: str,
        years_ahead: int = 10
    ) -> Dict[str, Any]:
        """
        Calculate optimal wellness windows for health improvements.
        
        Args:
            birth_date: Date of birth
            full_name: Full name
            years_ahead: Number of years to analyze (default 10)
            
        Returns:
            Dictionary with wellness windows
        """
        current_year = date.today().year
        health_cycles = self.calculate_health_cycles(
            birth_date,
            full_name,
            current_year,
            current_year + years_ahead
        )
        
        wellness_windows = []
        for year_data in health_cycles['yearly_health_analysis']:
            if year_data['health_score'] >= 75 and year_data['vitality_level'] == 'high':
                wellness_windows.append({
                    'year': year_data['year'],
                    'health_score': year_data['health_score'],
                    'vitality_level': year_data['vitality_level'],
                    'personal_year': year_data['personal_year'],
                    'optimal_activities': self._get_optimal_wellness_activities(year_data),
                    'timing_guidance': self._get_wellness_timing_guidance(year_data)
                })
        
        return {
            'wellness_windows': wellness_windows,
            'total_windows': len(wellness_windows),
            'next_wellness_window': next((w for w in wellness_windows if w['year'] >= current_year), None),
            'recommendations': self._generate_wellness_recommendations(wellness_windows)
        }
    
    def analyze_health_compatibility(
        self,
        birth_date1: date,
        full_name1: str,
        birth_date2: date,
        full_name2: str
    ) -> Dict[str, Any]:
        """
        Analyze health compatibility between two people.
        
        Args:
            birth_date1: First person's birth date
            full_name1: First person's full name
            birth_date2: Second person's birth date
            full_name2: Second person's full name
            
        Returns:
            Dictionary with health compatibility analysis
        """
        health1 = self.calculate_health_cycles(birth_date1, full_name1)
        health2 = self.calculate_health_cycles(birth_date2, full_name2)
        
        # Compare health numbers
        health_match = health1['health_number'] == health2['health_number']
        vitality_match = health1['vitality_number'] == health2['vitality_number']
        stress_match = health1['stress_number'] == health2['stress_number']
        
        # Calculate compatibility score
        compatibility_score = 50  # Base score
        
        if health_match:
            compatibility_score += 20
        if vitality_match:
            compatibility_score += 15
        if stress_match:
            compatibility_score += 15
        
        # Check for complementary patterns
        health_diff = abs(health1['health_number'] - health2['health_number'])
        if health_diff in [1, 8]:  # Complementary numbers
            compatibility_score += 10
        
        compatibility_score = min(100, compatibility_score)
        
        return {
            'person1': {
                'health_number': health1['health_number'],
                'vitality_number': health1['vitality_number'],
                'stress_number': health1['stress_number']
            },
            'person2': {
                'health_number': health2['health_number'],
                'vitality_number': health2['vitality_number'],
                'stress_number': health2['stress_number']
            },
            'compatibility_score': compatibility_score,
            'matches': {
                'health': health_match,
                'vitality': vitality_match,
                'stress': stress_match
            },
            'analysis': self._generate_health_compatibility_analysis(
                health1, health2, compatibility_score
            ),
            'recommendations': self._get_health_compatibility_recommendations(
                health1, health2, compatibility_score
            )
        }
    
    def _generate_risk_warnings(self, year_data: Dict[str, Any]) -> List[str]:
        """Generate warnings for risk periods."""
        warnings = []
        
        if year_data['risk_level'] == 'high':
            warnings.append('High risk period - extra caution recommended')
            warnings.append('Schedule regular health checkups')
            warnings.append('Monitor stress levels closely')
        elif year_data['risk_level'] == 'elevated':
            warnings.append('Elevated risk - be mindful of health')
            warnings.append('Maintain preventive health measures')
        
        if year_data['stress_level'] == 'high':
            warnings.append('High stress period - prioritize stress management')
        
        return warnings
    
    def _get_preventive_measures(self, year_data: Dict[str, Any]) -> List[str]:
        """Get preventive measures for risk periods."""
        measures = []
        
        measures.append('Maintain regular exercise routine')
        measures.append('Follow a balanced diet')
        measures.append('Get adequate sleep (7-9 hours)')
        measures.append('Schedule regular health screenings')
        
        if year_data['stress_level'] == 'high':
            measures.append('Practice stress reduction techniques daily')
            measures.append('Consider meditation or yoga')
            measures.append('Limit exposure to stressful situations')
        
        return measures
    
    def _generate_risk_cycle_recommendations(self, risk_periods: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on risk cycles."""
        recommendations = []
        
        if not risk_periods:
            recommendations.append('No major risk periods identified in the analyzed timeframe')
            return recommendations
        
        recommendations.append(f'{len(risk_periods)} risk period(s) identified - plan accordingly')
        recommendations.append('Focus on preventive health measures during risk periods')
        recommendations.append('Consider scheduling important health procedures during wellness windows')
        
        return recommendations
    
    def _get_optimal_wellness_activities(self, year_data: Dict[str, Any]) -> List[str]:
        """Get optimal wellness activities for wellness windows."""
        activities = []
        
        personal_year = year_data['personal_year']
        
        if personal_year in [1, 4, 8]:
            activities.append('Start new fitness programs')
            activities.append('Build physical strength and endurance')
        elif personal_year in [2, 6, 9]:
            activities.append('Focus on emotional and mental wellness')
            activities.append('Engage in healing and nurturing activities')
        elif personal_year in [3, 5, 7]:
            activities.append('Explore new wellness modalities')
            activities.append('Balance activity with rest')
        
        activities.append('Ideal time for health improvements')
        activities.append('Good period for establishing new health routines')
        
        return activities
    
    def _get_wellness_timing_guidance(self, year_data: Dict[str, Any]) -> str:
        """Get timing guidance for wellness windows."""
        return f"Year {year_data['year']} is an excellent wellness window with high vitality and favorable health scores. This is an ideal time to focus on health improvements, start new wellness routines, and make positive lifestyle changes."
    
    def _generate_wellness_recommendations(self, wellness_windows: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on wellness windows."""
        recommendations = []
        
        if not wellness_windows:
            recommendations.append('Plan wellness activities during stable health periods')
            return recommendations
        
        recommendations.append(f'{len(wellness_windows)} optimal wellness window(s) identified')
        recommendations.append('Schedule major health improvements during these windows')
        recommendations.append('Use wellness windows to establish lasting health habits')
        
        return recommendations
    
    def _generate_health_compatibility_analysis(
        self,
        health1: Dict[str, Any],
        health2: Dict[str, Any],
        score: int
    ) -> str:
        """Generate health compatibility analysis text."""
        parts = []
        
        if health1['health_number'] == health2['health_number']:
            parts.append('You share the same health number - similar health patterns and needs.')
        
        if health1['vitality_number'] == health2['vitality_number']:
            parts.append('Your vitality numbers match - compatible energy levels.')
        
        if health1['stress_number'] == health2['stress_number']:
            parts.append('You have similar stress patterns - can support each other effectively.')
        
        if score >= 80:
            parts.append('Excellent health compatibility - you can support each other\'s wellness journey.')
        elif score >= 60:
            parts.append('Good health compatibility - you work well together on health goals.')
        elif score >= 40:
            parts.append('Moderate health compatibility - understanding each other\'s health needs will be important.')
        else:
            parts.append('Different health patterns - communication about health needs will be essential.')
        
        return ' '.join(parts) if parts else 'Health compatibility analysis available.'
    
    def _get_health_compatibility_recommendations(
        self,
        health1: Dict[str, Any],
        health2: Dict[str, Any],
        score: int
    ) -> List[str]:
        """Get recommendations for health compatibility."""
        recommendations = []
        
        if score >= 80:
            recommendations.append('Support each other\'s health goals together')
            recommendations.append('Plan joint wellness activities')
        elif score >= 60:
            recommendations.append('Respect each other\'s different health needs')
            recommendations.append('Find common ground in wellness activities')
        else:
            recommendations.append('Communicate openly about health needs and boundaries')
            recommendations.append('Respect different approaches to wellness')
        
        # Specific recommendations based on numbers
        if health1['stress_number'] == health2['stress_number']:
            recommendations.append('You can support each other during stress periods')
        
        return recommendations