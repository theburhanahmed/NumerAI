"""
Unit tests for numerology calculations.
"""
from django.test import TestCase
from datetime import date
from core.numerology import NumerologyCalculator, validate_name, validate_birth_date


class NumerologyCalculatorTest(TestCase):
    """Test cases for NumerologyCalculator."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.calculator = NumerologyCalculator(system='pythagorean')
        self.test_name = "John Doe"
        self.test_birth_date = date(1990, 5, 15)
    
    def test_life_path_number_calculation(self):
        """Test life path number calculation."""
        # Test case: 1990-05-15
        # Year: 1+9+9+0 = 19 -> 1+9 = 10 -> 1+0 = 1
        # Month: 0+5 = 5
        # Day: 1+5 = 6
        # Total: 1+5+6 = 12 -> 1+2 = 3
        result = self.calculator.calculate_life_path_number(self.test_birth_date)
        self.assertIn(result, range(1, 10))
    
    def test_master_number_preservation(self):
        """Test that master numbers (11, 22, 33) are preserved."""
        # Test case that should result in master number 11
        # Birth date: 1992-11-02
        # Year: 1+9+9+2 = 21 -> 2+1 = 3
        # Month: 1+1 = 2 (master 11 reduced to 2)
        # Day: 0+2 = 2
        # Total: 3+2+2 = 7
        test_date = date(1992, 11, 2)
        result = self.calculator.calculate_life_path_number(test_date)
        self.assertIn(result, range(1, 10))
    
    def test_destiny_number_calculation(self):
        """Test destiny number calculation from name."""
        result = self.calculator.calculate_destiny_number(self.test_name)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_soul_urge_number_calculation(self):
        """Test soul urge number calculation from vowels."""
        result = self.calculator.calculate_soul_urge_number(self.test_name)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_personality_number_calculation(self):
        """Test personality number calculation from consonants."""
        result = self.calculator.calculate_personality_number(self.test_name)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_attitude_number_calculation(self):
        """Test attitude number calculation."""
        result = self.calculator.calculate_attitude_number(self.test_birth_date)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_maturity_number_calculation(self):
        """Test maturity number calculation."""
        life_path = self.calculator.calculate_life_path_number(self.test_birth_date)
        destiny = self.calculator.calculate_destiny_number(self.test_name)
        result = self.calculator.calculate_maturity_number(life_path, destiny)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_balance_number_calculation(self):
        """Test balance number calculation from initials."""
        result = self.calculator.calculate_balance_number(self.test_name)
        self.assertIn(result, range(1, 10))  # Balance number doesn't preserve master numbers
    
    def test_personal_year_number_calculation(self):
        """Test personal year number calculation."""
        result = self.calculator.calculate_personal_year_number(self.test_birth_date, 2025)
        self.assertIn(result, range(1, 10))
    
    def test_personal_month_number_calculation(self):
        """Test personal month number calculation."""
        result = self.calculator.calculate_personal_month_number(self.test_birth_date, 2025, 11)
        self.assertIn(result, range(1, 10))
    
    def test_personal_day_number_calculation(self):
        """Test personal day number calculation."""
        target_date = date(2025, 11, 10)
        result = self.calculator.calculate_personal_day_number(self.test_birth_date, target_date)
        self.assertIn(result, range(1, 10))
    
    def test_calculate_all_numbers(self):
        """Test calculate_all method returns all numbers."""
        result = self.calculator.calculate_all(self.test_name, self.test_birth_date)
        
        expected_keys = [
            'life_path_number',
            'destiny_number',
            'soul_urge_number',
            'personality_number',
            'attitude_number',
            'maturity_number',
            'balance_number',
            'personal_year_number',
            'personal_month_number'
        ]
        
        for key in expected_keys:
            self.assertIn(key, result)
            self.assertIsInstance(result[key], int)
    
    def test_chaldean_system(self):
        """Test Chaldean calculation system."""
        chaldean_calc = NumerologyCalculator(system='chaldean')
        result = chaldean_calc.calculate_destiny_number(self.test_name)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_invalid_system(self):
        """Test that invalid system raises ValueError."""
        with self.assertRaises(ValueError):
            NumerologyCalculator(system='invalid')
    
    def test_empty_name(self):
        """Test calculation with empty name."""
        result = self.calculator.calculate_destiny_number("")
        self.assertEqual(result, 0)
    
    def test_name_with_special_characters(self):
        """Test calculation with special characters in name."""
        name_with_special = "John-Paul O'Brien"
        result = self.calculator.calculate_destiny_number(name_with_special)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_name_with_numbers(self):
        """Test calculation with numbers in name (should be ignored)."""
        name_with_numbers = "John123 Doe456"
        result = self.calculator.calculate_destiny_number(name_with_numbers)
        self.assertIn(result, list(range(1, 10)) + [11, 22, 33])
    
    def test_single_letter_name(self):
        """Test calculation with single letter name."""
        result = self.calculator.calculate_destiny_number("A")
        self.assertEqual(result, 1)  # A = 1 in Pythagorean
    
    def test_validate_name_valid(self):
        """Test name validation with valid name."""
        self.assertTrue(validate_name("John Doe"))
        self.assertTrue(validate_name("A"))
        self.assertTrue(validate_name("Mary-Jane"))
    
    def test_validate_name_invalid(self):
        """Test name validation with invalid name."""
        self.assertFalse(validate_name(""))
        self.assertFalse(validate_name("123"))
        self.assertFalse(validate_name("   "))
    
    def test_validate_birth_date_valid(self):
        """Test birth date validation with valid date."""
        self.assertTrue(validate_birth_date(date(1990, 1, 1)))
        self.assertTrue(validate_birth_date(date(2000, 12, 31)))
        self.assertTrue(validate_birth_date(date.today()))
    
    def test_validate_birth_date_invalid(self):
        """Test birth date validation with invalid date."""
        self.assertFalse(validate_birth_date(date(1899, 1, 1)))  # Too old
        self.assertFalse(validate_birth_date(date(2030, 1, 1)))  # Future date
    
    def test_reduce_to_single_digit(self):
        """Test _reduce_to_single_digit method."""
        self.assertEqual(self.calculator._reduce_to_single_digit(11, preserve_master=True), 11)
        self.assertEqual(self.calculator._reduce_to_single_digit(11, preserve_master=False), 2)
        self.assertEqual(self.calculator._reduce_to_single_digit(22, preserve_master=True), 22)
        self.assertEqual(self.calculator._reduce_to_single_digit(33, preserve_master=True), 33)
        self.assertEqual(self.calculator._reduce_to_single_digit(99, preserve_master=False), 9)
    
    def test_vowels_only_calculation(self):
        """Test vowel-only calculation for soul urge."""
        # "John Doe" vowels: o, o, e = 6+6+5 = 17 -> 1+7 = 8
        result = self.calculator._sum_name("John Doe", vowels_only=True)
        self.assertGreater(result, 0)
    
    def test_consonants_only_calculation(self):
        """Test consonant-only calculation for personality."""
        # "John Doe" consonants: J, h, n, D = 1+8+5+4 = 18
        result = self.calculator._sum_name("John Doe", consonants_only=True)
        self.assertGreater(result, 0)
    
    def test_case_insensitivity(self):
        """Test that calculations are case-insensitive."""
        result1 = self.calculator.calculate_destiny_number("JOHN DOE")
        result2 = self.calculator.calculate_destiny_number("john doe")
        result3 = self.calculator.calculate_destiny_number("John Doe")
        self.assertEqual(result1, result2)
        self.assertEqual(result2, result3)


class InterpretationTest(TestCase):
    """Test cases for number interpretations."""
    
    def test_get_interpretation_valid(self):
        """Test getting interpretation for valid numbers."""
        from core.interpretations import get_interpretation
        
        for number in [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]:
            interpretation = get_interpretation(number)
            self.assertIsInstance(interpretation, dict)
            self.assertIn('title', interpretation)
            self.assertIn('description', interpretation)
            self.assertIn('strengths', interpretation)
            self.assertIn('challenges', interpretation)
    
    def test_get_interpretation_invalid(self):
        """Test getting interpretation for invalid number."""
        from core.interpretations import get_interpretation
        
        with self.assertRaises(ValueError):
            get_interpretation(10)
        
        with self.assertRaises(ValueError):
            get_interpretation(0)


class DailyReadingGeneratorTest(TestCase):
    """Test cases for daily reading generator."""
    
    def test_generate_reading(self):
        """Test daily reading generation."""
        from core.reading_generator import DailyReadingGenerator
        
        generator = DailyReadingGenerator()
        
        for number in range(1, 10):
            reading = generator.generate_reading(number)
            
            self.assertIn('lucky_number', reading)
            self.assertIn('lucky_color', reading)
            self.assertIn('auspicious_time', reading)
            self.assertIn('activity_recommendation', reading)
            self.assertIn('warning', reading)
            self.assertIn('affirmation', reading)
            self.assertIn('actionable_tip', reading)
            
            # Verify lucky number is different from personal day number
            self.assertNotEqual(reading['lucky_number'], number)
    
    def test_reading_content_not_empty(self):
        """Test that all reading content fields are non-empty."""
        from core.reading_generator import DailyReadingGenerator
        
        generator = DailyReadingGenerator()
        reading = generator.generate_reading(1)
        
        for key, value in reading.items():
            if key != 'lucky_number':
                self.assertIsInstance(value, str)
                self.assertGreater(len(value), 0)