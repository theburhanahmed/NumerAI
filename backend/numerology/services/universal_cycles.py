"""
Universal Cycles service for numerology.
Calculates global year, month, and day numbers.
"""
from typing import Dict, Any, List
from datetime import date, datetime
from numerology.numerology import NumerologyCalculator


class UniversalCyclesService:
    """Service for calculating universal cycles."""
    
    def __init__(self):
        self.calculator = NumerologyCalculator()
    
    def calculate_universal_year(self, year: int = None) -> Dict[str, Any]:
        """
        Calculate Universal Year Number.
        
        The Universal Year represents the global energy for the year.
        It's calculated by reducing the year to a single digit.
        
        Args:
            year: Year to calculate (defaults to current year)
            
        Returns:
            Dictionary with year number and interpretation
        """
        if year is None:
            year = datetime.now().year
        
        year_str = str(year)
        total = sum(int(d) for d in year_str)
        year_number = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        return {
            'year': year,
            'universal_year_number': year_number,
            'interpretation': self._get_universal_year_interpretation(year_number, year)
        }
    
    def calculate_universal_month(self, year: int = None, month: int = None) -> Dict[str, Any]:
        """
        Calculate Universal Month Number.
        
        The Universal Month represents the global energy for the month.
        It's calculated by reducing (universal year + month) to a single digit.
        
        Args:
            year: Year (defaults to current year)
            month: Month (defaults to current month)
            
        Returns:
            Dictionary with month number and interpretation
        """
        if year is None:
            year = datetime.now().year
        if month is None:
            month = datetime.now().month
        
        universal_year = self.calculate_universal_year(year)
        year_num = universal_year['universal_year_number']
        month_num = self.calculator._reduce_to_single_digit(month, preserve_master=False)
        
        total = year_num + month_num
        month_number = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        return {
            'year': year,
            'month': month,
            'universal_month_number': month_number,
            'universal_year_number': year_num,
            'interpretation': self._get_universal_month_interpretation(month_number, year, month)
        }
    
    def calculate_universal_day(self, target_date: date = None) -> Dict[str, Any]:
        """
        Calculate Universal Day Number.
        
        The Universal Day represents the global energy for the day.
        It's calculated by reducing (universal year + universal month + day) to a single digit.
        
        Args:
            target_date: Date to calculate (defaults to today)
            
        Returns:
            Dictionary with day number and interpretation
        """
        if target_date is None:
            target_date = date.today()
        
        universal_month = self.calculate_universal_month(target_date.year, target_date.month)
        month_num = universal_month['universal_month_number']
        day_num = self.calculator._reduce_to_single_digit(target_date.day, preserve_master=False)
        
        total = month_num + day_num
        day_number = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        return {
            'date': target_date.isoformat(),
            'universal_day_number': day_number,
            'universal_month_number': month_num,
            'universal_year_number': universal_month['universal_year_number'],
            'interpretation': self._get_universal_day_interpretation(day_number, target_date)
        }
    
    def calculate_personal_hour(self, birth_date: date, target_datetime: datetime = None) -> Dict[str, Any]:
        """
        Calculate Personal Hour Number.
        
        The Personal Hour represents your personal energy for a specific hour.
        It's calculated by reducing (personal day + hour) to a single digit.
        
        Args:
            birth_date: Date of birth
            target_datetime: Datetime to calculate (defaults to now)
            
        Returns:
            Dictionary with hour number and interpretation
        """
        if target_datetime is None:
            target_datetime = datetime.now()
        
        target_date = target_datetime.date()
        personal_day = self.calculator.calculate_personal_day_number(birth_date, target_date)
        hour = target_datetime.hour
        
        # Reduce hour to single digit (0-23 -> 0-9)
        hour_reduced = self.calculator._reduce_to_single_digit(hour, preserve_master=False)
        if hour_reduced == 0:
            hour_reduced = 9  # Midnight (0) is treated as 9
        
        total = personal_day + hour_reduced
        hour_number = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        return {
            'datetime': target_datetime.isoformat(),
            'personal_hour_number': hour_number,
            'personal_day_number': personal_day,
            'hour': hour,
            'interpretation': self._get_personal_hour_interpretation(hour_number, hour)
        }
    
    def analyze_cycle_transitions(self, birth_date: date, start_date: date = None, end_date: date = None) -> Dict[str, Any]:
        """
        Analyze cycle transitions for a date range.
        
        Args:
            birth_date: Date of birth
            start_date: Start of range (defaults to today)
            end_date: End of range (defaults to 30 days from start)
            
        Returns:
            Dictionary with transition dates and analysis
        """
        if start_date is None:
            start_date = date.today()
        if end_date is None:
            from datetime import timedelta
            end_date = start_date + timedelta(days=30)
        
        transitions = []
        current_date = start_date
        prev_personal_year = None
        prev_personal_month = None
        prev_personal_day = None
        
        while current_date <= end_date:
            personal_year = self.calculator.calculate_personal_year_number(birth_date, current_date.year)
            personal_month = self.calculator.calculate_personal_month_number(
                birth_date, current_date.year, current_date.month
            )
            personal_day = self.calculator.calculate_personal_day_number(birth_date, current_date)
            
            # Check for transitions
            if prev_personal_year is not None and prev_personal_year != personal_year:
                transitions.append({
                    'date': current_date.isoformat(),
                    'type': 'year',
                    'from': prev_personal_year,
                    'to': personal_year,
                    'significance': 'Major life cycle change'
                })
            
            if prev_personal_month is not None and prev_personal_month != personal_month:
                transitions.append({
                    'date': current_date.isoformat(),
                    'type': 'month',
                    'from': prev_personal_month,
                    'to': personal_month,
                    'significance': 'Monthly energy shift'
                })
            
            prev_personal_year = personal_year
            prev_personal_month = personal_month
            prev_personal_day = personal_day
            
            from datetime import timedelta
            current_date += timedelta(days=1)
        
        return {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'transitions': transitions,
            'transition_count': len(transitions)
        }
    
    def get_cycle_recommendations(self, birth_date: date, target_date: date = None) -> Dict[str, Any]:
        """
        Get cycle-based recommendations for a date.
        
        Args:
            birth_date: Date of birth
            target_date: Target date (defaults to today)
            
        Returns:
            Dictionary with recommendations
        """
        if target_date is None:
            target_date = date.today()
        
        personal_year = self.calculator.calculate_personal_year_number(birth_date, target_date.year)
        personal_month = self.calculator.calculate_personal_month_number(
            birth_date, target_date.year, target_date.month
        )
        personal_day = self.calculator.calculate_personal_day_number(birth_date, target_date)
        
        universal_year = self.calculate_universal_year(target_date.year)
        universal_month = self.calculate_universal_month(target_date.year, target_date.month)
        universal_day = self.calculate_universal_day(target_date)
        
        recommendations = {
            'date': target_date.isoformat(),
            'personal_cycles': {
                'year': personal_year,
                'month': personal_month,
                'day': personal_day
            },
            'universal_cycles': {
                'year': universal_year['universal_year_number'],
                'month': universal_month['universal_month_number'],
                'day': universal_day['universal_day_number']
            },
            'recommendations': self._generate_cycle_recommendations(
                personal_year, personal_month, personal_day,
                universal_year['universal_year_number'], universal_month['universal_month_number']
            )
        }
        
        return recommendations
    
    def _get_universal_year_interpretation(self, year_number: int, year: int) -> str:
        """Get interpretation for universal year."""
        interpretations = {
            1: f"The year {year} is a Universal Year 1 - a year of new beginnings, leadership, and fresh starts globally.",
            2: f"The year {year} is a Universal Year 2 - a year of cooperation, partnerships, and diplomacy globally.",
            3: f"The year {year} is a Universal Year 3 - a year of creativity, expression, and communication globally.",
            4: f"The year {year} is a Universal Year 4 - a year of stability, building, and organization globally.",
            5: f"The year {year} is a Universal Year 5 - a year of change, freedom, and adventure globally.",
            6: f"The year {year} is a Universal Year 6 - a year of love, service, and responsibility globally.",
            7: f"The year {year} is a Universal Year 7 - a year of spirituality, analysis, and introspection globally.",
            8: f"The year {year} is a Universal Year 8 - a year of material success, power, and achievement globally.",
            9: f"The year {year} is a Universal Year 9 - a year of completion, wisdom, and humanitarianism globally.",
        }
        return interpretations.get(year_number, f"Universal Year {year_number} energy influences the world.")
    
    def _get_universal_month_interpretation(self, month_number: int, year: int, month: int) -> str:
        """Get interpretation for universal month."""
        month_names = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
        month_name = month_names[month] if 1 <= month <= 12 else f"Month {month}"
        
        interpretations = {
            1: f"{month_name} {year} is a Universal Month 1 - focus on new initiatives and leadership.",
            2: f"{month_name} {year} is a Universal Month 2 - focus on cooperation and partnerships.",
            3: f"{month_name} {year} is a Universal Month 3 - focus on creativity and expression.",
            4: f"{month_name} {year} is a Universal Month 4 - focus on stability and building.",
            5: f"{month_name} {year} is a Universal Month 5 - focus on change and freedom.",
            6: f"{month_name} {year} is a Universal Month 6 - focus on love and service.",
            7: f"{month_name} {year} is a Universal Month 7 - focus on spirituality and analysis.",
            8: f"{month_name} {year} is a Universal Month 8 - focus on material success and power.",
            9: f"{month_name} {year} is a Universal Month 9 - focus on completion and wisdom.",
        }
        return interpretations.get(month_number, f"Universal Month {month_number} energy influences {month_name}.")
    
    def _get_universal_day_interpretation(self, day_number: int, target_date: date) -> str:
        """Get interpretation for universal day."""
        interpretations = {
            1: f"Today ({target_date}) is a Universal Day 1 - perfect for new beginnings and taking initiative.",
            2: f"Today ({target_date}) is a Universal Day 2 - perfect for cooperation and partnerships.",
            3: f"Today ({target_date}) is a Universal Day 3 - perfect for creativity and expression.",
            4: f"Today ({target_date}) is a Universal Day 4 - perfect for building and organizing.",
            5: f"Today ({target_date}) is a Universal Day 5 - perfect for change and adventure.",
            6: f"Today ({target_date}) is a Universal Day 6 - perfect for love and service.",
            7: f"Today ({target_date}) is a Universal Day 7 - perfect for spirituality and introspection.",
            8: f"Today ({target_date}) is a Universal Day 8 - perfect for material success and achievement.",
            9: f"Today ({target_date}) is a Universal Day 9 - perfect for completion and letting go.",
        }
        return interpretations.get(day_number, f"Universal Day {day_number} energy influences today.")
    
    def _get_personal_hour_interpretation(self, hour_number: int, hour: int) -> str:
        """Get interpretation for personal hour."""
        hour_period = "AM" if hour < 12 else "PM"
        hour_display = hour if hour <= 12 else hour - 12
        if hour == 0:
            hour_display = 12
        
        interpretations = {
            1: f"This hour ({hour_display} {hour_period}) is a Personal Hour 1 - take action and lead.",
            2: f"This hour ({hour_display} {hour_period}) is a Personal Hour 2 - cooperate and listen.",
            3: f"This hour ({hour_display} {hour_period}) is a Personal Hour 3 - express yourself creatively.",
            4: f"This hour ({hour_display} {hour_period}) is a Personal Hour 4 - focus on practical tasks.",
            5: f"This hour ({hour_display} {hour_period}) is a Personal Hour 5 - embrace change and freedom.",
            6: f"This hour ({hour_display} {hour_period}) is a Personal Hour 6 - nurture and serve others.",
            7: f"This hour ({hour_display} {hour_period}) is a Personal Hour 7 - reflect and seek wisdom.",
            8: f"This hour ({hour_display} {hour_period}) is a Personal Hour 8 - focus on material success.",
            9: f"This hour ({hour_display} {hour_period}) is a Personal Hour 9 - complete and let go.",
        }
        return interpretations.get(hour_number, f"Personal Hour {hour_number} energy influences this time.")
    
    def _generate_cycle_recommendations(
        self,
        personal_year: int,
        personal_month: int,
        personal_day: int,
        universal_year: int,
        universal_month: int
    ) -> List[str]:
        """Generate cycle-based recommendations."""
        recommendations = []
        
        # Personal vs Universal alignment
        if personal_year == universal_year:
            recommendations.append("Your personal year aligns with the universal year - powerful time for manifestation.")
        elif abs(personal_year - universal_year) <= 1:
            recommendations.append("Your personal year is close to the universal year - good harmony for your goals.")
        else:
            recommendations.append("Your personal year differs from the universal year - focus on your personal path.")
        
        # Day recommendations
        if personal_day == 1:
            recommendations.append("Today is perfect for starting new projects and taking leadership.")
        elif personal_day == 5:
            recommendations.append("Today favors change and adventure - try something new.")
        elif personal_day == 7:
            recommendations.append("Today is ideal for introspection and spiritual activities.")
        elif personal_day == 8:
            recommendations.append("Today is powerful for business and financial matters.")
        
        return recommendations
    
    def calculate_essence_cycles(
        self,
        birth_date: date,
        years_ahead: int = 27
    ) -> Dict[str, Any]:
        """
        Calculate all essence cycles (9-year cycles) for a person.
        
        Args:
            birth_date: Date of birth
            years_ahead: Number of years to calculate ahead (default 27 for 3 cycles)
            
        Returns:
            Complete essence cycle analysis
        """
        current_age = (date.today() - birth_date).days // 365
        cycles = []
        
        for cycle_num in range(1, 10):
            cycle_info = self._get_essence_cycle_for_number(birth_date, cycle_num)
            cycles.append(cycle_info)
        
        # Get current cycle
        current_cycle = self._get_current_essence_cycle(birth_date)
        
        # Get upcoming transitions
        transitions = self.analyze_essence_transitions(birth_date, years_ahead)
        
        return {
            'birth_date': birth_date.isoformat(),
            'current_age': current_age,
            'current_cycle': current_cycle,
            'all_cycles': cycles,
            'upcoming_transitions': transitions.get('transitions', []),
            'cycle_summary': self._generate_essence_summary(cycles, current_cycle)
        }
    
    def analyze_essence_transitions(
        self,
        birth_date: date,
        years_ahead: int = 27
    ) -> Dict[str, Any]:
        """
        Analyze essence cycle transitions.
        
        Args:
            birth_date: Date of birth
            years_ahead: Years to look ahead
            
        Returns:
            Transition analysis
        """
        current_age = (date.today() - birth_date).days // 365
        transitions = []
        
        # Calculate transition ages (every 9 years)
        for cycle_num in range(1, 10):
            transition_age = (cycle_num - 1) * 9
            if transition_age >= current_age and transition_age <= current_age + years_ahead:
                transition_date = date(birth_date.year + transition_age, birth_date.month, birth_date.day)
                
                # Get cycles before and after
                from_cycle = self._get_essence_cycle_for_number(birth_date, cycle_num)
                to_cycle = self._get_essence_cycle_for_number(birth_date, cycle_num + 1) if cycle_num < 9 else None
                
                transitions.append({
                    'age': transition_age,
                    'date': transition_date.isoformat(),
                    'from_cycle': from_cycle,
                    'to_cycle': to_cycle,
                    'transition_meaning': self._get_transition_meaning(from_cycle, to_cycle),
                    'preparation_guidance': self._get_transition_preparation(from_cycle, to_cycle)
                })
        
        return {
            'birth_date': birth_date.isoformat(),
            'current_age': current_age,
            'transitions': transitions,
            'next_transition': transitions[0] if transitions else None
        }
    
    def get_essence_interpretation(
        self,
        cycle_number: int
    ) -> Dict[str, Any]:
        """
        Get detailed interpretation for an essence cycle.
        
        Args:
            cycle_number: Essence cycle number (1-9)
            
        Returns:
            Detailed interpretation
        """
        return {
            'cycle_number': cycle_number,
            'interpretation': self._get_essence_cycle_interpretation(cycle_number),
            'key_themes': self._get_essence_themes(cycle_number),
            'opportunities': self._get_essence_opportunities(cycle_number),
            'challenges': self._get_essence_challenges(cycle_number),
            'recommendations': self._get_essence_recommendations(cycle_number)
        }
    
    def forecast_essence_trends(
        self,
        birth_date: date,
        years_ahead: int = 27
    ) -> Dict[str, Any]:
        """
        Forecast essence cycle trends.
        
        Args:
            birth_date: Date of birth
            years_ahead: Years to forecast
            
        Returns:
            Forecast analysis
        """
        cycles = self.calculate_essence_cycles(birth_date, years_ahead)
        transitions = self.analyze_essence_transitions(birth_date, years_ahead)
        
        # Identify high opportunity cycles
        opportunity_cycles = [
            c for c in cycles['all_cycles']
            if c['cycle_number'] in [1, 4, 8]  # High opportunity numbers
        ]
        
        # Identify challenging cycles
        challenging_cycles = [
            c for c in cycles['all_cycles']
            if c['cycle_number'] in [5, 7]  # Challenging numbers
        ]
        
        return {
            'forecast_period': years_ahead,
            'current_cycle': cycles['current_cycle'],
            'upcoming_cycles': [c for c in cycles['all_cycles'] if c['cycle_number'] > cycles['current_cycle']['cycle_number']],
            'opportunity_cycles': opportunity_cycles,
            'challenging_cycles': challenging_cycles,
            'transitions': transitions['transitions'],
            'trends': self._identify_essence_trends(cycles['all_cycles'])
        }
    
    def _get_essence_cycle_for_number(
        self,
        birth_date: date,
        cycle_number: int
    ) -> Dict[str, Any]:
        """Get essence cycle information for a specific cycle number."""
        start_age = (cycle_number - 1) * 9
        end_age = start_age + 8
        
        return {
            'cycle_number': cycle_number,
            'start_age': start_age,
            'end_age': end_age,
            'age_range': f"{start_age}-{end_age}",
            'interpretation': self._get_essence_cycle_interpretation(cycle_number),
            'key_themes': self._get_essence_themes(cycle_number),
            'opportunities': self._get_essence_opportunities(cycle_number),
            'challenges': self._get_essence_challenges(cycle_number)
        }
    
    def _get_current_essence_cycle(self, birth_date: date) -> Dict[str, Any]:
        """Get current essence cycle."""
        current_age = (date.today() - birth_date).days // 365
        cycle_number = (current_age // 9) + 1
        if cycle_number > 9:
            cycle_number = 9
        
        return self._get_essence_cycle_for_number(birth_date, cycle_number)
    
    def _get_essence_cycle_interpretation(self, cycle_number: int) -> str:
        """Get interpretation for essence cycle number."""
        interpretations = {
            1: 'Cycle of new beginnings, independence, and leadership. Time to start fresh and take initiative.',
            2: 'Cycle of partnerships, cooperation, and harmony. Time to build relationships and work with others.',
            3: 'Cycle of creativity, expression, and communication. Time to share your gifts and be creative.',
            4: 'Cycle of stability, building, and foundation. Time to create structure and build lasting foundations.',
            5: 'Cycle of change, freedom, and adventure. Time to embrace transformation and explore new possibilities.',
            6: 'Cycle of service, responsibility, and family. Time to care for others and fulfill responsibilities.',
            7: 'Cycle of analysis, spirituality, and wisdom. Time to seek deeper understanding and spiritual growth.',
            8: 'Cycle of material success, power, and achievement. Time to focus on business and material goals.',
            9: 'Cycle of completion, humanitarianism, and wisdom. Time to complete cycles and serve humanity.'
        }
        return interpretations.get(cycle_number, f'Essence Cycle {cycle_number} - period of growth and development.')
    
    def _get_transition_meaning(
        self,
        from_cycle: Dict[str, Any],
        to_cycle: Optional[Dict[str, Any]]
    ) -> str:
        """Get meaning of transition between cycles."""
        if not to_cycle:
            return 'Final cycle transition'
        
        from_num = from_cycle['cycle_number']
        to_num = to_cycle['cycle_number']
        
        transition_meanings = {
            (1, 2): 'Moving from independence to partnership focus',
            (2, 3): 'Moving from partnership to creative expression',
            (3, 4): 'Moving from creativity to building foundation',
            (4, 5): 'Moving from stability to change and freedom',
            (5, 6): 'Moving from change to service and responsibility',
            (6, 7): 'Moving from service to introspection and analysis',
            (7, 8): 'Moving from analysis to material success',
            (8, 9): 'Moving from material success to completion and wisdom'
        }
        
        return transition_meanings.get((from_num, to_num), 'Transition to new cycle phase')
    
    def _get_transition_preparation(
        self,
        from_cycle: Dict[str, Any],
        to_cycle: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Get preparation guidance for transition."""
        if not to_cycle:
            return ['Prepare for completion phase', 'Reflect on life lessons']
        
        to_num = to_cycle['cycle_number']
        
        preparation = {
            1: ['Prepare for new beginnings', 'Set clear goals', 'Take leadership roles'],
            2: ['Focus on partnerships', 'Develop cooperation skills', 'Build relationships'],
            4: ['Plan for stability', 'Build foundations', 'Create structure'],
            5: ['Prepare for change', 'Embrace flexibility', 'Be open to new experiences'],
            8: ['Focus on material goals', 'Build resources', 'Seek success opportunities']
        }
        
        return preparation.get(to_num, ['Prepare for new cycle', 'Align with cycle themes'])
    
    def _get_essence_themes(self, cycle_number: int) -> List[str]:
        """Get key themes for essence cycle."""
        themes = {
            1: ['New beginnings', 'Leadership', 'Independence'],
            2: ['Partnerships', 'Cooperation', 'Harmony'],
            3: ['Creativity', 'Expression', 'Communication'],
            4: ['Stability', 'Building', 'Foundation'],
            5: ['Change', 'Freedom', 'Adventure'],
            6: ['Service', 'Responsibility', 'Family'],
            7: ['Analysis', 'Spirituality', 'Wisdom'],
            8: ['Material success', 'Power', 'Achievement'],
            9: ['Completion', 'Humanitarianism', 'Wisdom']
        }
        return themes.get(cycle_number, ['Growth', 'Development'])
    
    def _get_essence_opportunities(self, cycle_number: int) -> List[str]:
        """Get opportunities for essence cycle."""
        opportunities = {
            1: ['Start new projects', 'Take leadership', 'Be independent'],
            4: ['Build foundations', 'Create stability', 'Establish structure'],
            8: ['Achieve material success', 'Gain power', 'Build resources']
        }
        return opportunities.get(cycle_number, ['Growth opportunities', 'Personal development'])
    
    def _get_essence_challenges(self, cycle_number: int) -> List[str]:
        """Get challenges for essence cycle."""
        challenges = {
            5: ['Too much change', 'Instability', 'Need for balance'],
            7: ['Over-analysis', 'Isolation', 'Need for action']
        }
        return challenges.get(cycle_number, ['General challenges', 'Personal growth'])
    
    def _get_essence_recommendations(self, cycle_number: int) -> List[str]:
        """Get recommendations for essence cycle."""
        recommendations = {
            1: ['Take initiative', 'Lead with confidence', 'Start new ventures'],
            4: ['Build solid foundations', 'Create structure', 'Plan long-term'],
            8: ['Focus on material goals', 'Seek success', 'Build resources']
        }
        return recommendations.get(cycle_number, ['Align with cycle energy', 'Focus on growth'])
    
    def _generate_essence_summary(
        self,
        cycles: List[Dict[str, Any]],
        current_cycle: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate summary of essence cycles."""
        return {
            'total_cycles': len(cycles),
            'current_cycle_number': current_cycle['cycle_number'],
            'cycles_completed': current_cycle['cycle_number'] - 1,
            'cycles_remaining': 9 - current_cycle['cycle_number'],
            'next_cycle': cycles[current_cycle['cycle_number']] if current_cycle['cycle_number'] < 9 else None
        }
    
    def _identify_essence_trends(self, cycles: List[Dict[str, Any]]) -> List[str]:
        """Identify trends across essence cycles."""
        trends = []
        
        # Check for pattern of high opportunity cycles
        opportunity_count = sum(1 for c in cycles if c['cycle_number'] in [1, 4, 8])
        if opportunity_count >= 2:
            trends.append('Multiple high-opportunity cycles ahead')
        
        # Check for challenging cycles
        challenging_count = sum(1 for c in cycles if c['cycle_number'] in [5, 7])
        if challenging_count >= 2:
            trends.append('Some challenging cycles require preparation')
        
        return trends
