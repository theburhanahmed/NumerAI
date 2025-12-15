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

