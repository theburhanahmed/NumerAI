"""
Spiritual Numerology service for soul contracts, karmic cycles, and rebirth cycles.
"""
from typing import Dict, List, Any, Optional
from datetime import date
from ..numerology import NumerologyCalculator


class SpiritualNumerologyService:
    """Service for Spiritual Numerology calculations."""
    
    def __init__(self, system: str = 'pythagorean'):
        """Initialize with calculation system."""
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
    
    def calculate_spiritual_profile(
        self,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive spiritual numerology profile.
        
        Returns:
            Spiritual profile with soul contracts, karmic cycles, rebirth cycles
        """
        # Calculate base numbers
        life_path = self.calculator.calculate_life_path_number(birth_date)
        destiny = self.calculator.calculate_destiny_number(full_name)
        soul_urge = self.calculator.calculate_soul_urge_number(full_name)
        
        # Calculate spiritual numbers
        soul_contracts = self._calculate_soul_contracts(life_path, destiny, soul_urge, birth_date)
        karmic_cycles = self._calculate_karmic_cycles(birth_date, life_path)
        rebirth_cycles = self._calculate_rebirth_cycles(birth_date, life_path)
        divine_gifts = self._identify_divine_gifts(life_path, destiny, soul_urge)
        spiritual_alignment = self._calculate_spiritual_alignment(birth_date, life_path)
        past_life_connections = self._analyze_past_life_connections(life_path, destiny, soul_urge)
        
        return {
            'soul_contracts': soul_contracts,
            'karmic_cycles': karmic_cycles,
            'rebirth_cycles': rebirth_cycles,
            'divine_gifts': divine_gifts,
            'spiritual_alignment': spiritual_alignment,
            'past_life_connections': past_life_connections,
            'interpretation': self._generate_interpretation(
                soul_contracts,
                karmic_cycles,
                rebirth_cycles,
                divine_gifts
            )
        }
    
    def _calculate_soul_contracts(
        self,
        life_path: int,
        destiny: int,
        soul_urge: int,
        birth_date: date
    ) -> List[Dict[str, Any]]:
        """Calculate soul contracts from numerology numbers."""
        contracts = []
        
        # Primary soul contract (life path + destiny)
        primary_contract = life_path + destiny
        primary_reduced = self.calculator._reduce_to_single_digit(primary_contract, preserve_master=False)
        
        contracts.append({
            'contract_number': primary_reduced,
            'type': 'primary',
            'description': self._get_soul_contract_description(primary_reduced),
            'lessons': self._get_soul_contract_lessons(primary_reduced)
        })
        
        # Secondary soul contract (soul urge + life path)
        secondary_contract = soul_urge + life_path
        secondary_reduced = self.calculator._reduce_to_single_digit(secondary_contract, preserve_master=False)
        
        if secondary_reduced != primary_reduced:
            contracts.append({
                'contract_number': secondary_reduced,
                'type': 'secondary',
                'description': self._get_soul_contract_description(secondary_reduced),
                'lessons': self._get_soul_contract_lessons(secondary_reduced)
            })
        
        return contracts
    
    def _calculate_karmic_cycles(
        self,
        birth_date: date,
        life_path: int
    ) -> List[Dict[str, Any]]:
        """Calculate karmic cycles timeline."""
        today = date.today()
        current_year = today.year
        cycles = []
        
        # Karmic cycles are typically 9-year periods
        for i in range(5):  # Next 5 cycles
            cycle_start = current_year + (i * 9)
            cycle_end = cycle_start + 9
            
            # Calculate cycle number
            cycle_base = life_path + i
            cycle_number = self.calculator._reduce_to_single_digit(cycle_base, preserve_master=False)
            
            cycles.append({
                'cycle_number': cycle_number,
                'start_year': cycle_start,
                'end_year': cycle_end,
                'duration_years': 9,
                'karmic_theme': self._get_karmic_theme(cycle_number),
                'lessons': self._get_karmic_lessons(cycle_number),
                'is_current': cycle_start <= current_year < cycle_end
            })
        
        return cycles
    
    def _calculate_rebirth_cycles(
        self,
        birth_date: date,
        life_path: int
    ) -> List[Dict[str, Any]]:
        """Calculate rebirth cycles (major life transformations)."""
        today = date.today()
        current_year = today.year
        cycles = []
        
        # Rebirth cycles are typically 27-year periods (3 x 9)
        for i in range(3):  # Next 3 rebirth cycles
            cycle_start = current_year + (i * 27)
            cycle_end = cycle_start + 27
            
            # Calculate rebirth number
            rebirth_base = life_path + (i * 3)
            rebirth_number = self.calculator._reduce_to_single_digit(rebirth_base, preserve_master=False)
            
            cycles.append({
                'rebirth_number': rebirth_number,
                'start_year': cycle_start,
                'end_year': cycle_end,
                'duration_years': 27,
                'transformation_theme': self._get_rebirth_theme(rebirth_number),
                'spiritual_growth': self._get_rebirth_growth(rebirth_number),
                'is_current': cycle_start <= current_year < cycle_end
            })
        
        return cycles
    
    def _identify_divine_gifts(
        self,
        life_path: int,
        destiny: int,
        soul_urge: int
    ) -> List[Dict[str, Any]]:
        """Identify divine gifts from numerology numbers."""
        gifts = []
        
        # Check for master numbers (divine gifts)
        if life_path in [11, 22, 33]:
            gifts.append({
                'number': life_path,
                'source': 'life_path',
                'gift': self._get_divine_gift(life_path),
                'description': self._get_divine_gift_description(life_path)
            })
        
        if destiny in [11, 22, 33] and destiny != life_path:
            gifts.append({
                'number': destiny,
                'source': 'destiny',
                'gift': self._get_divine_gift(destiny),
                'description': self._get_divine_gift_description(destiny)
            })
        
        if soul_urge in [11, 22, 33] and soul_urge not in [life_path, destiny]:
            gifts.append({
                'number': soul_urge,
                'source': 'soul_urge',
                'gift': self._get_divine_gift(soul_urge),
                'description': self._get_divine_gift_description(soul_urge)
            })
        
        # Check for special number combinations
        if life_path == 7 or destiny == 7 or soul_urge == 7:
            gifts.append({
                'number': 7,
                'source': 'spiritual',
                'gift': 'Spiritual Insight',
                'description': 'Deep spiritual understanding and intuitive wisdom'
            })
        
        return gifts
    
    def _calculate_spiritual_alignment(
        self,
        birth_date: date,
        life_path: int
    ) -> Dict[str, Any]:
        """Calculate spiritual alignment periods."""
        today = date.today()
        current_year = today.year
        
        # Calculate personal year
        personal_year = self.calculator.calculate_personal_year_number(birth_date, current_year)
        
        # Spiritual alignment numbers (1, 3, 7, 9)
        alignment_numbers = [1, 3, 7, 9]
        is_aligned = personal_year in alignment_numbers
        
        # Find next alignment periods
        next_alignments = []
        for year_offset in range(1, 10):
            year = current_year + year_offset
            py = self.calculator.calculate_personal_year_number(birth_date, year)
            if py in alignment_numbers:
                next_alignments.append({
                    'year': year,
                    'personal_year': py,
                    'alignment_type': self._get_alignment_type(py)
                })
        
        return {
            'current_alignment': is_aligned,
            'current_personal_year': personal_year,
            'alignment_level': 'high' if is_aligned else 'moderate',
            'next_alignment_periods': next_alignments[:3]
        }
    
    def _analyze_past_life_connections(
        self,
        life_path: int,
        destiny: int,
        soul_urge: int
    ) -> Dict[str, Any]:
        """Analyze past life connections from numbers."""
        # Karmic debt numbers indicate past life lessons
        karmic_debt_numbers = [13, 14, 16, 19]
        
        # Check for karmic patterns
        numbers = [life_path, destiny, soul_urge]
        karmic_indicators = []
        
        for num in numbers:
            reduced = self.calculator._reduce_to_single_digit(num, preserve_master=False)
            if num in karmic_debt_numbers or reduced in [4, 5, 7, 8]:
                karmic_indicators.append({
                    'number': num,
                    'source': 'life_path' if num == life_path else 'destiny' if num == destiny else 'soul_urge',
                    'karmic_meaning': self._get_karmic_meaning(reduced)
                })
        
        return {
            'has_karmic_debt': len(karmic_indicators) > 0,
            'karmic_indicators': karmic_indicators,
            'past_life_themes': self._get_past_life_themes(life_path, destiny, soul_urge),
            'soul_evolution': self._get_soul_evolution(life_path, destiny, soul_urge)
        }
    
    def _get_soul_contract_description(self, number: int) -> str:
        """Get description for soul contract number."""
        descriptions = {
            1: "Soul contract to lead and inspire others",
            2: "Soul contract to bring harmony and cooperation",
            3: "Soul contract to express creativity and joy",
            4: "Soul contract to build stability and foundation",
            5: "Soul contract to embrace change and freedom",
            6: "Soul contract to serve and nurture",
            7: "Soul contract to seek spiritual truth",
            8: "Soul contract to achieve material mastery",
            9: "Soul contract to serve humanity"
        }
        return descriptions.get(number, f"Soul contract number {number}")
    
    def _get_soul_contract_lessons(self, number: int) -> List[str]:
        """Get lessons for soul contract."""
        lessons_map = {
            1: ["Learn independence", "Develop leadership", "Trust your own path"],
            2: ["Learn cooperation", "Develop diplomacy", "Balance giving and receiving"],
            3: ["Express creativity", "Share joy", "Communicate authentically"],
            4: ["Build foundations", "Develop discipline", "Create stability"],
            5: ["Embrace change", "Seek freedom", "Stay adaptable"],
            6: ["Serve others", "Nurture relationships", "Take responsibility"],
            7: ["Seek truth", "Develop intuition", "Trust inner wisdom"],
            8: ["Balance material and spiritual", "Use power wisely", "Achieve mastery"],
            9: ["Serve humanity", "Let go of attachments", "Embrace universal love"]
        }
        return lessons_map.get(number, [])
    
    def _get_karmic_theme(self, number: int) -> str:
        """Get karmic theme for cycle."""
        themes = {
            1: "Karmic lesson in independence and leadership",
            2: "Karmic lesson in cooperation and partnership",
            3: "Karmic lesson in creative expression",
            4: "Karmic lesson in building foundations",
            5: "Karmic lesson in handling change",
            6: "Karmic lesson in service and responsibility",
            7: "Karmic lesson in spiritual development",
            8: "Karmic lesson in material balance",
            9: "Karmic lesson in universal service"
        }
        return themes.get(number, f"Karmic cycle {number}")
    
    def _get_karmic_lessons(self, number: int) -> List[str]:
        """Get karmic lessons for cycle."""
        return self._get_soul_contract_lessons(number)
    
    def _get_rebirth_theme(self, number: int) -> str:
        """Get rebirth transformation theme."""
        themes = {
            1: "Rebirth into leadership and independence",
            2: "Rebirth into harmony and partnership",
            3: "Rebirth into creative expression",
            4: "Rebirth into stability and foundation",
            5: "Rebirth into freedom and change",
            6: "Rebirth into service and nurturing",
            7: "Rebirth into spiritual awakening",
            8: "Rebirth into material mastery",
            9: "Rebirth into universal service"
        }
        return themes.get(number, f"Rebirth cycle {number}")
    
    def _get_rebirth_growth(self, number: int) -> str:
        """Get spiritual growth for rebirth cycle."""
        growth_map = {
            1: "Developing authentic leadership and self-reliance",
            2: "Learning to balance independence with cooperation",
            3: "Expressing creativity and joy authentically",
            4: "Building solid foundations for future growth",
            5: "Embracing change while maintaining stability",
            6: "Serving others while maintaining self-care",
            7: "Deepening spiritual understanding and intuition",
            8: "Balancing material success with spiritual growth",
            9: "Expanding love and service to all humanity"
        }
        return growth_map.get(number, f"Spiritual growth in cycle {number}")
    
    def _get_divine_gift(self, number: int) -> str:
        """Get divine gift name."""
        gifts = {
            11: "Intuitive Messenger",
            22: "Master Builder",
            33: "Master Teacher"
        }
        return gifts.get(number, f"Divine Gift {number}")
    
    def _get_divine_gift_description(self, number: int) -> str:
        """Get divine gift description."""
        descriptions = {
            11: "You carry the gift of intuitive insight and spiritual communication",
            22: "You carry the gift of manifesting dreams into reality",
            33: "You carry the gift of teaching and uplifting others"
        }
        return descriptions.get(number, f"Divine gift number {number}")
    
    def _get_alignment_type(self, number: int) -> str:
        """Get alignment type for personal year."""
        types_map = {
            1: "New Beginnings",
            3: "Creative Expression",
            7: "Spiritual Awakening",
            9: "Completion and Service"
        }
        return types_map.get(number, "Moderate Alignment")
    
    def _get_karmic_meaning(self, number: int) -> str:
        """Get karmic meaning for number."""
        meanings = {
            4: "Past life lesson in building foundations",
            5: "Past life lesson in handling change",
            7: "Past life lesson in spiritual development",
            8: "Past life lesson in material balance"
        }
        return meanings.get(number, f"Karmic indicator {number}")
    
    def _get_past_life_themes(
        self,
        life_path: int,
        destiny: int,
        soul_urge: int
    ) -> List[str]:
        """Get past life themes from numbers."""
        themes = []
        
        if life_path in [4, 5, 7, 8]:
            themes.append(f"Past life theme in life path {life_path}")
        if destiny in [4, 5, 7, 8]:
            themes.append(f"Past life theme in destiny {destiny}")
        if soul_urge in [4, 5, 7, 8]:
            themes.append(f"Past life theme in soul urge {soul_urge}")
        
        return themes
    
    def _get_soul_evolution(
        self,
        life_path: int,
        destiny: int,
        soul_urge: int
    ) -> str:
        """Get soul evolution description."""
        # Calculate evolution level
        total = life_path + destiny + soul_urge
        evolution_number = self.calculator._reduce_to_single_digit(total, preserve_master=False)
        
        evolution_levels = {
            1: "Early soul evolution - learning independence",
            2: "Developing cooperation and balance",
            3: "Expressing creativity and joy",
            4: "Building foundations for growth",
            5: "Embracing change and freedom",
            6: "Learning service and responsibility",
            7: "Deepening spiritual understanding",
            8: "Mastering material and spiritual balance",
            9: "Advanced soul evolution - universal service"
        }
        
        return evolution_levels.get(evolution_number, f"Soul evolution level {evolution_number}")
    
    def _generate_interpretation(
        self,
        soul_contracts: List[Dict],
        karmic_cycles: List[Dict],
        rebirth_cycles: List[Dict],
        divine_gifts: List[Dict]
    ) -> str:
        """Generate overall spiritual interpretation."""
        parts = []
        
        if soul_contracts:
            parts.append(f"You have {len(soul_contracts)} soul contract(s) to fulfill in this lifetime.")
        
        if divine_gifts:
            parts.append(f"You carry {len(divine_gifts)} divine gift(s) that enhance your spiritual path.")
        
        current_karmic = [c for c in karmic_cycles if c.get('is_current')]
        if current_karmic:
            parts.append(f"You are in a karmic cycle focused on: {current_karmic[0]['karmic_theme']}")
        
        current_rebirth = [c for c in rebirth_cycles if c.get('is_current')]
        if current_rebirth:
            parts.append(f"You are in a rebirth cycle of: {current_rebirth[0]['transformation_theme']}")
        
        return " ".join(parts) if parts else "Your spiritual numerology profile reveals your soul's journey and purpose."
    
    def identify_soul_contracts_detailed(
        self,
        full_name: str,
        birth_date: date
    ) -> List[Dict[str, Any]]:
        """
        Identify detailed soul contracts with comprehensive analysis.
        
        Args:
            full_name: Full name
            birth_date: Birth date
        
        Returns:
            List of detailed soul contract dictionaries
        """
        # Calculate base numbers
        life_path = self.calculator.calculate_life_path_number(birth_date)
        destiny = self.calculator.calculate_destiny_number(full_name)
        soul_urge = self.calculator.calculate_soul_urge_number(full_name)
        
        contracts = self._calculate_soul_contracts(life_path, destiny, soul_urge, birth_date)
        
        # Enhance with detailed analysis
        detailed_contracts = []
        for contract in contracts:
            contract_num = contract['contract_number']
            detailed_contracts.append({
                **contract,
                'fulfillment_indicators': self._get_fulfillment_indicators(contract_num),
                'challenges': self._get_contract_challenges(contract_num),
                'opportunities': self._get_contract_opportunities(contract_num),
                'meditation_guidance': self._get_contract_meditation(contract_num),
                'affirmations': self._get_contract_affirmations(contract_num)
            })
        
        return detailed_contracts
    
    def analyze_karmic_timeline(
        self,
        birth_date: date,
        forecast_years: int = 50
    ) -> Dict[str, Any]:
        """
        Analyze karmic timeline with visualization data.
        
        Args:
            birth_date: Birth date
            forecast_years: Number of years to forecast
        
        Returns:
            Dictionary with timeline visualization data
        """
        today = date.today()
        current_year = today.year
        
        life_path = self.calculator.calculate_life_path_number(birth_date)
        cycles = self._calculate_karmic_cycles(birth_date, life_path)
        
        # Create timeline data with milestones
        timeline_events = []
        
        for cycle in cycles:
            if cycle['start_year'] <= current_year + forecast_years:
                # Add transition markers
                if cycle.get('is_current'):
                    timeline_events.append({
                        'year': current_year,
                        'type': 'current_cycle',
                        'cycle': cycle,
                        'marker': 'current'
                    })
                
                timeline_events.append({
                    'year': cycle['start_year'],
                    'type': 'cycle_start',
                    'cycle': cycle,
                    'marker': 'transition'
                })
                
                timeline_events.append({
                    'year': cycle['end_year'],
                    'type': 'cycle_end',
                    'cycle': cycle,
                    'marker': 'transition'
                })
        
        # Sort by year
        timeline_events.sort(key=lambda x: x['year'])
        
        return {
            'timeline_events': timeline_events,
            'cycles': cycles,
            'forecast_span': f"{current_year} - {current_year + forecast_years}",
            'current_cycle': next((c for c in cycles if c.get('is_current')), None),
            'upcoming_transitions': [
                e for e in timeline_events 
                if e['year'] > current_year and e['type'] in ['cycle_start', 'cycle_end']
            ][:5]  # Next 5 transitions
        }
    
    def calculate_rebirth_cycles_detailed(
        self,
        birth_date: date
    ) -> List[Dict[str, Any]]:
        """
        Calculate detailed rebirth cycles with transition analysis.
        
        Args:
            birth_date: Birth date
        
        Returns:
            List of detailed rebirth cycle dictionaries
        """
        life_path = self.calculator.calculate_life_path_number(birth_date)
        cycles = self._calculate_rebirth_cycles(birth_date, life_path)
        
        # Enhance with transition analysis
        detailed_cycles = []
        for cycle in cycles:
            cycle_num = cycle['rebirth_number']
            detailed_cycles.append({
                **cycle,
                'transition_periods': self._get_rebirth_transitions(cycle),
                'preparation_steps': self._get_rebirth_preparation(cycle_num),
                'spiritual_practices': self._get_rebirth_practices(cycle_num),
                'warning_signs': self._get_rebirth_warnings(cycle_num)
            })
        
        return detailed_cycles
    
    def optimize_meditation_timing(
        self,
        birth_date: date,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Optimize meditation timing based on numerology cycles.
        
        Args:
            birth_date: Birth date
            target_date: Optional target date, defaults to today
        
        Returns:
            Dictionary with optimal meditation timing recommendations
        """
        if target_date is None:
            target_date = date.today()
        
        # Calculate current cycles
        personal_year = self.calculator.calculate_personal_year_number(birth_date, target_date.year)
        personal_month = self.calculator.calculate_personal_month_number(
            birth_date, target_date.year, target_date.month
        )
        
        # Calculate personal day
        personal_day = self.calculator.calculate_personal_day_number(
            birth_date, target_date
        )
        
        # Optimal meditation times based on numbers
        optimal_times = self._get_optimal_meditation_times(personal_day, personal_month, personal_year)
        
        # Meditation practices based on cycles
        practices = self._get_meditation_practices(personal_year)
        
        return {
            'target_date': target_date.isoformat(),
            'personal_year': personal_year,
            'personal_month': personal_month,
            'personal_day': personal_day,
            'optimal_times': optimal_times,
            'recommended_practices': practices,
            'meditation_affirmations': self._get_meditation_affirmations(personal_year),
            'crystal_recommendations': self._get_meditation_crystals(personal_year)
        }
    
    def _get_fulfillment_indicators(self, contract_number: int) -> List[str]:
        """Get indicators of contract fulfillment."""
        indicators_map = {
            1: ["Taking independent action", "Leading with confidence", "Trusting your path"],
            2: ["Building harmonious relationships", "Practicing cooperation", "Finding balance"],
            3: ["Expressing creativity freely", "Sharing joy with others", "Communicating authentically"],
            4: ["Building stable foundations", "Maintaining discipline", "Creating structure"],
            5: ["Embracing change courageously", "Seeking new experiences", "Staying flexible"],
            6: ["Serving others selflessly", "Nurturing relationships", "Taking responsibility"],
            7: ["Seeking deeper truth", "Trusting intuition", "Engaging in spiritual practice"],
            8: ["Achieving material success", "Balancing power wisely", "Mastering skills"],
            9: ["Serving humanity", "Letting go of attachments", "Practicing universal love"]
        }
        return indicators_map.get(contract_number, [])
    
    def _get_contract_challenges(self, contract_number: int) -> List[str]:
        """Get challenges for soul contract."""
        challenges_map = {
            1: ["Overcoming fear of independence", "Learning to trust yourself", "Balancing leadership with humility"],
            2: ["Avoiding codependency", "Learning to assert needs", "Finding your voice in partnerships"],
            3: ["Overcoming creative blocks", "Avoiding superficiality", "Focusing energy"],
            4: ["Avoiding rigidity", "Embracing change when needed", "Finding work-life balance"],
            5: ["Finding stability amidst change", "Avoiding restlessness", "Maintaining commitments"],
            6: ["Setting healthy boundaries", "Avoiding over-giving", "Self-care"],
            7: ["Staying grounded", "Avoiding isolation", "Balancing spirituality with practicality"],
            8: ["Avoiding materialism", "Using power ethically", "Balancing success with relationships"],
            9: ["Avoiding burnout", "Setting boundaries", "Balancing service with self-care"]
        }
        return challenges_map.get(contract_number, [])
    
    def _get_contract_opportunities(self, contract_number: int) -> List[str]:
        """Get opportunities for soul contract."""
        opportunities_map = {
            1: ["Leadership roles", "Starting new ventures", "Inspiring others"],
            2: ["Partnerships", "Diplomacy", "Creating harmony"],
            3: ["Creative projects", "Communication", "Expressing joy"],
            4: ["Building projects", "Creating stability", "Organization"],
            5: ["Adventure", "New experiences", "Freedom"],
            6: ["Service", "Nurturing", "Healing"],
            7: ["Spiritual growth", "Research", "Wisdom"],
            8: ["Material success", "Achievement", "Power"],
            9: ["Humanitarian work", "Teaching", "Completion"]
        }
        return opportunities_map.get(contract_number, [])
    
    def _get_contract_meditation(self, contract_number: int) -> str:
        """Get meditation guidance for contract."""
        guidance_map = {
            1: "Meditate on independence and self-reliance. Visualize yourself leading confidently.",
            2: "Meditate on harmony and balance. Focus on partnership and cooperation.",
            3: "Meditate on creativity and expression. Visualize your creative flow.",
            4: "Meditate on stability and foundation. Ground yourself in structure.",
            5: "Meditate on change and freedom. Embrace transformation.",
            6: "Meditate on service and love. Feel compassion flowing.",
            7: "Meditate on truth and wisdom. Connect with your inner knowing.",
            8: "Meditate on abundance and power. Visualize success with integrity.",
            9: "Meditate on universal love and service. Connect with humanity."
        }
        return guidance_map.get(contract_number, "Meditate on your soul's purpose.")
    
    def _get_contract_affirmations(self, contract_number: int) -> List[str]:
        """Get affirmations for contract."""
        affirmations_map = {
            1: ["I am a confident leader", "I trust my path", "I am independent and strong"],
            2: ["I create harmony", "I balance giving and receiving", "I am a cooperative partner"],
            3: ["I express my creativity freely", "I share joy", "I communicate authentically"],
            4: ["I build strong foundations", "I am disciplined and organized", "I create stability"],
            5: ["I embrace change", "I am free and adventurous", "I adapt easily"],
            6: ["I serve with love", "I nurture others", "I take responsibility"],
            7: ["I seek truth", "I trust my intuition", "I am spiritually connected"],
            8: ["I achieve success", "I use power wisely", "I am abundant"],
            9: ["I serve humanity", "I practice universal love", "I complete cycles"]
        }
        return affirmations_map.get(contract_number, ["I fulfill my soul contract"])
    
    def _get_rebirth_transitions(self, cycle: Dict) -> List[Dict[str, Any]]:
        """Get transition periods for rebirth cycle."""
        transitions = []
        
        # Quarter transitions
        cycle_length = cycle['duration_years']
        quarter = cycle_length // 4
        
        for i in range(1, 4):
            transition_year = cycle['start_year'] + (i * quarter)
            transitions.append({
                'year': transition_year,
                'type': 'quarter_transition',
                'phase': f"Phase {i}",
                'guidance': f"Major transition point in your {cycle['transformation_theme']} cycle"
            })
        
        return transitions
    
    def _get_rebirth_preparation(self, cycle_number: int) -> List[str]:
        """Get preparation steps for rebirth cycle."""
        prep_map = {
            1: ["Prepare for new beginnings", "Clear old patterns", "Set new intentions"],
            2: ["Strengthen relationships", "Practice cooperation", "Build partnerships"],
            3: ["Unlock creativity", "Express yourself", "Share your gifts"],
            4: ["Build foundations", "Create structure", "Establish stability"],
            5: ["Prepare for change", "Be flexible", "Embrace adventure"],
            6: ["Prepare to serve", "Nurture others", "Take responsibility"],
            7: ["Prepare for spiritual growth", "Deepen practice", "Seek truth"],
            8: ["Prepare for success", "Build resources", "Focus on goals"],
            9: ["Prepare for completion", "Let go", "Serve humanity"]
        }
        return prep_map.get(cycle_number, [])
    
    def _get_rebirth_practices(self, cycle_number: int) -> List[str]:
        """Get spiritual practices for rebirth cycle."""
        practices_map = {
            1: ["Leadership meditation", "Independent action", "Vision setting"],
            2: ["Partnership meditation", "Harmony practices", "Cooperation exercises"],
            3: ["Creative expression", "Joy practices", "Communication exercises"],
            4: ["Grounding practices", "Structure building", "Foundation work"],
            5: ["Change acceptance", "Freedom practices", "Adventure planning"],
            6: ["Service practices", "Love meditation", "Nurturing exercises"],
            7: ["Deep meditation", "Spiritual study", "Intuition development"],
            8: ["Abundance meditation", "Success visualization", "Power practices"],
            9: ["Universal love meditation", "Service to others", "Completion rituals"]
        }
        return practices_map.get(cycle_number, [])
    
    def _get_rebirth_warnings(self, cycle_number: int) -> List[str]:
        """Get warning signs for rebirth cycle."""
        warnings_map = {
            1: ["Beware of ego inflation", "Avoid isolation", "Balance independence"],
            2: ["Beware of codependency", "Avoid losing yourself", "Maintain boundaries"],
            3: ["Beware of scattered energy", "Avoid superficiality", "Focus attention"],
            4: ["Beware of rigidity", "Avoid stagnation", "Allow flexibility"],
            5: ["Beware of restlessness", "Avoid impulsivity", "Find grounding"],
            6: ["Beware of over-giving", "Avoid self-neglect", "Set boundaries"],
            7: ["Beware of isolation", "Avoid escapism", "Stay connected"],
            8: ["Beware of materialism", "Avoid power misuse", "Maintain ethics"],
            9: ["Beware of burnout", "Avoid over-giving", "Practice self-care"]
        }
        return warnings_map.get(cycle_number, [])
    
    def _get_optimal_meditation_times(self, personal_day: int, personal_month: int, personal_year: int) -> List[Dict[str, Any]]:
        """Get optimal meditation times based on numerology."""
        # Spiritual numbers (1, 3, 7, 9) indicate better meditation times
        spiritual_numbers = [1, 3, 7, 9]
        
        times = []
        
        if personal_day in spiritual_numbers:
            times.append({
                'time': 'Early Morning (5-7 AM)',
                'reason': f'Personal day {personal_day} is spiritually aligned',
                'priority': 'high'
            })
        
        if personal_month in spiritual_numbers:
            times.append({
                'time': 'Sunset (6-8 PM)',
                'reason': f'Personal month {personal_month} enhances meditation',
                'priority': 'high'
            })
        
        if personal_year in spiritual_numbers:
            times.append({
                'time': 'Midnight (11 PM-1 AM)',
                'reason': f'Personal year {personal_year} supports deep meditation',
                'priority': 'medium'
            })
        
        # Default times if no spiritual numbers
        if not times:
            times.append({
                'time': 'Early Morning (5-7 AM)',
                'reason': 'Universal optimal time',
                'priority': 'medium'
            })
            times.append({
                'time': 'Sunset (6-8 PM)',
                'reason': 'Natural transition time',
                'priority': 'medium'
            })
        
        return times
    
    def _get_meditation_practices(self, personal_year: int) -> List[str]:
        """Get recommended meditation practices."""
        practices_map = {
            1: ["Focus meditation", "Intention setting", "New beginning visualization"],
            2: ["Loving-kindness meditation", "Partnership visualization", "Harmony practice"],
            3: ["Creative visualization", "Joy meditation", "Expression practice"],
            4: ["Grounding meditation", "Stability practice", "Foundation building"],
            5: ["Change acceptance", "Freedom meditation", "Flexibility practice"],
            6: ["Compassion meditation", "Service visualization", "Love practice"],
            7: ["Deep meditation", "Spiritual inquiry", "Wisdom practice"],
            8: ["Abundance meditation", "Success visualization", "Power practice"],
            9: ["Universal love meditation", "Completion practice", "Service visualization"]
        }
        return practices_map.get(personal_year, ["Mindfulness meditation", "Breath awareness"])
    
    def _get_meditation_affirmations(self, personal_year: int) -> List[str]:
        """Get meditation affirmations."""
        affirmations_map = {
            1: ["I am beginning anew", "I lead with confidence", "New opportunities await"],
            2: ["I create harmony", "I am balanced", "Partnerships serve me"],
            3: ["I express creatively", "Joy flows through me", "I communicate clearly"],
            4: ["I am grounded", "Stability supports me", "I build strong foundations"],
            5: ["I embrace change", "Freedom is my nature", "I adapt easily"],
            6: ["I serve with love", "Compassion guides me", "I nurture others"],
            7: ["I seek truth", "Wisdom guides me", "I am spiritually connected"],
            8: ["Abundance flows to me", "I achieve success", "I use power wisely"],
            9: ["I serve humanity", "Universal love flows through me", "I complete cycles"]
        }
        return affirmations_map.get(personal_year, ["I am present", "I am at peace"])
    
    def _get_meditation_crystals(self, personal_year: int) -> List[str]:
        """Get crystal recommendations for meditation."""
        crystals_map = {
            1: ["Clear Quartz", "Citrine", "Carnelian"],
            2: ["Rose Quartz", "Moonstone", "Pearl"],
            3: ["Amethyst", "Lapis Lazuli", "Turquoise"],
            4: ["Hematite", "Obsidian", "Smoky Quartz"],
            5: ["Aquamarine", "Blue Lace Agate", "Chrysocolla"],
            6: ["Rose Quartz", "Green Aventurine", "Emerald"],
            7: ["Amethyst", "Selenite", "Clear Quartz"],
            8: ["Pyrite", "Citrine", "Tiger's Eye"],
            9: ["Amethyst", "Rose Quartz", "Clear Quartz"]
        }
        return crystals_map.get(personal_year, ["Clear Quartz", "Amethyst"])

