"""
Timing numerology service for optimal dates, danger dates, and event timing.
"""
from typing import Dict, List, Any, Optional
from datetime import date, timedelta
from numerology.numerology import NumerologyCalculator
from numerology.services.universal_cycles import UniversalCycleCalculator


class TimingNumerologyService:
    """Service for timing and mundane numerology."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
        self.universal_calculator = UniversalCycleCalculator()
    
    def find_best_dates(
        self,
        user_birth_date: date,
        event_type: str,
        start_date: date,
        end_date: date,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Find best dates for a specific event.
        
        Args:
            user_birth_date: User's birth date
            event_type: Type of event (wedding, business_launch, purchase, travel, surgery, meeting)
            start_date: Start of date range
            end_date: End of date range
            limit: Maximum number of dates to return
            
        Returns:
            Best dates with scores and explanations
        """
        best_dates = []
        current_date = start_date
        
        while current_date <= end_date and len(best_dates) < limit * 2:  # Get more for filtering
            score_data = self._calculate_date_score(
                user_birth_date,
                current_date,
                event_type
            )
            
            if score_data['score'] >= 70:  # Only include good dates
                best_dates.append({
                    'date': current_date.isoformat(),
                    'score': score_data['score'],
                    'level': score_data['level'],
                    'personal_day': score_data['personal_day'],
                    'universal_day': score_data['universal_day'],
                    'alignment': score_data['alignment'],
                    'explanation': score_data['explanation']
                })
            
            current_date += timedelta(days=1)
        
        # Sort by score and limit
        best_dates.sort(key=lambda x: x['score'], reverse=True)
        best_dates = best_dates[:limit]
        
        return {
            'event_type': event_type,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'best_dates': best_dates,
            'recommendations': self._get_event_recommendations(event_type)
        }
    
    def find_danger_dates(
        self,
        user_birth_date: date,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Find danger dates to avoid.
        
        Args:
            user_birth_date: User's birth date
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            Danger dates with warnings
        """
        danger_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            score_data = self._calculate_date_score(
                user_birth_date,
                current_date,
                'general'
            )
            
            if score_data['score'] < 40:  # Low score indicates danger
                danger_dates.append({
                    'date': current_date.isoformat(),
                    'score': score_data['score'],
                    'risk_level': 'high' if score_data['score'] < 25 else 'moderate',
                    'personal_day': score_data['personal_day'],
                    'universal_day': score_data['universal_day'],
                    'warnings': self._get_danger_warnings(score_data),
                    'suggestions': self._get_danger_suggestions(score_data)
                })
            
            current_date += timedelta(days=1)
        
        return {
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'danger_dates': danger_dates,
            'total_danger_days': len(danger_dates)
        }
    
    def optimize_event_timing(
        self,
        user_birth_date: date,
        event_type: str,
        preferred_month: Optional[int] = None,
        preferred_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Optimize timing for an event within a preferred period.
        
        Args:
            user_birth_date: User's birth date
            event_type: Type of event
            preferred_month: Preferred month (1-12)
            preferred_year: Preferred year
            
        Returns:
            Optimized timing recommendations
        """
        if not preferred_year:
            preferred_year = date.today().year
        
        if preferred_month:
            start_date = date(preferred_year, preferred_month, 1)
            # Get last day of month
            if preferred_month == 12:
                end_date = date(preferred_year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(preferred_year, preferred_month + 1, 1) - timedelta(days=1)
        else:
            start_date = date(preferred_year, 1, 1)
            end_date = date(preferred_year, 12, 31)
        
        # Find best dates
        best_dates = self.find_best_dates(
            user_birth_date,
            event_type,
            start_date,
            end_date,
            limit=5
        )
        
        # Calculate optimal month
        monthly_scores = {}
        current = start_date
        while current <= end_date:
            month_key = f"{current.year}-{current.month:02d}"
            if month_key not in monthly_scores:
                monthly_scores[month_key] = []
            
            score_data = self._calculate_date_score(
                user_birth_date,
                current,
                event_type
            )
            monthly_scores[month_key].append(score_data['score'])
            
            current += timedelta(days=1)
        
        # Calculate average per month
        monthly_averages = {
            month: sum(scores) / len(scores)
            for month, scores in monthly_scores.items()
        }
        
        best_month = max(monthly_averages.items(), key=lambda x: x[1]) if monthly_averages else None
        
        return {
            'event_type': event_type,
            'preferred_period': {
                'year': preferred_year,
                'month': preferred_month
            },
            'best_dates': best_dates['best_dates'],
            'optimal_month': {
                'month': best_month[0] if best_month else None,
                'average_score': best_month[1] if best_month else None
            },
            'monthly_analysis': monthly_averages,
            'recommendations': best_dates['recommendations']
        }
    
    def _calculate_date_score(
        self,
        user_birth_date: date,
        target_date: date,
        event_type: str
    ) -> Dict[str, Any]:
        """Calculate score for a specific date."""
        # Calculate personal day
        personal_day = self.calculator.calculate_personal_day_number(
            user_birth_date,
            target_date
        )
        
        # Calculate personal month
        personal_month = self.calculator.calculate_personal_month_number(
            user_birth_date,
            target_date.year,
            target_date.month
        )
        
        # Calculate personal year
        personal_year = self.calculator.calculate_personal_year_number(
            user_birth_date,
            target_date.year
        )
        
        # Calculate universal day
        universal_day_data = self.universal_calculator.calculate_universal_day(
            target_date.year,
            target_date.month,
            target_date.day
        )
        universal_day = universal_day_data['universal_day_number']
        
        # Calculate base score from personal day
        base_score = self._get_personal_day_score(personal_day, event_type)
        
        # Adjust for personal month alignment
        month_adjustment = self._get_month_alignment(personal_month, event_type)
        
        # Adjust for personal year alignment
        year_adjustment = self._get_year_alignment(personal_year, event_type)
        
        # Adjust for universal day
        universal_adjustment = self._get_universal_day_score(universal_day, event_type)
        
        # Calculate alignment
        alignment = self._calculate_alignment(
            personal_day,
            personal_month,
            personal_year,
            universal_day
        )
        
        # Final score
        final_score = (
            base_score * 0.4 +
            month_adjustment * 0.25 +
            year_adjustment * 0.2 +
            universal_adjustment * 0.15
        )
        
        # Bonus for alignment
        if alignment >= 0.8:
            final_score += 10
        elif alignment >= 0.6:
            final_score += 5
        
        final_score = max(0, min(100, final_score))
        
        return {
            'score': round(final_score),
            'level': 'excellent' if final_score >= 85 else 'good' if final_score >= 70 else 'moderate' if final_score >= 50 else 'poor',
            'personal_day': personal_day,
            'personal_month': personal_month,
            'personal_year': personal_year,
            'universal_day': universal_day,
            'alignment': alignment,
            'explanation': self._generate_date_explanation(
                personal_day,
                personal_month,
                personal_year,
                universal_day,
                event_type,
                final_score
            )
        }
    
    def _get_personal_day_score(self, personal_day: int, event_type: str) -> float:
        """Get score for personal day number based on event type."""
        # Optimal numbers for different events
        event_optimal_numbers = {
            'wedding': [2, 6, 9],  # Harmony, family, completion
            'business_launch': [1, 4, 8],  # Leadership, stability, success
            'purchase': [4, 8],  # Stability, material success
            'travel': [3, 5],  # Expression, adventure
            'surgery': [4, 7],  # Stability, precision
            'meeting': [2, 6],  # Cooperation, service
            'general': [1, 2, 4, 6, 8, 9]  # Most numbers are okay
        }
        
        optimal_numbers = event_optimal_numbers.get(event_type, event_optimal_numbers['general'])
        
        if personal_day in optimal_numbers:
            return 90
        elif personal_day in [1, 2, 3, 4, 5, 6, 7, 8, 9]:
            return 70
        else:
            return 50
    
    def _get_month_alignment(self, personal_month: int, event_type: str) -> float:
        """Get month alignment score."""
        # Months that support different events
        supportive_months = {
            'wedding': [2, 6, 9],
            'business_launch': [1, 4, 8],
            'purchase': [4, 8],
            'travel': [3, 5],
            'surgery': [4, 7],
            'meeting': [2, 6]
        }
        
        optimal = supportive_months.get(event_type, [1, 2, 3, 4, 5, 6, 7, 8, 9])
        
        if personal_month in optimal:
            return 85
        else:
            return 60
    
    def _get_year_alignment(self, personal_year: int, event_type: str) -> float:
        """Get year alignment score."""
        # Years that support different events
        supportive_years = {
            'wedding': [2, 6, 9],
            'business_launch': [1, 4, 8],
            'purchase': [4, 8],
            'travel': [3, 5],
            'surgery': [4, 7],
            'meeting': [2, 6]
        }
        
        optimal = supportive_years.get(event_type, [1, 2, 3, 4, 5, 6, 7, 8, 9])
        
        if personal_year in optimal:
            return 80
        else:
            return 55
    
    def _get_universal_day_score(self, universal_day: int, event_type: str) -> float:
        """Get universal day score."""
        # Universal days that support events
        supportive_days = {
            'wedding': [2, 6, 9],
            'business_launch': [1, 4, 8],
            'purchase': [4, 8],
            'travel': [3, 5],
            'surgery': [4, 7],
            'meeting': [2, 6]
        }
        
        optimal = supportive_days.get(event_type, [1, 2, 3, 4, 5, 6, 7, 8, 9])
        
        if universal_day in optimal:
            return 75
        else:
            return 50
    
    def _calculate_alignment(
        self,
        personal_day: int,
        personal_month: int,
        personal_year: int,
        universal_day: int
    ) -> float:
        """Calculate alignment between cycles."""
        # Calculate differences
        day_month_diff = abs(personal_day - personal_month) / 9.0
        day_year_diff = abs(personal_day - personal_year) / 9.0
        day_universal_diff = abs(personal_day - universal_day) / 9.0
        
        # Average alignment (lower diff = higher alignment)
        alignment = 1 - ((day_month_diff + day_year_diff + day_universal_diff) / 3)
        
        return max(0, min(1, alignment))
    
    def _generate_date_explanation(
        self,
        personal_day: int,
        personal_month: int,
        personal_year: int,
        universal_day: int,
        event_type: str,
        score: float
    ) -> str:
        """Generate explanation for date score."""
        explanations = []
        
        if score >= 85:
            explanations.append(f'Excellent date! Personal Day {personal_day} aligns perfectly with {event_type}.')
        elif score >= 70:
            explanations.append(f'Good date. Personal Day {personal_day} supports {event_type}.')
        elif score >= 50:
            explanations.append(f'Moderate date. Personal Day {personal_day} is acceptable for {event_type}.')
        else:
            explanations.append(f'Challenging date. Personal Day {personal_day} may not be ideal for {event_type}.')
        
        if personal_month == personal_day:
            explanations.append('Personal Month and Day are aligned - extra harmony.')
        
        if universal_day == personal_day:
            explanations.append('Universal and Personal cycles align - strong cosmic support.')
        
        return ' '.join(explanations)
    
    def _get_danger_warnings(self, score_data: Dict[str, Any]) -> List[str]:
        """Get warnings for danger dates."""
        warnings = []
        
        if score_data['score'] < 25:
            warnings.append('Very high risk - avoid important decisions or major activities')
        elif score_data['score'] < 40:
            warnings.append('Moderate risk - exercise caution and avoid conflicts')
        
        if score_data['personal_day'] == 5:
            warnings.append('Day of change and instability - avoid major commitments')
        
        if score_data['alignment'] < 0.3:
            warnings.append('Poor cycle alignment - increased risk of complications')
        
        return warnings
    
    def _get_danger_suggestions(self, score_data: Dict[str, Any]) -> List[str]:
        """Get suggestions for danger dates."""
        suggestions = []
        
        suggestions.append('Postpone important decisions if possible')
        suggestions.append('Focus on routine activities and rest')
        suggestions.append('Avoid conflicts and confrontations')
        suggestions.append('Practice meditation or spiritual activities')
        
        return suggestions
    
    def _get_event_recommendations(self, event_type: str) -> List[str]:
        """Get general recommendations for event type."""
        recommendations = {
            'wedding': [
                'Choose a date when both partners have favorable Personal Days',
                'Avoid dates with Personal Day 5 (change and instability)',
                'Consider Personal Year 2, 6, or 9 for harmony'
            ],
            'business_launch': [
                'Launch on Personal Day 1, 4, or 8 for success',
                'Align with Personal Year 1 or 8 for new beginnings',
                'Avoid Personal Day 5 or 7 for business launches'
            ],
            'purchase': [
                'Purchase on Personal Day 4 or 8 for stability and success',
                'Avoid Personal Day 5 for major purchases',
                'Consider Personal Month 4 or 8 for financial decisions'
            ],
            'travel': [
                'Travel on Personal Day 3 or 5 for adventure',
                'Avoid Personal Day 4 for travel (stability vs movement)',
                'Consider Personal Year 5 for major trips'
            ],
            'surgery': [
                'Schedule on Personal Day 4 or 7 for stability and precision',
                'Avoid Personal Day 5 for medical procedures',
                'Ensure Personal Month supports healing (6 or 9)'
            ],
            'meeting': [
                'Schedule on Personal Day 2 or 6 for cooperation',
                'Avoid Personal Day 1 for meetings (too independent)',
                'Consider Personal Month 2 for partnerships'
            ]
        }
        
        return recommendations.get(event_type, [
            'Choose dates with favorable Personal Day numbers',
            'Align with your Personal Year cycle',
            'Consider Universal Day energy'
        ])

