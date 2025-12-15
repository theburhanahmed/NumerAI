"""
Predictive Numerology service for 9-year cycles, life forecasting, and breakthrough predictions.
"""
from typing import Dict, List, Any, Optional
from datetime import date
from ..numerology import NumerologyCalculator


class PredictiveNumerologyService:
    """Service for Predictive Numerology calculations."""
    
    def __init__(self, system: str = 'pythagorean'):
        """Initialize with calculation system."""
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
    
    def calculate_predictive_profile(
        self,
        full_name: str,
        birth_date: date,
        forecast_years: int = 20
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive predictive numerology profile.
        
        Args:
            full_name: Full name
            birth_date: Birth date
            forecast_years: Number of years to forecast (default 20)
        
        Returns:
            Predictive profile with cycles, forecasting, and breakthrough predictions
        """
        # Calculate base numbers
        life_path = self.calculator.calculate_life_path_number(birth_date)
        destiny = self.calculator.calculate_destiny_number(full_name)
        
        # Calculate 9-year cycles
        nine_year_cycles = self._calculate_nine_year_cycles(birth_date, forecast_years)
        
        # Life cycle forecasting
        life_forecast = self._calculate_life_forecast(birth_date, life_path, destiny, forecast_years)
        
        # Breakthrough years
        breakthrough_years = self._identify_breakthrough_years(birth_date, life_path, forecast_years)
        
        # Crisis years
        crisis_years = self._identify_crisis_years(birth_date, life_path, forecast_years)
        
        # Opportunity periods
        opportunity_periods = self._identify_opportunity_periods(birth_date, life_path, forecast_years)
        
        # Long-term life path forecasting
        long_term_forecast = self._calculate_long_term_forecast(birth_date, life_path, destiny, forecast_years)
        
        return {
            'nine_year_cycles': nine_year_cycles,
            'life_forecast': life_forecast,
            'breakthrough_years': breakthrough_years,
            'crisis_years': crisis_years,
            'opportunity_periods': opportunity_periods,
            'long_term_forecast': long_term_forecast,
            'summary': self._generate_summary(
                breakthrough_years,
                crisis_years,
                opportunity_periods
            )
        }
    
    def _calculate_nine_year_cycles(
        self,
        birth_date: date,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Calculate 9-year cycles for forecast period."""
        today = date.today()
        current_year = today.year
        cycles = []
        
        num_cycles = (forecast_years // 9) + 1
        
        for i in range(num_cycles):
            cycle_start = current_year + (i * 9)
            cycle_end = cycle_start + 9
            
            # Calculate personal year for cycle start
            personal_year = self.calculator.calculate_personal_year_number(birth_date, cycle_start)
            
            cycles.append({
                'cycle_number': i + 1,
                'start_year': cycle_start,
                'end_year': cycle_end,
                'personal_year_start': personal_year,
                'cycle_theme': self._get_cycle_theme(personal_year),
                'key_focus': self._get_cycle_focus(personal_year),
                'is_current': cycle_start <= current_year < cycle_end
            })
        
        return cycles
    
    def _calculate_life_forecast(
        self,
        birth_date: date,
        life_path: int,
        destiny: int,
        forecast_years: int
    ) -> Dict[str, Any]:
        """Calculate life forecast for forecast period."""
        today = date.today()
        current_year = today.year
        
        yearly_forecasts = []
        
        for year_offset in range(forecast_years):
            year = current_year + year_offset
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            
            # Calculate year theme
            year_theme = self._get_year_theme(personal_year, life_path, destiny)
            
            yearly_forecasts.append({
                'year': year,
                'personal_year': personal_year,
                'theme': year_theme,
                'energy_level': self._get_energy_level(personal_year),
                'key_events': self._get_key_events(personal_year),
                'advice': self._get_year_advice(personal_year)
            })
        
        return {
            'forecast_period': f"{current_year} - {current_year + forecast_years - 1}",
            'yearly_forecasts': yearly_forecasts,
            'overall_trend': self._get_overall_trend(yearly_forecasts)
        }
    
    def _identify_breakthrough_years(
        self,
        birth_date: date,
        life_path: int,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Identify breakthrough years (years of major progress)."""
        today = date.today()
        current_year = today.year
        
        # Breakthrough numbers: 1, 5, 8 (new beginnings, change, material success)
        breakthrough_numbers = [1, 5, 8]
        breakthrough_years = []
        
        for year_offset in range(forecast_years):
            year = current_year + year_offset
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            
            if personal_year in breakthrough_numbers:
                breakthrough_years.append({
                    'year': year,
                    'personal_year': personal_year,
                    'breakthrough_type': self._get_breakthrough_type(personal_year),
                    'description': self._get_breakthrough_description(personal_year),
                    'preparation': self._get_breakthrough_preparation(personal_year)
                })
        
        return breakthrough_years
    
    def _identify_crisis_years(
        self,
        birth_date: date,
        life_path: int,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Identify crisis years (challenging periods)."""
        today = date.today()
        current_year = today.year
        
        # Crisis numbers: 4, 7, 9 (challenges, introspection, endings)
        crisis_numbers = [4, 7, 9]
        crisis_years = []
        
        for year_offset in range(forecast_years):
            year = current_year + year_offset
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            
            if personal_year in crisis_numbers:
                crisis_years.append({
                    'year': year,
                    'personal_year': personal_year,
                    'crisis_type': self._get_crisis_type(personal_year),
                    'description': self._get_crisis_description(personal_year),
                    'guidance': self._get_crisis_guidance(personal_year)
                })
        
        return crisis_years
    
    def _identify_opportunity_periods(
        self,
        birth_date: date,
        life_path: int,
        forecast_years: int
    ) -> List[Dict[str, Any]]:
        """Identify opportunity periods (favorable times)."""
        today = date.today()
        current_year = today.year
        
        # Opportunity numbers: 2, 3, 6 (cooperation, creativity, service)
        opportunity_numbers = [2, 3, 6]
        opportunities = []
        
        for year_offset in range(forecast_years):
            year = current_year + year_offset
            personal_year = self.calculator.calculate_personal_year_number(birth_date, year)
            
            if personal_year in opportunity_numbers:
                opportunities.append({
                    'year': year,
                    'personal_year': personal_year,
                    'opportunity_type': self._get_opportunity_type(personal_year),
                    'description': self._get_opportunity_description(personal_year),
                    'action': self._get_opportunity_action(personal_year)
                })
        
        return opportunities
    
    def _calculate_long_term_forecast(
        self,
        birth_date: date,
        life_path: int,
        destiny: int,
        forecast_years: int
    ) -> Dict[str, Any]:
        """Calculate long-term life path forecast."""
        # Calculate major milestones
        milestones = []
        
        # Milestone years based on life path
        milestone_intervals = [life_path * 3, life_path * 5, life_path * 7]
        
        today = date.today()
        current_year = today.year
        current_age = current_year - birth_date.year
        
        for interval in milestone_intervals:
            milestone_age = current_age + interval
            milestone_year = current_year + interval
            
            if milestone_year <= current_year + forecast_years:
                milestones.append({
                    'year': milestone_year,
                    'age': milestone_age,
                    'milestone_type': self._get_milestone_type(interval, life_path),
                    'significance': self._get_milestone_significance(interval, life_path, destiny)
                })
        
        return {
            'forecast_span': f"{current_year} - {current_year + forecast_years - 1}",
            'major_milestones': milestones,
            'life_path_theme': self._get_life_path_theme(life_path),
            'destiny_alignment': self._get_destiny_alignment(destiny),
            'overall_direction': self._get_overall_direction(life_path, destiny)
        }
    
    def _get_cycle_theme(self, personal_year: int) -> str:
        """Get theme for 9-year cycle."""
        themes = {
            1: "New Beginnings and Leadership",
            2: "Partnership and Cooperation",
            3: "Creativity and Expression",
            4: "Building and Stability",
            5: "Change and Freedom",
            6: "Service and Responsibility",
            7: "Spiritual Growth",
            8: "Material Success",
            9: "Completion and Wisdom"
        }
        return themes.get(personal_year, f"Cycle theme {personal_year}")
    
    def _get_cycle_focus(self, personal_year: int) -> str:
        """Get key focus for cycle."""
        focus_map = {
            1: "Establishing new directions",
            2: "Building partnerships",
            3: "Creative projects",
            4: "Foundation building",
            5: "Embracing change",
            6: "Service to others",
            7: "Inner growth",
            8: "Material achievements",
            9: "Completing cycles"
        }
        return focus_map.get(personal_year, f"Focus for cycle {personal_year}")
    
    def _get_year_theme(self, personal_year: int, life_path: int, destiny: int) -> str:
        """Get theme for specific year."""
        return self._get_cycle_theme(personal_year)
    
    def _get_energy_level(self, personal_year: int) -> str:
        """Get energy level for year."""
        high_energy = [1, 3, 5, 8]
        moderate_energy = [2, 4, 6]
        low_energy = [7, 9]
        
        if personal_year in high_energy:
            return 'high'
        elif personal_year in moderate_energy:
            return 'moderate'
        else:
            return 'low'
    
    def _get_key_events(self, personal_year: int) -> List[str]:
        """Get key events likely for year."""
        events_map = {
            1: ["New opportunities", "Leadership roles", "Fresh starts"],
            2: ["Partnerships", "Collaborations", "Diplomatic situations"],
            3: ["Creative projects", "Communication", "Social activities"],
            4: ["Building projects", "Stability", "Hard work"],
            5: ["Changes", "Travel", "New experiences"],
            6: ["Family matters", "Service", "Responsibilities"],
            7: ["Spiritual growth", "Study", "Reflection"],
            8: ["Material success", "Achievements", "Recognition"],
            9: ["Completions", "Letting go", "Service to others"]
        }
        return events_map.get(personal_year, [])
    
    def _get_year_advice(self, personal_year: int) -> str:
        """Get advice for year."""
        advice_map = {
            1: "Take initiative and lead",
            2: "Cooperate and build partnerships",
            3: "Express creativity and communicate",
            4: "Build solid foundations",
            5: "Embrace change and be flexible",
            6: "Serve others and take responsibility",
            7: "Focus on inner growth and learning",
            8: "Pursue material goals with balance",
            9: "Complete cycles and prepare for new beginnings"
        }
        return advice_map.get(personal_year, f"Advice for year {personal_year}")
    
    def _get_overall_trend(self, yearly_forecasts: List[Dict]) -> str:
        """Get overall trend from forecasts."""
        high_energy_years = sum(1 for f in yearly_forecasts if f['energy_level'] == 'high')
        total_years = len(yearly_forecasts)
        
        if high_energy_years > total_years * 0.5:
            return "Overall trend is positive with many high-energy years ahead"
        elif high_energy_years > total_years * 0.3:
            return "Overall trend is balanced with mix of energy levels"
        else:
            return "Overall trend requires patience and steady progress"
    
    def _get_breakthrough_type(self, personal_year: int) -> str:
        """Get breakthrough type."""
        types_map = {
            1: "New Beginning Breakthrough",
            5: "Change and Freedom Breakthrough",
            8: "Material Success Breakthrough"
        }
        return types_map.get(personal_year, "Breakthrough")
    
    def _get_breakthrough_description(self, personal_year: int) -> str:
        """Get breakthrough description."""
        descriptions = {
            1: "Major new beginning and leadership opportunity",
            5: "Significant change leading to freedom and expansion",
            8: "Material success and achievement breakthrough"
        }
        return descriptions.get(personal_year, f"Breakthrough in year {personal_year}")
    
    def _get_breakthrough_preparation(self, personal_year: int) -> str:
        """Get preparation advice for breakthrough."""
        prep_map = {
            1: "Prepare for leadership roles and new directions",
            5: "Be ready for change and stay flexible",
            8: "Focus on material goals and achievements"
        }
        return prep_map.get(personal_year, "Prepare for significant progress")
    
    def _get_crisis_type(self, personal_year: int) -> str:
        """Get crisis type."""
        types_map = {
            4: "Foundation Crisis",
            7: "Spiritual Crisis",
            9: "Completion Crisis"
        }
        return types_map.get(personal_year, "Crisis")
    
    def _get_crisis_description(self, personal_year: int) -> str:
        """Get crisis description."""
        descriptions = {
            4: "Challenges in building foundations and stability",
            7: "Period of introspection and spiritual questioning",
            9: "Endings and completions requiring letting go"
        }
        return descriptions.get(personal_year, f"Crisis period in year {personal_year}")
    
    def _get_crisis_guidance(self, personal_year: int) -> str:
        """Get guidance for crisis."""
        guidance_map = {
            4: "Focus on building solid foundations, be patient",
            7: "Use this time for reflection and spiritual growth",
            9: "Let go of what no longer serves, prepare for new cycle"
        }
        return guidance_map.get(personal_year, "Navigate challenges with patience and wisdom")
    
    def _get_opportunity_type(self, personal_year: int) -> str:
        """Get opportunity type."""
        types_map = {
            2: "Partnership Opportunity",
            3: "Creative Opportunity",
            6: "Service Opportunity"
        }
        return types_map.get(personal_year, "Opportunity")
    
    def _get_opportunity_description(self, personal_year: int) -> str:
        """Get opportunity description."""
        descriptions = {
            2: "Opportunities for partnerships and cooperation",
            3: "Opportunities for creative expression and communication",
            6: "Opportunities for service and helping others"
        }
        return descriptions.get(personal_year, f"Opportunity in year {personal_year}")
    
    def _get_opportunity_action(self, personal_year: int) -> str:
        """Get action for opportunity."""
        actions_map = {
            2: "Seek partnerships and collaborations",
            3: "Express creativity and communicate openly",
            6: "Offer service and help others"
        }
        return actions_map.get(personal_year, "Seize opportunities as they arise")
    
    def _get_milestone_type(self, interval: int, life_path: int) -> str:
        """Get milestone type."""
        if interval == life_path * 3:
            return "Early Milestone"
        elif interval == life_path * 5:
            return "Mid-Life Milestone"
        else:
            return "Later Milestone"
    
    def _get_milestone_significance(self, interval: int, life_path: int, destiny: int) -> str:
        """Get milestone significance."""
        return f"Significant life transition aligned with your life path {life_path} and destiny {destiny}"
    
    def _get_life_path_theme(self, life_path: int) -> str:
        """Get life path theme."""
        return f"Your life path {life_path} guides your long-term direction"
    
    def _get_destiny_alignment(self, destiny: int) -> str:
        """Get destiny alignment."""
        return f"Your destiny {destiny} shapes your ultimate purpose"
    
    def _get_overall_direction(self, life_path: int, destiny: int) -> str:
        """Get overall direction."""
        return f"Your path combines life path {life_path} energy with destiny {destiny} purpose, creating a unique journey of growth and fulfillment"
    
    def _generate_summary(
        self,
        breakthrough_years: List[Dict],
        crisis_years: List[Dict],
        opportunity_periods: List[Dict]
    ) -> str:
        """Generate predictive summary."""
        parts = []
        
        if breakthrough_years:
            parts.append(f"{len(breakthrough_years)} breakthrough year(s) identified for major progress.")
        
        if crisis_years:
            parts.append(f"{len(crisis_years)} challenging year(s) requiring careful navigation.")
        
        if opportunity_periods:
            parts.append(f"{len(opportunity_periods)} opportunity period(s) for growth and expansion.")
        
        return " ".join(parts) if parts else "Your predictive numerology reveals a balanced path ahead."

