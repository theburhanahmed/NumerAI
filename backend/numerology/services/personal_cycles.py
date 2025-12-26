"""
Personal Cycles service for numerology.
Analyzes personal cycles, transitions, and compatibility.
"""
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
from numerology.numerology import NumerologyCalculator


class PersonalCyclesService:
    """Service for analyzing personal cycles."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
    
    def calculate_cycle_transitions(
        self,
        birth_date: date,
        start_date: date = None,
        end_date: date = None
    ) -> Dict[str, Any]:
        """
        Calculate when personal cycles change.
        
        Args:
            birth_date: Date of birth
            start_date: Start of range (defaults to today)
            end_date: End of range (defaults to 1 year from start)
            
        Returns:
            Dictionary with transition dates and details
        """
        if start_date is None:
            start_date = date.today()
        if end_date is None:
            end_date = date(start_date.year + 1, start_date.month, start_date.day)
        
        transitions = []
        current_date = start_date
        
        prev_personal_year = None
        prev_personal_month = None
        
        while current_date <= end_date:
            personal_year = self.calculator.calculate_personal_year_number(
                birth_date, current_date.year
            )
            personal_month = self.calculator.calculate_personal_month_number(
                birth_date, current_date.year, current_date.month
            )
            
            # Check for year transition
            if prev_personal_year is not None and prev_personal_year != personal_year:
                transitions.append({
                    'date': current_date.isoformat(),
                    'type': 'year',
                    'from_number': prev_personal_year,
                    'to_number': personal_year,
                    'significance': 'Major life cycle transition',
                    'guidance': self._get_transition_guidance('year', prev_personal_year, personal_year)
                })
            
            # Check for month transition
            if prev_personal_month is not None and prev_personal_month != personal_month:
                transitions.append({
                    'date': current_date.isoformat(),
                    'type': 'month',
                    'from_number': prev_personal_month,
                    'to_number': personal_month,
                    'significance': 'Monthly energy shift',
                    'guidance': self._get_transition_guidance('month', prev_personal_month, personal_month)
                })
            
            prev_personal_year = personal_year
            prev_personal_month = personal_month
            
            # Move to next month for efficiency
            if current_date.month == 12:
                current_date = date(current_date.year + 1, 1, 1)
            else:
                current_date = date(current_date.year, current_date.month + 1, 1)
        
        return {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'transitions': transitions,
            'transition_count': len(transitions),
            'upcoming_transitions': [t for t in transitions if t['date'] >= date.today().isoformat()][:5]
        }
    
    def analyze_cycle_compatibility(
        self,
        birth_date1: date,
        birth_date2: date,
        target_date: date = None
    ) -> Dict[str, Any]:
        """
        Analyze cycle compatibility between two people.
        
        Args:
            birth_date1: First person's birth date
            birth_date2: Second person's birth date
            target_date: Date to analyze (defaults to today)
            
        Returns:
            Dictionary with compatibility analysis
        """
        if target_date is None:
            target_date = date.today()
        
        personal_year1 = self.calculator.calculate_personal_year_number(birth_date1, target_date.year)
        personal_month1 = self.calculator.calculate_personal_month_number(
            birth_date1, target_date.year, target_date.month
        )
        personal_day1 = self.calculator.calculate_personal_day_number(birth_date1, target_date)
        
        personal_year2 = self.calculator.calculate_personal_year_number(birth_date2, target_date.year)
        personal_month2 = self.calculator.calculate_personal_month_number(
            birth_date2, target_date.year, target_date.month
        )
        personal_day2 = self.calculator.calculate_personal_day_number(birth_date2, target_date)
        
        # Calculate compatibility
        year_match = personal_year1 == personal_year2
        month_match = personal_month1 == personal_month2
        day_match = personal_day1 == personal_day2
        
        compatibility_score = 0
        if year_match:
            compatibility_score += 40
        if month_match:
            compatibility_score += 30
        if day_match:
            compatibility_score += 30
        
        # Check for complementary cycles
        complementary_pairs = [
            (1, 8), (2, 7), (3, 6), (4, 5), (5, 4), (6, 3), (7, 2), (8, 1)
        ]
        
        year_complementary = (personal_year1, personal_year2) in complementary_pairs or \
                            (personal_year2, personal_year1) in complementary_pairs
        month_complementary = (personal_month1, personal_month2) in complementary_pairs or \
                             (personal_month2, personal_month1) in complementary_pairs
        
        if year_complementary:
            compatibility_score += 20
        if month_complementary:
            compatibility_score += 15
        
        compatibility_score = min(100, compatibility_score)
        
        return {
            'date': target_date.isoformat(),
            'person1_cycles': {
                'year': personal_year1,
                'month': personal_month1,
                'day': personal_day1
            },
            'person2_cycles': {
                'year': personal_year2,
                'month': personal_month2,
                'day': personal_day2
            },
            'compatibility_score': compatibility_score,
            'matches': {
                'year': year_match,
                'month': month_match,
                'day': day_match
            },
            'complementary': {
                'year': year_complementary,
                'month': month_complementary
            },
            'analysis': self._generate_compatibility_analysis(
                year_match, month_match, day_match,
                year_complementary, month_complementary,
                compatibility_score
            )
        }
    
    def get_cycle_alerts(
        self,
        birth_date: date,
        days_ahead: int = 30
    ) -> Dict[str, Any]:
        """
        Get important cycle dates and alerts.
        
        Args:
            birth_date: Date of birth
            days_ahead: Number of days to look ahead (default 30)
            
        Returns:
            Dictionary with alerts and important dates
        """
        today = date.today()
        end_date = today + timedelta(days=days_ahead)
        
        transitions = self.calculate_cycle_transitions(birth_date, today, end_date)
        
        alerts = []
        for transition in transitions['transitions']:
            if transition['type'] == 'year':
                alerts.append({
                    'date': transition['date'],
                    'type': 'year_transition',
                    'priority': 'high',
                    'message': f"Major cycle transition: Personal Year {transition['from_number']} → {transition['to_number']}",
                    'guidance': transition.get('guidance', '')
                })
            elif transition['type'] == 'month':
                alerts.append({
                    'date': transition['date'],
                    'type': 'month_transition',
                    'priority': 'medium',
                    'message': f"Monthly cycle shift: Personal Month {transition['from_number']} → {transition['to_number']}",
                    'guidance': transition.get('guidance', '')
                })
        
        return {
            'alerts': alerts,
            'alert_count': len(alerts),
            'high_priority_count': len([a for a in alerts if a['priority'] == 'high']),
            'date_range': {
                'start': today.isoformat(),
                'end': end_date.isoformat()
            }
        }
    
    def forecast_cycle_trends(
        self,
        birth_date: date,
        months_ahead: int = 12
    ) -> Dict[str, Any]:
        """
        Forecast cycle trends for upcoming months.
        
        Args:
            birth_date: Date of birth
            months_ahead: Number of months to forecast (default 12)
            
        Returns:
            Dictionary with forecast data
        """
        today = date.today()
        forecast = []
        
        for i in range(months_ahead):
            forecast_date = date(today.year, today.month, 1)
            if today.month + i > 12:
                forecast_date = date(today.year + 1, (today.month + i) % 12 or 12, 1)
            else:
                forecast_date = date(today.year, today.month + i, 1)
            
            personal_year = self.calculator.calculate_personal_year_number(
                birth_date, forecast_date.year
            )
            personal_month = self.calculator.calculate_personal_month_number(
                birth_date, forecast_date.year, forecast_date.month
            )
            
            forecast.append({
                'date': forecast_date.isoformat(),
                'year': forecast_date.year,
                'month': forecast_date.month,
                'personal_year': personal_year,
                'personal_month': personal_month,
                'trend': self._get_cycle_trend(personal_year, personal_month)
            })
        
        return {
            'forecast': forecast,
            'months_forecasted': months_ahead,
            'summary': self._generate_forecast_summary(forecast)
        }
    
    def _get_transition_guidance(self, cycle_type: str, from_number: int, to_number: int) -> str:
        """Get guidance for cycle transitions."""
        if cycle_type == 'year':
            return f"Transitioning from Personal Year {from_number} to {to_number}. This is a major life cycle change. Prepare for new opportunities and challenges aligned with Year {to_number} energy."
        else:
            return f"Transitioning from Personal Month {from_number} to {to_number}. Monthly energy shift - adjust your focus and activities accordingly."
    
    def _generate_compatibility_analysis(
        self,
        year_match: bool,
        month_match: bool,
        day_match: bool,
        year_complementary: bool,
        month_complementary: bool,
        score: int
    ) -> str:
        """Generate compatibility analysis text."""
        parts = []
        
        if year_match:
            parts.append("Your personal years match - you're in sync with major life cycles.")
        if month_match:
            parts.append("Your personal months match - good alignment for current activities.")
        if day_match:
            parts.append("Your personal days match - strong connection today.")
        
        if year_complementary:
            parts.append("Your personal years are complementary - you balance each other well.")
        if month_complementary:
            parts.append("Your personal months are complementary - good harmony this month.")
        
        if score >= 80:
            parts.append("Excellent cycle compatibility - you're well-aligned.")
        elif score >= 60:
            parts.append("Good cycle compatibility - you work well together.")
        elif score >= 40:
            parts.append("Moderate cycle compatibility - some alignment present.")
        else:
            parts.append("Different cycle energies - understanding and patience will be important.")
        
        return " ".join(parts) if parts else "Cycle compatibility analysis available."
    
    def _get_cycle_trend(self, personal_year: int, personal_month: int) -> str:
        """Get trend description for cycle combination."""
        if personal_year in [1, 5, 9] and personal_month in [1, 5, 9]:
            return "High energy period - action and change"
        elif personal_year in [2, 4, 6, 8] and personal_month in [2, 4, 6, 8]:
            return "Stable and practical period - building and organizing"
        elif personal_year in [3, 6, 9] and personal_month in [3, 6, 9]:
            return "Creative and expressive period - communication and art"
        elif personal_year == 7 or personal_month == 7:
            return "Introspective period - analysis and spirituality"
        else:
            return "Balanced period - mixed energies"
    
    def _generate_forecast_summary(self, forecast: List[Dict[str, Any]]) -> str:
        """Generate summary of forecast."""
        year_counts = {}
        month_counts = {}
        
        for entry in forecast:
            year_counts[entry['personal_year']] = year_counts.get(entry['personal_year'], 0) + 1
            month_counts[entry['personal_month']] = month_counts.get(entry['personal_month'], 0) + 1
        
        dominant_year = max(year_counts.items(), key=lambda x: x[1])[0] if year_counts else None
        dominant_month = max(month_counts.items(), key=lambda x: x[1])[0] if month_counts else None
        
        summary = f"Forecast shows Personal Year {dominant_year} as dominant, with Personal Month {dominant_month} appearing frequently."
        return summary

