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
            'challenges': self.calculate_challenges(birth_date)
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
