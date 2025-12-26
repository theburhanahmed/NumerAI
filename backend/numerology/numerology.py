"""
Numerology calculation engine for NumerAI.
Supports Pythagorean, Chaldean, and Vedic systems.
"""
from datetime import datetime, date
from typing import Dict, Optional, Tuple, List, Set, Any
import re
import collections


class NumerologyCalculator:
    """
    Main numerology calculator supporting multiple systems.
    """
    
    # Pythagorean system (most common)
    PYTHAGOREAN = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    # Chaldean system (alternative)
    CHALDEAN = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
        'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
    }

    # Vedic system (Astro-Numerology)
    VEDIC = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    VOWELS = set('AEIOU')
    MASTER_NUMBERS = {11, 22, 33}
    KARMIC_DEBT_NUMBERS = {13, 14, 16, 19}
    
    def __init__(self, system: str = 'pythagorean'):
        """
        Initialize calculator with specified system.
        
        Args:
            system: 'pythagorean', 'chaldean', or 'vedic'
        """
        if system.lower() not in ['pythagorean', 'chaldean', 'vedic']:
            raise ValueError("System must be 'pythagorean', 'chaldean', or 'vedic'")
        
        self.system = system.lower()
        if self.system == 'pythagorean':
            self.letter_values = self.PYTHAGOREAN
        elif self.system == 'chaldean':
            self.letter_values = self.CHALDEAN
        else:
            self.letter_values = self.VEDIC
    
    def _reduce_to_single_digit(self, number: int, preserve_master: bool = True) -> int:
        """
        Reduce a number to single digit, optionally preserving master numbers.
        """
        if preserve_master and number in self.MASTER_NUMBERS:
            return number
        
        while number > 9:
            number = sum(int(digit) for digit in str(number))
            if preserve_master and number in self.MASTER_NUMBERS:
                return number
        
        return number
    
    def _get_letter_value(self, letter: str) -> int:
        """Get numeric value for a letter."""
        letter = letter.upper()
        if letter not in self.letter_values:
            return 0
        return self.letter_values[letter]
    
    def _sum_name(self, name: str, vowels_only: bool = False, consonants_only: bool = False) -> int:
        """Sum the numeric values of letters in a name."""
        name = name.upper()
        total = 0
        
        for char in name:
            if not char.isalpha():
                continue
            
            is_vowel = char in self.VOWELS
            
            if vowels_only and not is_vowel:
                continue
            if consonants_only and is_vowel:
                continue
            
            total += self._get_letter_value(char)
        
        return total
    
    def calculate_life_path_number(self, birth_date: date) -> int:
        """
        Calculate Life Path Number from birth date.
        Method: reduce(sum of all digits in YYYY MM DD).
        Example: 1987-05-16 -> 1+9+8+7 + 0+5 + 1+6 = 37 -> 10 -> 1.
        """
        digits = [int(d) for d in str(birth_date.year)] + \
                 [int(d) for d in str(birth_date.month)] + \
                 [int(d) for d in str(birth_date.day)]
        total = sum(digits)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_destiny_number(self, full_name: str) -> int:
        """Calculate Destiny Number (Expression Number)."""
        total = self._sum_name(full_name)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_soul_urge_number(self, full_name: str) -> int:
        """Calculate Soul Urge Number (Heart's Desire)."""
        total = self._sum_name(full_name, vowels_only=True)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_personality_number(self, full_name: str) -> int:
        """Calculate Personality Number."""
        total = self._sum_name(full_name, consonants_only=True)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_attitude_number(self, birth_date: date) -> int:
        """Calculate Attitude Number."""
        total = birth_date.day + birth_date.month
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_birthday_number(self, birth_date: date) -> int:
        """
        Calculate Birthday Number (Chaldean).
        
        The Birthday Number represents your inherent talents and abilities.
        It's derived from the day of the month you were born.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Reduced birthday number (1-9, or 11, 22, 33 for master numbers)
        """
        return self._reduce_to_single_digit(birth_date.day, preserve_master=True)
    
    def calculate_driver_number(self, birth_date: date) -> int:
        """
        Calculate Driver Number (Chaldean Numerology).
        
        The Driver Number (also called Psychic Number) represents your inner self,
        how you see yourself, and your basic nature. It's derived from the birth day.
        
        In Chaldean numerology, this number drives your personality and
        indicates your inherent characteristics.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Driver number (1-9, master numbers not typically preserved)
        """
        return self._reduce_to_single_digit(birth_date.day, preserve_master=False)
    
    def calculate_conductor_number(self, birth_date: date) -> int:
        """
        Calculate Conductor Number (Chaldean Numerology).
        
        The Conductor Number (also called Destiny Number in Chaldean) represents
        how others perceive you and your life's direction. It's derived from
        the complete birth date (day + month + year).
        
        This number conducts the energies of your life path and determines
        your destiny's direction.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Conductor number (1-9, or 11, 22, 33 for master numbers)
        """
        # Sum all digits of the complete birth date
        digits = [int(d) for d in str(birth_date.day)] + \
                 [int(d) for d in str(birth_date.month)] + \
                 [int(d) for d in str(birth_date.year)]
        total = sum(digits)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_driver_conductor_compatibility(self, birth_date: date) -> Dict[str, Any]:
        """
        Analyze the relationship between Driver and Conductor numbers.
        
        When Driver and Conductor are in harmony, life flows smoothly.
        When they conflict, there may be internal struggles.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Dictionary with driver, conductor, compatibility analysis
        """
        driver = self.calculate_driver_number(birth_date)
        conductor = self.calculate_conductor_number(birth_date)
        
        # Determine compatibility
        # Compatible pairs: 1-1, 2-2, 3-3, etc. (same), and complementary pairs
        compatible_pairs = {
            (1, 1), (1, 3), (1, 5), (1, 9),
            (2, 2), (2, 4), (2, 6), (2, 8),
            (3, 3), (3, 1), (3, 5), (3, 9),
            (4, 4), (4, 2), (4, 6), (4, 8),
            (5, 5), (5, 1), (5, 3), (5, 7), (5, 9),
            (6, 6), (6, 2), (6, 4), (6, 8), (6, 9),
            (7, 7), (7, 5), (7, 9),
            (8, 8), (8, 2), (8, 4), (8, 6),
            (9, 9), (9, 1), (9, 3), (9, 5), (9, 6), (9, 7),
        }
        
        # Reduce to single digits for comparison
        driver_reduced = self._reduce_to_single_digit(driver, preserve_master=False)
        conductor_reduced = self._reduce_to_single_digit(conductor, preserve_master=False)
        
        is_compatible = (driver_reduced, conductor_reduced) in compatible_pairs or \
                       (conductor_reduced, driver_reduced) in compatible_pairs
        
        # Calculate harmony score
        if driver_reduced == conductor_reduced:
            harmony_score = 100
            harmony_level = 'Perfect Harmony'
        elif is_compatible:
            harmony_score = 75
            harmony_level = 'Good Harmony'
        elif abs(driver_reduced - conductor_reduced) <= 2:
            harmony_score = 50
            harmony_level = 'Moderate Harmony'
        else:
            harmony_score = 25
            harmony_level = 'Challenging - Growth Opportunity'
        
        return {
            'driver_number': driver,
            'conductor_number': conductor,
            'is_compatible': is_compatible,
            'harmony_score': harmony_score,
            'harmony_level': harmony_level,
            'analysis': self._get_driver_conductor_analysis(driver, conductor)
        }
    
    def _get_driver_conductor_analysis(self, driver: int, conductor: int) -> str:
        """Generate analysis text for driver-conductor relationship."""
        driver_reduced = self._reduce_to_single_digit(driver, preserve_master=False)
        conductor_reduced = self._reduce_to_single_digit(conductor, preserve_master=False)
        
        if driver_reduced == conductor_reduced:
            return f"Your Driver ({driver}) and Conductor ({conductor}) are in perfect alignment. Your inner nature and outer destiny are unified, creating a clear and focused life path."
        
        # Specific combination insights
        combination_insights = {
            (1, 8): "Your independent nature (Driver 1) is directed toward material success and authority (Conductor 8). You're meant to lead with power.",
            (8, 1): "Your ambitious nature (Driver 8) leads you toward pioneering new paths (Conductor 1). You're destined to be a trailblazer.",
            (2, 7): "Your diplomatic nature (Driver 2) is guided toward spiritual wisdom (Conductor 7). You're meant to bring harmony through insight.",
            (7, 2): "Your analytical nature (Driver 7) is directed toward partnership (Conductor 2). You're destined to use wisdom in relationships.",
            (3, 6): "Your creative expression (Driver 3) is channeled into nurturing (Conductor 6). You're meant to inspire through care.",
            (6, 3): "Your nurturing nature (Driver 6) leads to creative expression (Conductor 3). You're destined to create beauty through love.",
            (4, 5): "Your stable nature (Driver 4) is directed toward freedom (Conductor 5). You're learning to build while embracing change.",
            (5, 4): "Your adventurous spirit (Driver 5) is grounded by structure (Conductor 4). You're destined to bring innovation to systems.",
        }
        
        specific = combination_insights.get((driver_reduced, conductor_reduced))
        if specific:
            return specific
        
        return f"Your Driver Number {driver} represents your inner nature, while Conductor Number {conductor} shows how destiny guides you. Integrating both energies is your life's work."
    
    def calculate_maturity_number(self, life_path: int, destiny: int) -> int:
        """Calculate Maturity Number."""
        total = life_path + destiny
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_balance_number(self, full_name: str) -> int:
        """Calculate Balance Number."""
        words = full_name.strip().split()
        initials = ''.join(word[0] for word in words if word)
        total = self._sum_name(initials)
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_year_number(self, birth_date: date, target_year: Optional[int] = None) -> int:
        """Calculate Personal Year Number."""
        if target_year is None:
            target_year = datetime.now().year
        
        day = self._reduce_to_single_digit(birth_date.day, preserve_master=False)
        month = self._reduce_to_single_digit(birth_date.month, preserve_master=False)
        year = self._reduce_to_single_digit(target_year, preserve_master=False)
        
        total = day + month + year
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_month_number(self, birth_date: date, target_year: Optional[int] = None, 
                                       target_month: Optional[int] = None) -> int:
        """Calculate Personal Month Number."""
        if target_year is None:
            target_year = datetime.now().year
        if target_month is None:
            target_month = datetime.now().month
        
        personal_year = self.calculate_personal_year_number(birth_date, target_year)
        month = self._reduce_to_single_digit(target_month, preserve_master=False)
        
        total = personal_year + month
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_day_number(self, birth_date: date, target_date: Optional[date] = None) -> int:
        """Calculate Personal Day Number."""
        if target_date is None:
            target_date = date.today()
        
        personal_month = self.calculate_personal_month_number(
            birth_date, target_date.year, target_date.month
        )
        day = self._reduce_to_single_digit(target_date.day, preserve_master=False)
        
        total = personal_month + day
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_karmic_debt_numbers(self, birth_date: date, full_name: str) -> List[int]:
        """
        Identify all Karmic Debt Numbers (13, 14, 16, 19) present in the profile.
        Checks birth day, life path, expression, soul urge, personality.
        """
        debts = set()
        
        # Check Birth Day
        if birth_date.day in self.KARMIC_DEBT_NUMBERS:
            debts.add(birth_date.day)
            
        # Check Life Path (intermediate sums)
        digits = [int(d) for d in str(birth_date.year)] + \
                 [int(d) for d in str(birth_date.month)] + \
                 [int(d) for d in str(birth_date.day)]
        lp_sum = sum(digits)
        
        def check_reduction_path(n: int) -> Optional[int]:
            if n in self.KARMIC_DEBT_NUMBERS:
                return n
            # One level deep check
            s = sum(int(d) for d in str(n))
            if s in self.KARMIC_DEBT_NUMBERS:
                return s
            return None

        if lp_sum in self.KARMIC_DEBT_NUMBERS:
            debts.add(lp_sum)
        elif check_reduction_path(lp_sum):
            debts.add(check_reduction_path(lp_sum))
            
        # Expression Check
        ex_sum = self._sum_name(full_name)
        if ex_sum in self.KARMIC_DEBT_NUMBERS:
            debts.add(ex_sum)
        elif check_reduction_path(ex_sum):
            debts.add(check_reduction_path(ex_sum))
            
        # Soul Urge Check
        su_sum = self._sum_name(full_name, vowels_only=True)
        if su_sum in self.KARMIC_DEBT_NUMBERS:
            debts.add(su_sum)
        elif check_reduction_path(su_sum):
            debts.add(check_reduction_path(su_sum))
            
        # Personality Check
        pn_sum = self._sum_name(full_name, consonants_only=True)
        if pn_sum in self.KARMIC_DEBT_NUMBERS:
            debts.add(pn_sum)
        elif check_reduction_path(pn_sum):
            debts.add(check_reduction_path(pn_sum))

        return sorted(list(debts))

    def calculate_karmic_lessons(self, full_name: str) -> List[int]:
        """
        Identify missing digits (1-9) in the name.
        """
        present_numbers = set()
        name = full_name.upper()
        for char in name:
            if char.isalpha():
                val = self._get_letter_value(char)
                if val > 0:
                    present_numbers.add(val)
        
        missing = []
        for i in range(1, 10):
            if i not in present_numbers:
                missing.append(i)
        return missing

    def calculate_hidden_passion_number(self, full_name: str) -> int:
        """
        Calculate Hidden Passion Number: The number that appears most frequently in the name.
        """
        name = full_name.upper()
        counts = collections.defaultdict(int)
        
        for char in name:
            if char.isalpha():
                val = self._get_letter_value(char)
                if val > 0:
                    counts[val] += 1
        
        if not counts:
            return 0
            
        # Find max frequency
        max_freq = max(counts.values())
        candidates = [num for num, count in counts.items() if count == max_freq]
        return max(candidates)

    def calculate_subconscious_self_number(self, full_name: str) -> int:
        """Calculate Subconscious Self Number (9 - count of karmic lessons)."""
        lessons = self.calculate_karmic_lessons(full_name)
        return 9 - len(lessons)

    def calculate_pinnacles(self, birth_date: date) -> List[int]:
        """
        Calculate the 4 Pinnacles.
        P1 = reduce(month + day)
        P2 = reduce(day + year)
        P3 = reduce(P1 + P2)
        P4 = reduce(P2 + P3)
        """
        m = self._reduce_to_single_digit(birth_date.month, False)
        d = self._reduce_to_single_digit(birth_date.day, False)
        y = self._reduce_to_single_digit(birth_date.year, False)
        
        p1 = self._reduce_to_single_digit(m + d, True)
        p2 = self._reduce_to_single_digit(d + y, True)
        p3 = self._reduce_to_single_digit(p1 + p2, True)
        p4 = self._reduce_to_single_digit(p2 + p3, True) 
        
        return [p1, p2, p3, p4]

    def calculate_challenges(self, birth_date: date) -> List[int]:
        """
        Calculate the 4 Challenges.
        C1 = abs(month - day)
        C2 = abs(day - year)
        C3 = abs(C1 - C2)
        C4 = abs(C2 - C3)
        """
        m = self._reduce_to_single_digit(birth_date.month, False)
        d = self._reduce_to_single_digit(birth_date.day, False)
        y = self._reduce_to_single_digit(birth_date.year, False)
        
        c1 = self._reduce_to_single_digit(abs(m - d), True)
        c2 = self._reduce_to_single_digit(abs(d - y), True)
        c3 = self._reduce_to_single_digit(abs(c1 - c2), True)
        c4 = self._reduce_to_single_digit(abs(c2 - c3), True)
        
        return [c1, c2, c3, c4]

    def calculate_compatibility(self, p1_profile: Dict, p2_profile: Dict) -> Dict[str, Any]:
        """
        Calculate compatibility between two profiles.
        """
        score = 0
        details = []
        
        # 1. Life Path Resonance
        lp1 = p1_profile.get('life_path_number')
        lp2 = p2_profile.get('life_path_number')
        
        if lp1 and lp2:
            if lp1 == lp2:
                score += 30
                details.append("Life Paths match (High Resonance)")
            elif (lp1 in [1, 5, 7] and lp2 in [1, 5, 7]) or \
                 (lp1 in [2, 4, 8] and lp2 in [2, 4, 8]) or \
                 (lp1 in [3, 6, 9] and lp2 in [3, 6, 9]):
                score += 15
                details.append("Life Paths in same natural group")
        
        # 2. Expression Resonance
        ex1 = p1_profile.get('destiny_number')
        ex2 = p2_profile.get('destiny_number')
        if ex1 and ex2:
            if ex1 == ex2:
                score += 20
                details.append("Expression Numbers match")
        
        # 3. Soul Urge Resonance
        su1 = p1_profile.get('soul_urge_number')
        su2 = p2_profile.get('soul_urge_number')
        if su1 and su2:
            if su1 == su2:
                score += 20
                details.append("Soul Urge Numbers match")
                
        # Cap score at 100
        score = min(100, score)
        
        return {
            "score": score,
            "details": details
        }

    def calculate_lo_shu_grid(self, full_name: str, birth_date: date) -> Dict[str, Any]:
        """
        Calculate Lo Shu Grid (Magic Square) for a person.
        
        The Lo Shu Grid is a 3x3 magic square where:
        - Each row, column, and diagonal sums to 15
        - Numbers 1-9 are placed based on numerology calculations
        - Position indicates strengths and weaknesses
        
        Returns a dictionary with grid positions and interpretations.
        """
        # Extract digits from birth date - include all individual digits
        day = birth_date.day
        month = birth_date.month
        year = birth_date.year
        
        # Get all individual digits from birth date
        date_digits = []
        for d in str(day):
            date_digits.append(int(d))
        for d in str(month):
            date_digits.append(int(d))
        for d in str(year):
            date_digits.append(int(d))
        
        # Standard Lo Shu Grid layout (Magic Square)
        # 4 9 2
        # 3 5 7
        # 8 1 6
        
        # Count frequency of each number (1-9) from birth date digits
        number_counts = {}
        for num in date_digits:
            if 1 <= num <= 9:
                number_counts[num] = number_counts.get(num, 0) + 1
        
        # Standard Lo Shu positions
        grid_positions = {
            'top_left': 4, 'top_center': 9, 'top_right': 2,
            'middle_left': 3, 'center': 5, 'middle_right': 7,
            'bottom_left': 8, 'bottom_center': 1, 'bottom_right': 6
        }
        
        # Map numbers to grid positions with their meanings
        grid_data = {}
        for position, grid_number in grid_positions.items():
            count = number_counts.get(grid_number, 0)
            grid_data[position] = {
                'number': grid_number,
                'count': count,
                'is_present': count > 0,
                'strength': 'strong' if count >= 2 else 'present' if count == 1 else 'missing',
                'meaning': self._get_lo_shu_meaning(grid_number, position)
            }
        
        # Calculate missing numbers (weak areas)
        missing_numbers = [n for n in range(1, 10) if n not in number_counts or number_counts[n] == 0]
        
        # Calculate strong numbers (appear 2+ times)
        strong_numbers = [n for n, count in number_counts.items() if count >= 2]
        
        # Calculate repeating numbers (appear 3+ times - overemphasis)
        repeating_numbers = [n for n, count in number_counts.items() if count >= 3]
        
        # Detect personality arrows
        personality_arrows = self._detect_personality_arrows(number_counts)
        
        # Get detailed missing number meanings
        missing_number_details = self._get_missing_number_details(missing_numbers)
        
        # Get detailed repeating number meanings
        repeating_number_details = self._get_repeating_number_details(number_counts)
        
        return {
            'grid': grid_data,
            'missing_numbers': missing_numbers,
            'missing_number_details': missing_number_details,
            'strong_numbers': strong_numbers,
            'repeating_numbers': repeating_numbers,
            'repeating_number_details': repeating_number_details,
            'number_frequency': number_counts,
            'personality_arrows': personality_arrows,
            'interpretation': self._get_lo_shu_interpretation(missing_numbers, strong_numbers)
        }
    
    def _detect_personality_arrows(self, number_counts: Dict[int, int]) -> List[Dict[str, Any]]:
        """
        Detect Personality Arrows in the Lo Shu Grid.
        
        Arrows are formed when all three numbers in a row, column, or diagonal
        are either present or missing.
        
        Grid layout for reference:
        4 9 2
        3 5 7
        8 1 6
        """
        arrows = []
        
        # Define all possible arrows (rows, columns, diagonals)
        arrow_definitions = {
            # Rows
            'mental_plane': {'numbers': [4, 9, 2], 'type': 'row', 'position': 'top', 
                            'present_meaning': 'Arrow of Planning - Strong mental abilities, good memory, analytical thinking',
                            'absent_meaning': 'Arrow of Confusion - May struggle with planning, needs to develop mental clarity'},
            'emotional_plane': {'numbers': [3, 5, 7], 'type': 'row', 'position': 'middle',
                               'present_meaning': 'Arrow of Emotional Balance - Emotionally stable, good intuition, spiritual awareness',
                               'absent_meaning': 'Arrow of Sensitivity - Highly sensitive, may experience emotional ups and downs'},
            'practical_plane': {'numbers': [8, 1, 6], 'type': 'row', 'position': 'bottom',
                               'present_meaning': 'Arrow of Practicality - Grounded, hardworking, good with material matters',
                               'absent_meaning': 'Arrow of Impracticality - May struggle with practical matters, needs grounding'},
            
            # Columns
            'thought_plane': {'numbers': [4, 3, 8], 'type': 'column', 'position': 'left',
                             'present_meaning': 'Arrow of Thought - Strong analytical abilities, logical thinking',
                             'absent_meaning': 'Arrow of Hesitation - May overthink or hesitate in decision-making'},
            'will_plane': {'numbers': [9, 5, 1], 'type': 'column', 'position': 'center',
                          'present_meaning': 'Arrow of Will - Strong determination, leadership abilities',
                          'absent_meaning': 'Arrow of Weak Will - May need to develop stronger willpower'},
            'action_plane': {'numbers': [2, 7, 6], 'type': 'column', 'position': 'right',
                            'present_meaning': 'Arrow of Activity - Action-oriented, gets things done',
                            'absent_meaning': 'Arrow of Passivity - May need motivation to take action'},
            
            # Diagonals
            'determination': {'numbers': [4, 5, 6], 'type': 'diagonal', 'position': 'left-to-right',
                             'present_meaning': 'Arrow of Determination - Persistent, achieves goals through dedication',
                             'absent_meaning': 'Arrow of Frustration - May experience setbacks, needs patience'},
            'spirituality': {'numbers': [2, 5, 8], 'type': 'diagonal', 'position': 'right-to-left',
                            'present_meaning': 'Arrow of Spirituality - Spiritual awareness, intuitive abilities',
                            'absent_meaning': 'Arrow of Skepticism - May be skeptical of spiritual matters'},
        }
        
        for arrow_name, arrow_def in arrow_definitions.items():
            numbers = arrow_def['numbers']
            all_present = all(number_counts.get(n, 0) > 0 for n in numbers)
            all_absent = all(number_counts.get(n, 0) == 0 for n in numbers)
            
            if all_present:
                arrows.append({
                    'name': arrow_name,
                    'numbers': numbers,
                    'type': arrow_def['type'],
                    'position': arrow_def['position'],
                    'status': 'present',
                    'meaning': arrow_def['present_meaning'],
                    'is_strength': True
                })
            elif all_absent:
                arrows.append({
                    'name': arrow_name,
                    'numbers': numbers,
                    'type': arrow_def['type'],
                    'position': arrow_def['position'],
                    'status': 'absent',
                    'meaning': arrow_def['absent_meaning'],
                    'is_strength': False
                })
        
        return arrows
    
    def _get_missing_number_details(self, missing_numbers: List[int]) -> List[Dict[str, Any]]:
        """Get detailed karmic lesson meanings for missing numbers."""
        missing_meanings = {
            1: {
                'number': 1,
                'lesson': 'Independence & Self-Confidence',
                'description': 'You may need to develop greater self-reliance and confidence. Learning to stand on your own and trust your abilities is a key life lesson.',
                'remedy': 'Practice making decisions independently. Take on leadership roles when possible.',
                'element': 'Fire'
            },
            2: {
                'number': 2,
                'lesson': 'Cooperation & Patience',
                'description': 'Developing patience and learning to work harmoniously with others is important. You may need to cultivate diplomacy and sensitivity.',
                'remedy': 'Practice active listening. Engage in collaborative activities.',
                'element': 'Water'
            },
            3: {
                'number': 3,
                'lesson': 'Self-Expression & Creativity',
                'description': 'Expressing yourself creatively and communicating effectively may be challenging. Learning to share your ideas openly is important.',
                'remedy': 'Engage in creative activities like writing, art, or music. Practice public speaking.',
                'element': 'Fire'
            },
            4: {
                'number': 4,
                'lesson': 'Organization & Discipline',
                'description': 'Building structure and maintaining discipline may require extra effort. Learning to create stable foundations is a key lesson.',
                'remedy': 'Create routines and stick to them. Practice organization in daily life.',
                'element': 'Earth'
            },
            5: {
                'number': 5,
                'lesson': 'Adaptability & Freedom',
                'description': 'Embracing change and seeking new experiences may be challenging. Learning to be flexible and adventurous is important.',
                'remedy': 'Try new activities regularly. Travel and explore different perspectives.',
                'element': 'Air'
            },
            6: {
                'number': 6,
                'lesson': 'Responsibility & Love',
                'description': 'Taking on responsibilities and nurturing others may require development. Learning to balance giving and receiving is key.',
                'remedy': 'Volunteer or help others. Practice self-care while caring for loved ones.',
                'element': 'Earth'
            },
            7: {
                'number': 7,
                'lesson': 'Introspection & Spirituality',
                'description': 'Developing inner wisdom and spiritual awareness may need attention. Learning to trust your intuition is important.',
                'remedy': 'Practice meditation or contemplation. Study philosophy or spirituality.',
                'element': 'Water'
            },
            8: {
                'number': 8,
                'lesson': 'Material Mastery & Power',
                'description': 'Managing material resources and wielding personal power may be challenging. Learning to balance spiritual and material worlds is key.',
                'remedy': 'Develop financial literacy. Practice ethical leadership.',
                'element': 'Earth'
            },
            9: {
                'number': 9,
                'lesson': 'Compassion & Universal Love',
                'description': 'Developing unconditional love and humanitarian awareness may need attention. Learning to let go and serve others is important.',
                'remedy': 'Engage in humanitarian activities. Practice forgiveness and compassion.',
                'element': 'Fire'
            }
        }
        
        return [missing_meanings[n] for n in missing_numbers if n in missing_meanings]
    
    def _get_repeating_number_details(self, number_counts: Dict[int, int]) -> List[Dict[str, Any]]:
        """Get detailed meanings for repeating numbers (overemphasis)."""
        repeating_meanings = {
            1: {
                'number': 1,
                'strength': 'Strong Leadership',
                'overemphasis': 'May become overly independent or stubborn. Risk of ego-driven decisions.',
                'balance_tip': 'Practice collaboration and consider others\' perspectives.'
            },
            2: {
                'number': 2,
                'strength': 'Exceptional Sensitivity',
                'overemphasis': 'May be overly sensitive or indecisive. Risk of dependency on others.',
                'balance_tip': 'Develop inner strength while maintaining your empathetic nature.'
            },
            3: {
                'number': 3,
                'strength': 'Powerful Creativity',
                'overemphasis': 'May scatter energy or become superficial. Risk of talking without action.',
                'balance_tip': 'Focus your creative energy on completing projects.'
            },
            4: {
                'number': 4,
                'strength': 'Exceptional Organization',
                'overemphasis': 'May become rigid or overly cautious. Risk of missing opportunities.',
                'balance_tip': 'Allow flexibility while maintaining your structured approach.'
            },
            5: {
                'number': 5,
                'strength': 'Great Adaptability',
                'overemphasis': 'May become restless or irresponsible. Risk of avoiding commitment.',
                'balance_tip': 'Channel your need for change into productive pursuits.'
            },
            6: {
                'number': 6,
                'strength': 'Deep Nurturing Ability',
                'overemphasis': 'May become overprotective or controlling. Risk of self-neglect.',
                'balance_tip': 'Balance caring for others with self-care.'
            },
            7: {
                'number': 7,
                'strength': 'Profound Wisdom',
                'overemphasis': 'May become isolated or overly critical. Risk of disconnection from reality.',
                'balance_tip': 'Balance introspection with social engagement.'
            },
            8: {
                'number': 8,
                'strength': 'Strong Material Focus',
                'overemphasis': 'May become materialistic or power-hungry. Risk of ethical compromises.',
                'balance_tip': 'Balance material pursuits with spiritual growth.'
            },
            9: {
                'number': 9,
                'strength': 'Deep Compassion',
                'overemphasis': 'May become idealistic or martyr-like. Risk of emotional burnout.',
                'balance_tip': 'Set healthy boundaries while serving others.'
            }
        }
        
        details = []
        for num, count in number_counts.items():
            if count >= 2 and num in repeating_meanings:
                detail = repeating_meanings[num].copy()
                detail['count'] = count
                detail['intensity'] = 'moderate' if count == 2 else 'strong' if count == 3 else 'very_strong'
                details.append(detail)
        
        return details
    
    def _get_lo_shu_meaning(self, number: int, position: str) -> str:
        """Get meaning of a number in a specific Lo Shu Grid position."""
        meanings = {
            (4, 'top_left'): 'Foundation and stability',
            (9, 'top_center'): 'Completion and wisdom',
            (2, 'top_right'): 'Cooperation and partnership',
            (3, 'middle_left'): 'Creativity and expression',
            (5, 'center'): 'Freedom and change (most important)',
            (7, 'middle_right'): 'Spirituality and introspection',
            (8, 'bottom_left'): 'Material success and power',
            (1, 'bottom_center'): 'Leadership and independence',
            (6, 'bottom_right'): 'Love and service',
        }
        
        position_meanings = {
            'top_left': 'Foundation and stability in life',
            'top_center': 'Wisdom and completion',
            'top_right': 'Partnership and cooperation',
            'middle_left': 'Creative expression',
            'center': 'Core energy and balance',
            'middle_right': 'Spiritual growth',
            'bottom_left': 'Material success',
            'bottom_center': 'Leadership qualities',
            'bottom_right': 'Love and service to others',
        }
        
        number_meanings = {
            1: 'Leadership, independence, new beginnings',
            2: 'Cooperation, diplomacy, partnership',
            3: 'Creativity, expression, communication',
            4: 'Stability, foundation, hard work',
            5: 'Freedom, adventure, change',
            6: 'Love, responsibility, service',
            7: 'Spirituality, analysis, introspection',
            8: 'Material success, power, achievement',
            9: 'Completion, wisdom, humanitarianism',
        }
        
        return f"{number_meanings.get(number, 'Unknown')} - {position_meanings.get(position, '')}"
    
    def _get_lo_shu_interpretation(self, missing_numbers: List[int], strong_numbers: List[int]) -> str:
        """Generate overall Lo Shu Grid interpretation."""
        if not missing_numbers and not strong_numbers:
            return "Your Lo Shu Grid shows a balanced distribution of numbers."
        
        interpretation_parts = []
        
        if missing_numbers:
            interpretation_parts.append(
                f"Missing numbers {', '.join(map(str, missing_numbers))} indicate areas that may need attention and development."
            )
        
        if strong_numbers:
            interpretation_parts.append(
                f"Strong numbers {', '.join(map(str, strong_numbers))} appear multiple times, indicating your core strengths and talents."
            )
        
        return " ".join(interpretation_parts)
    
    def detect_raj_yog(self, life_path: int, destiny: int, soul_urge: Optional[int] = None, 
                       personality: Optional[int] = None) -> Dict[str, Any]:
        """
        Detect Raj Yog combinations in numerology profile.
        
        Raj Yog indicates auspicious combinations that bring success, leadership, 
        prosperity, and spiritual growth.
        
        Major Raj Yog combinations:
        - Leadership Raj Yog: Life Path 1 + Destiny 8
        - Spiritual Raj Yog: Life Path 7 + Destiny 9
        - Material Raj Yog: Life Path 8 + Destiny 1
        - Creative Raj Yog: Life Path 3 + Destiny 6
        - Service Raj Yog: Life Path 6 + Destiny 3
        - Harmony Raj Yog: Life Path 2 + Destiny 7
        - Freedom Raj Yog: Life Path 5 + Destiny 5
        - Builder Raj Yog: Life Path 4 + Destiny 4
        - Humanitarian Raj Yog: Life Path 9 + Destiny 9
        - Master Number Raj Yog: Any combination with 11, 22, or 33
        
        Args:
            life_path: Life Path Number
            destiny: Destiny Number (Expression Number)
            soul_urge: Soul Urge Number (optional)
            personality: Personality Number (optional)
        
        Returns:
            Dictionary with detection results including:
            - is_detected: Boolean
            - yog_type: Type of Raj Yog
            - yog_name: Name of the Raj Yog
            - strength_score: Score from 0-100
            - detected_combinations: List of detected combinations
            - contributing_numbers: Dict of contributing numbers
        """
        # Normalize master numbers for comparison (keep original for display)
        lp_normalized = self._reduce_to_single_digit(life_path, preserve_master=False)
        dest_normalized = self._reduce_to_single_digit(destiny, preserve_master=False)
        
        detected_combinations = []
        contributing_numbers = {
            'life_path': life_path,
            'destiny': destiny,
        }
        
        if soul_urge is not None:
            contributing_numbers['soul_urge'] = soul_urge
        if personality is not None:
            contributing_numbers['personality'] = personality
        
        strength_score = 0
        yog_type = None
        yog_name = None
        
        # Check for Master Number Raj Yog (highest priority)
        if life_path in self.MASTER_NUMBERS or destiny in self.MASTER_NUMBERS:
            detected_combinations.append({
                'type': 'master',
                'name': 'Master Number Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Powerful combination with master numbers indicating spiritual mastery and high potential'
            })
            strength_score = 90
            yog_type = 'master'
            yog_name = 'Master Number Raj Yog'
        
        # Leadership Raj Yog: Life Path 1 + Destiny 8
        if lp_normalized == 1 and dest_normalized == 8:
            detected_combinations.append({
                'type': 'leadership',
                'name': 'Leadership Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Natural leadership abilities with material success and authority'
            })
            if strength_score < 85:
                strength_score = 85
                yog_type = 'leadership'
                yog_name = 'Leadership Raj Yog'
        
        # Material Raj Yog: Life Path 8 + Destiny 1 (reverse of Leadership)
        if lp_normalized == 8 and dest_normalized == 1:
            detected_combinations.append({
                'type': 'material',
                'name': 'Material Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Material abundance and success with leadership qualities'
            })
            if strength_score < 80:
                strength_score = 80
                yog_type = 'material'
                yog_name = 'Material Raj Yog'
        
        # Spiritual Raj Yog: Life Path 7 + Destiny 9
        if lp_normalized == 7 and dest_normalized == 9:
            detected_combinations.append({
                'type': 'spiritual',
                'name': 'Spiritual Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Deep spiritual wisdom combined with humanitarian service'
            })
            if strength_score < 85:
                strength_score = 85
                yog_type = 'spiritual'
                yog_name = 'Spiritual Raj Yog'
        
        # Creative Raj Yog: Life Path 3 + Destiny 6
        if lp_normalized == 3 and dest_normalized == 6:
            detected_combinations.append({
                'type': 'creative',
                'name': 'Creative Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Creative expression combined with nurturing and service'
            })
            if strength_score < 75:
                strength_score = 75
                yog_type = 'creative'
                yog_name = 'Creative Raj Yog'
        
        # Service Raj Yog: Life Path 6 + Destiny 3 (reverse of Creative)
        if lp_normalized == 6 and dest_normalized == 3:
            detected_combinations.append({
                'type': 'service',
                'name': 'Service Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Service and nurturing combined with creative expression'
            })
            if strength_score < 75:
                strength_score = 75
                yog_type = 'service'
                yog_name = 'Service Raj Yog'
        
        # Harmony Raj Yog: Life Path 2 + Destiny 7
        if lp_normalized == 2 and dest_normalized == 7:
            detected_combinations.append({
                'type': 'other',
                'name': 'Harmony Raj Yog',
                'numbers': {'life_path': life_path, 'destiny': destiny},
                'description': 'Diplomatic harmony combined with spiritual wisdom'
            })
            if strength_score < 70:
                strength_score = 70
                yog_type = 'other'
                yog_name = 'Harmony Raj Yog'
        
        # Additional combinations that sum to 9 (completion)
        if lp_normalized + dest_normalized == 9 or (lp_normalized + dest_normalized) % 9 == 0:
            if not detected_combinations:  # Only if no other Raj Yog detected
                detected_combinations.append({
                    'type': 'other',
                    'name': 'Completion Raj Yog',
                    'numbers': {'life_path': life_path, 'destiny': destiny},
                    'description': 'Numbers that sum to 9 indicate completion and fulfillment'
                })
                if strength_score < 65:
                    strength_score = 65
                    yog_type = 'other'
                    yog_name = 'Completion Raj Yog'
        
        # Check for complementary numbers (1-8, 2-7, 3-6, 4-5)
        complementary_pairs = [
            (1, 8), (8, 1),
            (2, 7), (7, 2),
            (3, 6), (6, 3),
            (4, 5), (5, 4),
        ]
        
        if (lp_normalized, dest_normalized) in complementary_pairs:
            if not detected_combinations:  # Only if no other Raj Yog detected
                pair_name = f"Complementary Raj Yog ({lp_normalized}-{dest_normalized})"
                detected_combinations.append({
                    'type': 'other',
                    'name': pair_name,
                    'numbers': {'life_path': life_path, 'destiny': destiny},
                    'description': f'Complementary numbers {lp_normalized} and {dest_normalized} create balance and harmony'
                })
                if strength_score < 60:
                    strength_score = 60
                    yog_type = 'other'
                    yog_name = pair_name
        
        # Boost strength if soul_urge or personality also align
        if soul_urge is not None:
            su_normalized = self._reduce_to_single_digit(soul_urge, preserve_master=False)
            if su_normalized == lp_normalized or su_normalized == dest_normalized:
                strength_score = min(100, strength_score + 5)
        
        if personality is not None:
            pn_normalized = self._reduce_to_single_digit(personality, preserve_master=False)
            if pn_normalized == lp_normalized or pn_normalized == dest_normalized:
                strength_score = min(100, strength_score + 5)
        
        is_detected = len(detected_combinations) > 0
        
        return {
            'is_detected': is_detected,
            'yog_type': yog_type,
            'yog_name': yog_name,
            'strength_score': strength_score,
            'detected_combinations': detected_combinations,
            'contributing_numbers': contributing_numbers,
        }
    
    def calculate_all(self, full_name: str, birth_date: date) -> Dict[str, Any]:
        """
        Calculate all numerology numbers at once.
        """
        life_path = self.calculate_life_path_number(birth_date)
        destiny = self.calculate_destiny_number(full_name)
        
        result = {
            'life_path_number': life_path,
            'destiny_number': destiny,
            'soul_urge_number': self.calculate_soul_urge_number(full_name),
            'personality_number': self.calculate_personality_number(full_name),
            'attitude_number': self.calculate_attitude_number(birth_date),
            'birthday_number': self.calculate_birthday_number(birth_date),
            'maturity_number': self.calculate_maturity_number(life_path, destiny),
            'balance_number': self.calculate_balance_number(full_name),
            'personal_year_number': self.calculate_personal_year_number(birth_date),
            'personal_month_number': self.calculate_personal_month_number(birth_date),
            'personal_day_number': self.calculate_personal_day_number(birth_date),
            'hidden_passion_number': self.calculate_hidden_passion_number(full_name),
            'subconscious_self_number': self.calculate_subconscious_self_number(full_name),
            'karmic_debt_numbers': self.calculate_karmic_debt_numbers(birth_date, full_name),
            'karmic_lessons': self.calculate_karmic_lessons(full_name),
            'pinnacles': self.calculate_pinnacles(birth_date),
            'challenges': self.calculate_challenges(birth_date),
            # Chaldean-specific numbers
            'driver_number': self.calculate_driver_number(birth_date),
            'conductor_number': self.calculate_conductor_number(birth_date),
            'driver_conductor_compatibility': self.calculate_driver_conductor_compatibility(birth_date),
        }
        
        return result


def validate_name(name: str) -> bool:
    """Validate that name contains at least one letter."""
    return bool(re.search(r'[a-zA-Z]', name))


def validate_birth_date(birth_date: date) -> bool:
    """Validate that birth date is reasonable."""
    today = date.today()
    min_date = date(1900, 1, 1)
    return min_date <= birth_date <= today
