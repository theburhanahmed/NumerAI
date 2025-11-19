"""
Numerology calculation engine for NumerAI.
Supports both Pythagorean and Chaldean systems.
"""
from datetime import datetime, date
from typing import Dict, Optional, Tuple
import re


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
    
    VOWELS = set('AEIOU')
    MASTER_NUMBERS = {11, 22, 33}
    
    def __init__(self, system: str = 'pythagorean'):
        """
        Initialize calculator with specified system.
        
        Args:
            system: 'pythagorean' or 'chaldean'
        """
        if system.lower() not in ['pythagorean', 'chaldean']:
            raise ValueError("System must be 'pythagorean' or 'chaldean'")
        
        self.system = system.lower()
        self.letter_values = self.PYTHAGOREAN if self.system == 'pythagorean' else self.CHALDEAN
    
    def _reduce_to_single_digit(self, number: int, preserve_master: bool = True) -> int:
        """
        Reduce a number to single digit, optionally preserving master numbers.
        
        Args:
            number: Number to reduce
            preserve_master: Whether to preserve master numbers (11, 22, 33)
        
        Returns:
            Reduced number
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
        """
        Sum the numeric values of letters in a name.
        
        Args:
            name: Name to sum
            vowels_only: Only sum vowels
            consonants_only: Only sum consonants
        
        Returns:
            Sum of letter values
        """
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
        Most important number in numerology.
        
        Args:
            birth_date: Date of birth
        
        Returns:
            Life Path Number (1-9, 11, 22, 33)
        
        Example:
            Birth date: 1990-05-15
            1+9+9+0 = 19 -> 1+9 = 10 -> 1+0 = 1
            0+5 = 5
            1+5 = 6
            1 + 5 + 6 = 12 -> 1+2 = 3
        """
        # Reduce each component separately
        year = self._reduce_to_single_digit(birth_date.year, preserve_master=True)
        month = self._reduce_to_single_digit(birth_date.month, preserve_master=True)
        day = self._reduce_to_single_digit(birth_date.day, preserve_master=True)
        
        # Sum and reduce
        total = year + month + day
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_destiny_number(self, full_name: str) -> int:
        """
        Calculate Destiny Number (Expression Number) from full name.
        Reveals life purpose and natural talents.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Destiny Number (1-9, 11, 22, 33)
        """
        total = self._sum_name(full_name)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_soul_urge_number(self, full_name: str) -> int:
        """
        Calculate Soul Urge Number (Heart's Desire) from vowels in name.
        Reveals inner motivations and desires.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Soul Urge Number (1-9, 11, 22, 33)
        """
        total = self._sum_name(full_name, vowels_only=True)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_personality_number(self, full_name: str) -> int:
        """
        Calculate Personality Number from consonants in name.
        Reveals how others perceive you.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Personality Number (1-9, 11, 22, 33)
        """
        total = self._sum_name(full_name, consonants_only=True)
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_attitude_number(self, birth_date: date) -> int:
        """
        Calculate Attitude Number from birth day and month.
        Reveals general outlook and approach to life.
        
        Args:
            birth_date: Date of birth
        
        Returns:
            Attitude Number (1-9, 11, 22, 33)
        """
        total = birth_date.day + birth_date.month
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_maturity_number(self, life_path: int, destiny: int) -> int:
        """
        Calculate Maturity Number from Life Path + Destiny.
        Reveals potential reached in later life.
        
        Args:
            life_path: Life Path Number
            destiny: Destiny Number
        
        Returns:
            Maturity Number (1-9, 11, 22, 33)
        """
        total = life_path + destiny
        return self._reduce_to_single_digit(total, preserve_master=True)
    
    def calculate_balance_number(self, full_name: str) -> int:
        """
        Calculate Balance Number from initials.
        Reveals how you handle challenges.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Balance Number (1-9)
        """
        # Extract initials
        words = full_name.strip().split()
        initials = ''.join(word[0] for word in words if word)
        
        total = self._sum_name(initials)
        # Balance number doesn't preserve master numbers
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_year_number(self, birth_date: date, target_year: Optional[int] = None) -> int:
        """
        Calculate Personal Year Number for a specific year.
        Reveals the theme and energy of that year.
        
        Args:
            birth_date: Date of birth
            target_year: Year to calculate for (defaults to current year)
        
        Returns:
            Personal Year Number (1-9)
        """
        if target_year is None:
            target_year = datetime.now().year
        
        # Birth day + birth month + target year
        day = self._reduce_to_single_digit(birth_date.day, preserve_master=False)
        month = self._reduce_to_single_digit(birth_date.month, preserve_master=False)
        year = self._reduce_to_single_digit(target_year, preserve_master=False)
        
        total = day + month + year
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_month_number(self, birth_date: date, target_year: Optional[int] = None, 
                                       target_month: Optional[int] = None) -> int:
        """
        Calculate Personal Month Number for a specific month.
        Reveals the theme and energy of that month.
        
        Args:
            birth_date: Date of birth
            target_year: Year to calculate for (defaults to current year)
            target_month: Month to calculate for (defaults to current month)
        
        Returns:
            Personal Month Number (1-9)
        """
        if target_year is None:
            target_year = datetime.now().year
        if target_month is None:
            target_month = datetime.now().month
        
        personal_year = self.calculate_personal_year_number(birth_date, target_year)
        month = self._reduce_to_single_digit(target_month, preserve_master=False)
        
        total = personal_year + month
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_personal_day_number(self, birth_date: date, target_date: Optional[date] = None) -> int:
        """
        Calculate Personal Day Number for a specific date.
        Reveals the energy of that specific day.
        
        Args:
            birth_date: Date of birth
            target_date: Date to calculate for (defaults to today)
        
        Returns:
            Personal Day Number (1-9)
        """
        if target_date is None:
            target_date = date.today()
        
        personal_month = self.calculate_personal_month_number(
            birth_date, 
            target_date.year, 
            target_date.month
        )
        day = self._reduce_to_single_digit(target_date.day, preserve_master=False)
        
        total = personal_month + day
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_karmic_debt_number(self, birth_date: date) -> Optional[int]:
        """
        Calculate Karmic Debt Number from birth date.
        Reveals karmic lessons and challenges to overcome.
        
        Args:
            birth_date: Date of birth
        
        Returns:
            Karmic Debt Number (13, 14, 16, 19) or None if no karmic debt
        """
        # Karmic debt numbers are derived from specific day/month combinations
        day = birth_date.day
        month = birth_date.month
        year = birth_date.year
        
        # Check for karmic debt numbers in day, month, or year
        karmic_numbers = {13, 14, 16, 19}
        
        if day in karmic_numbers:
            return day
            
        if month in karmic_numbers:
            return month
            
        if year in karmic_numbers:
            return year
            
        # Check if any combination reduces to karmic debt number
        day_reduced = self._reduce_to_single_digit(day, preserve_master=False)
        month_reduced = self._reduce_to_single_digit(month, preserve_master=False)
        year_reduced = self._reduce_to_single_digit(year, preserve_master=False)
        
        total = day_reduced + month_reduced + year_reduced
        if total in karmic_numbers:
            return total
            
        total_reduced = self._reduce_to_single_digit(total, preserve_master=False)
        
        if total_reduced in karmic_numbers:
            return total_reduced
            
        return None
    
    def calculate_hidden_passion_number(self, full_name: str) -> int:
        """
        Calculate Hidden Passion Number from letters in name.
        Reveals hidden talents and passions.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Hidden Passion Number (1-9)
        """
        # Count frequency of each letter in name
        name = full_name.upper().replace(" ", "")
        letter_count = {}
        
        for char in name:
            if char.isalpha():
                letter_count[char] = letter_count.get(char, 0) + 1
        
        # Find letters that appear most frequently (3 or more times)
        frequent_letters = [char for char, count in letter_count.items() if count >= 3]
        
        if not frequent_letters:
            # If no letters appear 3+ times, use the most frequent letter
            if letter_count:
                max_count = max(letter_count.values())
                frequent_letters = [char for char, count in letter_count.items() if count == max_count]
            else:
                # Fallback if no valid letters
                return 1
        
        # Sum values of frequent letters
        total = sum(self._get_letter_value(char) for char in frequent_letters)
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_subconscious_self_number(self, full_name: str) -> int:
        """
        Calculate Subconscious Self Number from vowels and consonants.
        Reveals subconscious motivations and inner self.
        
        Args:
            full_name: Full birth name
        
        Returns:
            Subconscious Self Number (1-9)
        """
        # Count vowels and consonants
        vowels_count = 0
        consonants_count = 0
        name = full_name.upper()
        
        for char in name:
            if char.isalpha():
                if char in self.VOWELS:
                    vowels_count += 1
                else:
                    consonants_count += 1
        
        # Sum and reduce
        total = vowels_count + consonants_count
        return self._reduce_to_single_digit(total, preserve_master=False)
    
    def calculate_all(self, full_name: str, birth_date: date) -> Dict[str, int]:
        """
        Calculate all numerology numbers at once.
        
        Args:
            full_name: Full birth name
            birth_date: Date of birth
        
        Returns:
            Dictionary with all calculated numbers
        """
        life_path = self.calculate_life_path_number(birth_date)
        destiny = self.calculate_destiny_number(full_name)
        
        # Calculate karmic debt number
        karmic_debt = self.calculate_karmic_debt_number(birth_date)
        
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
            'hidden_passion_number': self.calculate_hidden_passion_number(full_name),
            'subconscious_self_number': self.calculate_subconscious_self_number(full_name)
        }
        
        # Add karmic debt if present
        if karmic_debt is not None:
            result['karmic_debt_number'] = karmic_debt
            
        return result


def validate_name(name: str) -> bool:
    """
    Validate that name contains at least one letter.
    
    Args:
        name: Name to validate
    
    Returns:
        True if valid, False otherwise
    """
    return bool(re.search(r'[a-zA-Z]', name))


def validate_birth_date(birth_date: date) -> bool:
    """
    Validate that birth date is reasonable.
    
    Args:
        birth_date: Date to validate
    
    Returns:
        True if valid, False otherwise
    """
    today = date.today()
    min_date = date(1900, 1, 1)
    
    return min_date <= birth_date <= today
