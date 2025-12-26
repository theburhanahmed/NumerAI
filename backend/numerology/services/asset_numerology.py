"""
Asset numerology service for vehicles, properties, businesses, and phones.
"""
from typing import Dict, List, Any, Optional
from datetime import date
from numerology.numerology import NumerologyCalculator


class AssetNumerologyService:
    """Service for calculating asset numerology."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
    
    def calculate_vehicle_numerology(
        self,
        license_plate: str,
        owner_birth_date: Optional[date] = None,
        owner_life_path: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate numerology for a vehicle license plate.
        
        Args:
            license_plate: Vehicle license plate number
            owner_birth_date: Owner's birth date
            owner_life_path: Owner's life path number (if known)
            
        Returns:
            Vehicle numerology analysis
        """
        # Extract numbers from license plate
        plate_numbers = ''.join([c for c in license_plate.upper() if c.isdigit()])
        if not plate_numbers:
            # Convert letters to numbers if no digits
            plate_numbers = ''.join([str(self.calculator._get_letter_value(c)) for c in license_plate.upper() if c.isalpha()])
        
        if not plate_numbers:
            return {'error': 'Invalid license plate format'}
        
        # Calculate vibration number
        vibration = self._calculate_vibration(plate_numbers)
        
        # Calculate safety score
        safety_score = self._calculate_vehicle_safety(vibration, plate_numbers)
        
        # Calculate compatibility with owner
        compatibility = None
        if owner_life_path or owner_birth_date:
            if not owner_life_path and owner_birth_date:
                owner_life_path = self.calculator.calculate_life_path_number(owner_birth_date)
            compatibility = self._calculate_owner_compatibility(vibration, owner_life_path)
        
        # Generate interpretation
        interpretation = self._interpret_vehicle_number(vibration)
        
        return {
            'license_plate': license_plate,
            'plate_numbers': plate_numbers,
            'vibration_number': vibration,
            'safety_score': safety_score,
            'compatibility_with_owner': compatibility,
            'interpretation': interpretation,
            'recommendations': self._generate_vehicle_recommendations(vibration, safety_score, compatibility)
        }
    
    def calculate_property_numerology(
        self,
        house_number: str,
        floor_number: Optional[int] = None,
        owner_birth_date: Optional[date] = None,
        owner_life_path: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate numerology for a property.
        
        Args:
            house_number: House/unit number
            floor_number: Floor number (optional)
            owner_birth_date: Owner's birth date
            owner_life_path: Owner's life path number
            
        Returns:
            Property numerology analysis
        """
        # Extract numbers
        house_num = ''.join([c for c in str(house_number) if c.isdigit()])
        if not house_num:
            return {'error': 'Invalid house number'}
        
        # Calculate house vibration
        house_vibration = self._calculate_vibration(house_num)
        
        # Calculate floor vibration if provided
        floor_vibration = None
        if floor_number:
            floor_vibration = self._calculate_vibration(str(floor_number))
        
        # Calculate compatibility
        compatibility = None
        if owner_life_path or owner_birth_date:
            if not owner_life_path and owner_birth_date:
                owner_life_path = self.calculator.calculate_life_path_number(owner_birth_date)
            compatibility = self._calculate_owner_compatibility(house_vibration, owner_life_path)
        
        # Generate interpretation
        interpretation = self._interpret_property_number(house_vibration, floor_vibration)
        
        return {
            'house_number': house_number,
            'house_vibration': house_vibration,
            'floor_number': floor_number,
            'floor_vibration': floor_vibration,
            'compatibility_with_owner': compatibility,
            'interpretation': interpretation,
            'remedy_suggestions': self._generate_property_remedies(house_vibration, compatibility)
        }
    
    def calculate_business_numerology(
        self,
        business_name: str,
        registration_number: Optional[str] = None,
        launch_date: Optional[date] = None,
        owner_birth_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calculate numerology for a business.
        
        Args:
            business_name: Business name
            registration_number: Business registration number
            launch_date: Business launch date
            owner_birth_date: Owner's birth date
            
        Returns:
            Business numerology analysis
        """
        # Calculate name vibration
        name_vibration = self.calculator._sum_name(business_name)
        name_vibration = self.calculator._reduce_to_single_digit(name_vibration, preserve_master=True)
        
        # Calculate registration vibration if provided
        reg_vibration = None
        if registration_number:
            reg_numbers = ''.join([c for c in registration_number if c.isdigit()])
            if reg_numbers:
                reg_vibration = self._calculate_vibration(reg_numbers)
        
        # Calculate launch date alignment
        launch_alignment = None
        if launch_date and owner_birth_date:
            owner_lp = self.calculator.calculate_life_path_number(owner_birth_date)
            launch_py = self.calculator.calculate_personal_year_number(owner_birth_date, launch_date.year)
            launch_alignment = self._calculate_date_alignment(owner_lp, launch_py, name_vibration)
        
        # Generate interpretation
        interpretation = self._interpret_business_number(name_vibration)
        
        return {
            'business_name': business_name,
            'name_vibration': name_vibration,
            'registration_number': registration_number,
            'registration_vibration': reg_vibration,
            'launch_date': launch_date.isoformat() if launch_date else None,
            'launch_alignment': launch_alignment,
            'interpretation': interpretation,
            'yearly_cycle_analysis': self._calculate_business_cycles(launch_date) if launch_date else None,
            'recommendations': self._generate_business_recommendations(name_vibration, launch_alignment)
        }
    
    def calculate_phone_numerology(
        self,
        phone_number: str,
        owner_birth_date: Optional[date] = None,
        owner_life_path: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate numerology for a phone number.
        
        Args:
            phone_number: Phone number
            owner_birth_date: Owner's birth date
            owner_life_path: Owner's life path number
            
        Returns:
            Phone numerology analysis
        """
        # Extract digits
        phone_digits = ''.join([c for c in phone_number if c.isdigit()])
        if not phone_digits or len(phone_digits) < 7:
            return {'error': 'Invalid phone number format'}
        
        # Calculate vibration
        vibration = self._calculate_vibration(phone_digits)
        
        # Calculate compatibility
        compatibility = None
        if owner_life_path or owner_birth_date:
            if not owner_life_path and owner_birth_date:
                owner_life_path = self.calculator.calculate_life_path_number(owner_birth_date)
            compatibility = self._calculate_owner_compatibility(vibration, owner_life_path)
        
        # Calculate financial influence
        financial_influence = self._calculate_financial_influence(vibration)
        
        # Calculate stress influence
        stress_influence = self._calculate_stress_influence(vibration, phone_digits)
        
        return {
            'phone_number': phone_number,
            'vibration_number': vibration,
            'compatibility_with_owner': compatibility,
            'financial_influence': financial_influence,
            'stress_influence': stress_influence,
            'interpretation': self._interpret_phone_number(vibration),
            'recommendations': self._generate_phone_recommendations(vibration, compatibility, stress_influence)
        }
    
    def _calculate_vibration(self, number_string: str) -> int:
        """Calculate vibration number from string of digits."""
        total = sum(int(d) for d in number_string)
        return self.calculator._reduce_to_single_digit(total, preserve_master=True)
    
    def _calculate_vehicle_safety(self, vibration: int, plate_numbers: str) -> int:
        """Calculate safety score for vehicle (0-100)."""
        # Base score from vibration
        safety_scores = {
            1: 75, 2: 85, 3: 70, 4: 90, 5: 65,
            6: 80, 7: 75, 8: 85, 9: 70,
            11: 80, 22: 90, 33: 85
        }
        base_score = safety_scores.get(vibration, 70)
        
        # Adjust based on number patterns
        if '4' in plate_numbers:
            base_score += 5  # 4 is stable
        if '8' in plate_numbers:
            base_score += 3  # 8 is material success
        
        # Check for dangerous patterns
        if '5' in plate_numbers and plate_numbers.count('5') >= 2:
            base_score -= 10  # Too much change/instability
        
        return max(0, min(100, base_score))
    
    def _calculate_owner_compatibility(self, asset_vibration: int, owner_life_path: int) -> Dict[str, Any]:
        """Calculate compatibility between asset and owner."""
        # Calculate compatibility score
        diff = abs(asset_vibration - owner_life_path)
        
        if diff == 0:
            score = 100
            level = 'perfect'
        elif diff <= 2:
            score = 85
            level = 'excellent'
        elif diff <= 4:
            score = 70
            level = 'good'
        elif diff <= 6:
            score = 55
            level = 'moderate'
        else:
            score = 40
            level = 'challenging'
        
        return {
            'score': score,
            'level': level,
            'asset_vibration': asset_vibration,
            'owner_life_path': owner_life_path,
            'difference': diff
        }
    
    def _calculate_financial_influence(self, vibration: int) -> Dict[str, Any]:
        """Calculate financial influence of phone number."""
        financial_scores = {
            1: 70, 2: 60, 3: 65, 4: 85, 5: 70,
            6: 75, 7: 60, 8: 95, 9: 65,
            11: 75, 22: 90, 33: 70
        }
        
        score = financial_scores.get(vibration, 70)
        
        return {
            'score': score,
            'level': 'high' if score >= 80 else 'moderate' if score >= 60 else 'low',
            'description': self._get_financial_description(vibration)
        }
    
    def _calculate_stress_influence(self, vibration: int, phone_digits: str) -> Dict[str, Any]:
        """Calculate stress influence of phone number."""
        stress_scores = {
            1: 60, 2: 50, 3: 55, 4: 40, 5: 75,
            6: 45, 7: 65, 8: 70, 9: 50,
            11: 60, 22: 50, 33: 55
        }
        
        base_stress = stress_scores.get(vibration, 55)
        
        # Check for repeating numbers (can increase stress)
        if len(set(phone_digits)) < len(phone_digits) * 0.5:
            base_stress += 10
        
        return {
            'score': min(100, base_stress),
            'level': 'high' if base_stress >= 70 else 'moderate' if base_stress >= 50 else 'low',
            'description': self._get_stress_description(vibration)
        }
    
    def _calculate_date_alignment(
        self,
        owner_lp: int,
        launch_py: int,
        business_vibration: int
    ) -> Dict[str, Any]:
        """Calculate alignment between launch date and business."""
        # Calculate alignment score
        lp_py_diff = abs(owner_lp - launch_py)
        lp_vib_diff = abs(owner_lp - business_vibration)
        py_vib_diff = abs(launch_py - business_vibration)
        
        total_diff = lp_py_diff + lp_vib_diff + py_vib_diff
        alignment_score = max(0, 100 - (total_diff * 10))
        
        return {
            'score': alignment_score,
            'level': 'excellent' if alignment_score >= 80 else 'good' if alignment_score >= 60 else 'moderate',
            'owner_life_path': owner_lp,
            'launch_personal_year': launch_py,
            'business_vibration': business_vibration
        }
    
    def _calculate_business_cycles(self, launch_date: date) -> Dict[str, Any]:
        """Calculate yearly business cycles."""
        current_year = date.today().year
        years_analysis = []
        
        for year in range(launch_date.year, current_year + 5):
            years_since_launch = year - launch_date.year
            cycle_number = (years_since_launch % 9) + 1
            
            years_analysis.append({
                'year': year,
                'cycle_number': cycle_number,
                'cycle_meaning': self._get_business_cycle_meaning(cycle_number)
            })
        
        return {
            'launch_year': launch_date.year,
            'yearly_cycles': years_analysis
        }
    
    def _interpret_vehicle_number(self, vibration: int) -> str:
        """Interpret vehicle vibration number."""
        interpretations = {
            1: 'Vehicle supports independence and leadership. Good for business use.',
            2: 'Vehicle promotes harmony and cooperation. Ideal for family use.',
            3: 'Vehicle encourages creativity and expression. Good for social activities.',
            4: 'Vehicle provides stability and reliability. Excellent for daily commuting.',
            5: 'Vehicle supports adventure and change. Good for travel and exploration.',
            6: 'Vehicle promotes responsibility and service. Ideal for family and community use.',
            7: 'Vehicle supports introspection and spirituality. Good for personal reflection.',
            8: 'Vehicle promotes material success. Excellent for business and professional use.',
            9: 'Vehicle supports humanitarian work. Good for service-oriented activities.',
        }
        return interpretations.get(vibration, 'Vehicle supports general transportation needs.')
    
    def _interpret_property_number(self, house_vibration: int, floor_vibration: Optional[int]) -> str:
        """Interpret property vibration number."""
        interpretations = {
            1: 'Property supports independence and new beginnings. Good for starting fresh.',
            2: 'Property promotes harmony and partnerships. Ideal for couples and families.',
            3: 'Property encourages creativity and social activities. Good for artists and entertainers.',
            4: 'Property provides stability and foundation. Excellent for long-term residence.',
            5: 'Property supports change and movement. Good for those who travel frequently.',
            6: 'Property promotes family life and responsibility. Ideal for raising children.',
            7: 'Property supports spirituality and introspection. Good for meditation and study.',
            8: 'Property promotes material success and achievement. Excellent for business owners.',
            9: 'Property supports humanitarian work. Good for community leaders.',
        }
        
        base_interpretation = interpretations.get(house_vibration, 'Property supports general living needs.')
        
        if floor_vibration:
            floor_meanings = {
                1: 'Top floor supports independence', 2: 'Middle floor promotes balance',
                3: 'Lower floor encourages grounding', 4: 'Any floor provides stability'
            }
            floor_note = floor_meanings.get(floor_vibration, '')
            return f"{base_interpretation} {floor_note}."
        
        return base_interpretation
    
    def _interpret_business_number(self, vibration: int) -> str:
        """Interpret business vibration number."""
        interpretations = {
            1: 'Business name supports leadership and innovation. Good for startups and tech companies.',
            2: 'Business name promotes partnerships and cooperation. Ideal for service businesses.',
            3: 'Business name encourages creativity and communication. Good for media and arts.',
            4: 'Business name provides stability and structure. Excellent for construction and real estate.',
            5: 'Business name supports change and adaptability. Good for marketing and sales.',
            6: 'Business name promotes responsibility and service. Ideal for healthcare and education.',
            7: 'Business name supports analysis and research. Good for consulting and technology.',
            8: 'Business name promotes material success. Excellent for finance and investment.',
            9: 'Business name supports humanitarian work. Good for non-profits and social enterprises.',
        }
        return interpretations.get(vibration, 'Business name supports general business activities.')
    
    def _interpret_phone_number(self, vibration: int) -> str:
        """Interpret phone number vibration."""
        interpretations = {
            1: 'Phone number supports leadership and initiative. Good for business calls.',
            2: 'Phone number promotes communication and cooperation. Ideal for partnerships.',
            3: 'Phone number encourages creativity and expression. Good for social connections.',
            4: 'Phone number provides stability and reliability. Excellent for important calls.',
            5: 'Phone number supports change and flexibility. Good for dynamic communications.',
            6: 'Phone number promotes responsibility and service. Ideal for family and community.',
            7: 'Phone number supports introspection and analysis. Good for deep conversations.',
            8: 'Phone number promotes material success. Excellent for business transactions.',
            9: 'Phone number supports humanitarian work. Good for service-oriented calls.',
        }
        return interpretations.get(vibration, 'Phone number supports general communication needs.')
    
    def _generate_vehicle_recommendations(
        self,
        vibration: int,
        safety_score: int,
        compatibility: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations for vehicle."""
        recommendations = []
        
        if safety_score < 70:
            recommendations.append('Consider additional safety measures and careful driving.')
        
        if compatibility and compatibility['score'] < 60:
            recommendations.append('This vehicle may require extra attention and maintenance.')
        
        if vibration in [4, 8]:
            recommendations.append('This vehicle is well-suited for business and professional use.')
        elif vibration in [2, 6]:
            recommendations.append('This vehicle is ideal for family and community use.')
        
        return recommendations
    
    def _generate_property_remedies(
        self,
        house_vibration: int,
        compatibility: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Generate remedy suggestions for property."""
        remedies = []
        
        if compatibility and compatibility['score'] < 60:
            remedies.append('Consider using colors and elements that align with your Life Path number.')
            remedies.append('Place objects with your Life Path number in key areas of the home.')
        
        if house_vibration in [5, 7]:
            remedies.append('Add stability elements (number 4 items) to balance the energy.')
        
        if house_vibration in [1, 8]:
            remedies.append('Add harmony elements (number 2 items) to soften the energy.')
        
        return remedies
    
    def _generate_business_recommendations(
        self,
        name_vibration: int,
        launch_alignment: Optional[Dict[str, Any]]
    ) -> List[str]:
        """Generate recommendations for business."""
        recommendations = []
        
        if launch_alignment and launch_alignment['score'] < 70:
            recommendations.append('Consider adjusting launch timing for better alignment.')
        
        if name_vibration in [1, 8]:
            recommendations.append('Focus on leadership and material success strategies.')
        elif name_vibration in [2, 6]:
            recommendations.append('Emphasize partnerships and service-oriented approaches.')
        
        return recommendations
    
    def _generate_phone_recommendations(
        self,
        vibration: int,
        compatibility: Optional[Dict[str, Any]],
        stress_influence: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations for phone number."""
        recommendations = []
        
        if stress_influence['score'] >= 70:
            recommendations.append('This number may cause stress. Consider using it for specific purposes only.')
        
        if compatibility and compatibility['score'] < 60:
            recommendations.append('Consider getting a number that better aligns with your Life Path.')
        
        if vibration in [4, 8]:
            recommendations.append('This number is excellent for business and financial calls.')
        
        return recommendations
    
    def _get_financial_description(self, vibration: int) -> str:
        """Get financial description for vibration."""
        descriptions = {
            4: 'Strong foundation for financial stability',
            8: 'Excellent for material success and wealth accumulation',
            1: 'Good for financial independence and leadership',
            6: 'Supports financial responsibility and service',
        }
        return descriptions.get(vibration, 'Moderate financial influence')
    
    def _get_stress_description(self, vibration: int) -> str:
        """Get stress description for vibration."""
        descriptions = {
            5: 'High change energy may cause stress',
            7: 'Analytical energy may lead to overthinking',
            8: 'Material focus may create pressure',
        }
        return descriptions.get(vibration, 'Moderate stress levels')
    
    def _get_business_cycle_meaning(self, cycle_number: int) -> str:
        """Get meaning for business cycle number."""
        meanings = {
            1: 'Year of new beginnings and initiatives',
            2: 'Year of partnerships and cooperation',
            3: 'Year of creativity and expansion',
            4: 'Year of building and stabilization',
            5: 'Year of change and adaptation',
            6: 'Year of service and responsibility',
            7: 'Year of analysis and refinement',
            8: 'Year of material success and achievement',
            9: 'Year of completion and transition',
        }
        return meanings.get(cycle_number, 'Year of growth and development')
    
    def optimize_business_name(
        self,
        current_name: str,
        target_vibration: Optional[int] = None,
        business_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Optimize business name for better numerology vibration.
        
        Args:
            current_name: Current business name
            target_vibration: Target vibration number (optional)
            business_type: Type of business (tech, retail, service, etc.)
            
        Returns:
            Optimization suggestions and analysis
        """
        current_vibration = self.calculator._sum_name(current_name)
        current_vibration = self.calculator._reduce_to_single_digit(current_vibration, preserve_master=True)
        
        # Determine optimal vibration based on business type
        if not target_vibration:
            optimal_vibrations = {
                'tech': 7, 'retail': 8, 'service': 6, 'creative': 3,
                'finance': 8, 'healthcare': 6, 'education': 9, 'real_estate': 4
            }
            target_vibration = optimal_vibrations.get(business_type, 8)  # Default to 8 for success
        
        # Generate name variations
        suggestions = self._generate_name_variations(current_name, target_vibration)
        
        # Analyze current name
        current_analysis = {
            'vibration': current_vibration,
            'strengths': self._get_business_name_strengths(current_vibration),
            'weaknesses': self._get_business_name_weaknesses(current_vibration),
            'alignment_with_target': abs(current_vibration - target_vibration) <= 2
        }
        
        return {
            'current_name': current_name,
            'current_vibration': current_vibration,
            'target_vibration': target_vibration,
            'current_analysis': current_analysis,
            'suggestions': suggestions,
            'recommendations': self._get_name_optimization_recommendations(
                current_vibration, target_vibration, business_type
            )
        }
    
    def calculate_launch_date(
        self,
        owner_birth_date: date,
        business_name: str,
        start_date: date,
        end_date: date,
        business_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate optimal launch dates for business.
        
        Args:
            owner_birth_date: Business owner's birth date
            business_name: Business name
            start_date: Start of date range
            end_date: End of date range
            business_type: Type of business
            
        Returns:
            Optimal launch dates with analysis
        """
        from datetime import timedelta
        
        business_vibration = self.calculator._sum_name(business_name)
        business_vibration = self.calculator._reduce_to_single_digit(business_vibration, preserve_master=True)
        owner_life_path = self.calculator.calculate_life_path_number(owner_birth_date)
        
        optimal_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            personal_year = self.calculator.calculate_personal_year_number(owner_birth_date, current_date.year)
            personal_month = self.calculator.calculate_personal_month_number(
                owner_birth_date, current_date.year, current_date.month
            )
            personal_day = self.calculator.calculate_personal_day_number(owner_birth_date, current_date)
            
            # Calculate alignment score
            alignment_score = self._calculate_launch_alignment_score(
                owner_life_path, business_vibration, personal_year, personal_month, personal_day
            )
            
            optimal_dates.append({
                'date': current_date.isoformat(),
                'personal_year': personal_year,
                'personal_month': personal_month,
                'personal_day': personal_day,
                'alignment_score': alignment_score,
                'recommendation': self._get_launch_recommendation(alignment_score)
            })
            
            current_date += timedelta(days=1)
        
        # Sort by alignment score
        optimal_dates.sort(key=lambda x: x['alignment_score'], reverse=True)
        
        return {
            'business_name': business_name,
            'business_vibration': business_vibration,
            'owner_life_path': owner_life_path,
            'top_dates': optimal_dates[:10],
            'all_dates': optimal_dates,
            'recommendations': self._get_launch_timing_recommendations(business_vibration, owner_life_path)
        }
    
    def analyze_business_cycles(
        self,
        launch_date: date,
        years_ahead: int = 10
    ) -> Dict[str, Any]:
        """
        Analyze business cycles over time.
        
        Args:
            launch_date: Business launch date
            years_ahead: Number of years to analyze
            
        Returns:
            Detailed business cycle analysis
        """
        current_year = date.today().year
        end_year = launch_date.year + years_ahead
        
        cycles = []
        for year in range(launch_date.year, end_year + 1):
            years_since_launch = year - launch_date.year
            cycle_number = (years_since_launch % 9) + 1 if years_since_launch > 0 else 1
            
            cycle_analysis = {
                'year': year,
                'years_since_launch': years_since_launch,
                'cycle_number': cycle_number,
                'cycle_meaning': self._get_business_cycle_meaning(cycle_number),
                'focus_areas': self._get_cycle_focus_areas(cycle_number),
                'opportunities': self._get_cycle_opportunities(cycle_number),
                'challenges': self._get_cycle_challenges(cycle_number),
                'recommendations': self._get_cycle_recommendations(cycle_number)
            }
            
            cycles.append(cycle_analysis)
        
        return {
            'launch_date': launch_date.isoformat(),
            'current_cycle': cycles[0] if cycles else None,
            'upcoming_cycles': cycles[1:6] if len(cycles) > 1 else [],
            'all_cycles': cycles,
            'cycle_summary': self._generate_cycle_summary(cycles)
        }
    
    def calculate_financial_timing(
        self,
        owner_birth_date: date,
        business_name: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Calculate optimal timing for financial activities.
        
        Args:
            owner_birth_date: Business owner's birth date
            business_name: Business name
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            Optimal financial timing analysis
        """
        business_vibration = self.calculator._sum_name(business_name)
        business_vibration = self.calculator._reduce_to_single_digit(business_vibration, preserve_master=True)
        owner_life_path = self.calculator.calculate_life_path_number(owner_birth_date)
        
        # Financial numbers (4, 6, 8 are best for finances)
        financial_numbers = {4, 6, 8}
        
        from datetime import timedelta
        optimal_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            personal_day = self.calculator.calculate_personal_day_number(owner_birth_date, current_date)
            personal_month = self.calculator.calculate_personal_month_number(
                owner_birth_date, current_date.year, current_date.month
            )
            
            # Calculate financial score
            financial_score = 50  # Base score
            
            if personal_day in financial_numbers:
                financial_score += 20
            if personal_month in financial_numbers:
                financial_score += 15
            if business_vibration in financial_numbers:
                financial_score += 10
            
            # Avoid challenging days
            if personal_day == 5:  # Change day
                financial_score -= 15
            
            optimal_dates.append({
                'date': current_date.isoformat(),
                'personal_day': personal_day,
                'personal_month': personal_month,
                'financial_score': max(0, min(100, financial_score)),
                'suitable_for': self._get_financial_activity_suitability(financial_score)
            })
            
            current_date += timedelta(days=1)
        
        optimal_dates.sort(key=lambda x: x['financial_score'], reverse=True)
        
        return {
            'top_dates': optimal_dates[:10],
            'all_dates': optimal_dates,
            'recommendations': self._get_financial_timing_recommendations(business_vibration, owner_life_path)
        }
    
    def analyze_team_compatibility(
        self,
        business_name: str,
        team_members: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze team numerology compatibility.
        
        Args:
            business_name: Business name
            team_members: List of team members with birth_date and name
            
        Returns:
            Team compatibility analysis
        """
        business_vibration = self.calculator._sum_name(business_name)
        business_vibration = self.calculator._reduce_to_single_digit(business_vibration, preserve_master=True)
        
        team_analysis = []
        for member in team_members:
            birth_date = member.get('birth_date')
            name = member.get('name', '')
            
            if not birth_date:
                continue
            
            life_path = self.calculator.calculate_life_path_number(birth_date)
            destiny = self.calculator.calculate_destiny_number(name) if name else None
            
            compatibility = self._calculate_owner_compatibility(business_vibration, life_path)
            
            team_analysis.append({
                'name': name,
                'birth_date': birth_date.isoformat() if isinstance(birth_date, date) else birth_date,
                'life_path': life_path,
                'destiny': destiny,
                'compatibility_with_business': compatibility,
                'role_suitability': self._get_role_suitability(life_path, business_vibration)
            })
        
        # Calculate overall team score
        if team_analysis:
            avg_compatibility = sum(m['compatibility_with_business']['score'] for m in team_analysis) / len(team_analysis)
        else:
            avg_compatibility = 0
        
        return {
            'business_name': business_name,
            'business_vibration': business_vibration,
            'team_members': team_analysis,
            'overall_team_score': avg_compatibility,
            'team_dynamics': self._analyze_team_dynamics(team_analysis),
            'recommendations': self._get_team_recommendations(team_analysis, business_vibration)
        }
    
    def _generate_name_variations(self, current_name: str, target_vibration: int) -> List[Dict[str, Any]]:
        """Generate name variations to achieve target vibration."""
        suggestions = []
        
        # Simple variations (add/remove words, change spelling)
        name_parts = current_name.split()
        
        # Try adding words
        enhancement_words = {
            1: ['Prime', 'First', 'Alpha'],
            2: ['Partner', 'Twin', 'Dual'],
            4: ['Solid', 'Base', 'Core'],
            6: ['Care', 'Service', 'Help'],
            8: ['Elite', 'Prime', 'Max']
        }
        
        if target_vibration in enhancement_words:
            for word in enhancement_words[target_vibration][:2]:
                variation = f"{current_name} {word}"
                vib = self.calculator._sum_name(variation)
                vib = self.calculator._reduce_to_single_digit(vib, preserve_master=True)
                suggestions.append({
                    'name': variation,
                    'vibration': vib,
                    'match_score': 100 if vib == target_vibration else 100 - abs(vib - target_vibration) * 10
                })
        
        return sorted(suggestions, key=lambda x: x['match_score'], reverse=True)[:5]
    
    def _get_business_name_strengths(self, vibration: int) -> List[str]:
        """Get strengths for business name vibration."""
        strengths = {
            1: ['Leadership', 'Innovation', 'Independence'],
            2: ['Partnerships', 'Cooperation', 'Harmony'],
            4: ['Stability', 'Structure', 'Foundation'],
            6: ['Service', 'Responsibility', 'Care'],
            8: ['Material Success', 'Achievement', 'Wealth']
        }
        return strengths.get(vibration, ['General Business Support'])
    
    def _get_business_name_weaknesses(self, vibration: int) -> List[str]:
        """Get weaknesses for business name vibration."""
        weaknesses = {
            5: ['Instability', 'Too much change'],
            7: ['Isolation', 'Over-analysis'],
            9: ['Scattered focus', 'Too broad']
        }
        return weaknesses.get(vibration, [])
    
    def _get_name_optimization_recommendations(
        self,
        current_vibration: int,
        target_vibration: int,
        business_type: Optional[str]
    ) -> List[str]:
        """Get recommendations for name optimization."""
        recommendations = []
        
        if abs(current_vibration - target_vibration) > 2:
            recommendations.append(f'Consider adjusting name to achieve vibration {target_vibration}')
            recommendations.append('Add or modify words to align with target vibration')
        
        if business_type:
            recommendations.append(f'Optimize name for {business_type} business type')
        
        return recommendations
    
    def _calculate_launch_alignment_score(
        self,
        owner_lp: int,
        business_vib: int,
        personal_year: int,
        personal_month: int,
        personal_day: int
    ) -> int:
        """Calculate alignment score for launch date."""
        score = 50  # Base score
        
        # Owner LP alignment with business
        if abs(owner_lp - business_vib) <= 2:
            score += 20
        
        # Personal year alignment
        if personal_year in [1, 4, 8]:  # Good for business
            score += 15
        elif personal_year == 5:  # Change year - less ideal
            score -= 10
        
        # Personal day alignment
        if personal_day in [1, 4, 6, 8]:  # Good for launches
            score += 15
        elif personal_day == 5:  # Change day - avoid
            score -= 15
        
        return max(0, min(100, score))
    
    def _get_launch_recommendation(self, score: int) -> str:
        """Get launch recommendation based on score."""
        if score >= 80:
            return 'Excellent - Highly recommended'
        elif score >= 70:
            return 'Good - Recommended'
        elif score >= 60:
            return 'Moderate - Acceptable'
        else:
            return 'Not recommended - Consider alternative date'
    
    def _get_launch_timing_recommendations(self, business_vib: int, owner_lp: int) -> List[str]:
        """Get general launch timing recommendations."""
        recommendations = []
        
        if business_vib in [1, 4, 8]:
            recommendations.append('Focus on dates with Personal Day 1, 4, or 8')
        elif business_vib in [2, 6]:
            recommendations.append('Focus on dates with Personal Day 2 or 6')
        
        recommendations.append('Avoid Personal Day 5 for major launches')
        recommendations.append('Personal Year 1, 4, or 8 are ideal for business launches')
        
        return recommendations
    
    def _get_cycle_focus_areas(self, cycle_number: int) -> List[str]:
        """Get focus areas for business cycle."""
        focus_areas = {
            1: ['New initiatives', 'Leadership', 'Innovation'],
            2: ['Partnerships', 'Collaboration', 'Team building'],
            4: ['Building foundation', 'Structure', 'Stability'],
            6: ['Service', 'Customer care', 'Responsibility'],
            8: ['Financial growth', 'Expansion', 'Success']
        }
        return focus_areas.get(cycle_number, ['General growth'])
    
    def _get_cycle_opportunities(self, cycle_number: int) -> List[str]:
        """Get opportunities for business cycle."""
        opportunities = {
            1: ['New market entry', 'Product launches', 'Leadership opportunities'],
            4: ['Infrastructure development', 'Long-term planning', 'Stability building'],
            8: ['Financial investments', 'Business expansion', 'Material success']
        }
        return opportunities.get(cycle_number, ['Growth opportunities'])
    
    def _get_cycle_challenges(self, cycle_number: int) -> List[str]:
        """Get challenges for business cycle."""
        challenges = {
            5: ['Too much change', 'Instability', 'Need for balance'],
            7: ['Over-analysis', 'Isolation', 'Need for action']
        }
        return challenges.get(cycle_number, ['General challenges'])
    
    def _get_cycle_recommendations(self, cycle_number: int) -> List[str]:
        """Get recommendations for business cycle."""
        recommendations = {
            1: ['Take initiative', 'Lead with confidence', 'Start new projects'],
            4: ['Build solid foundation', 'Focus on structure', 'Plan long-term'],
            8: ['Focus on financial goals', 'Expand operations', 'Seek material success']
        }
        return recommendations.get(cycle_number, ['Focus on growth and development'])
    
    def _generate_cycle_summary(self, cycles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary of business cycles."""
        if not cycles:
            return {}
        
        upcoming_cycles = [c for c in cycles if c['years_since_launch'] >= 0][:5]
        
        return {
            'total_cycles_analyzed': len(cycles),
            'upcoming_high_opportunity_cycles': [
                c for c in upcoming_cycles if c['cycle_number'] in [1, 4, 8]
            ],
            'upcoming_challenging_cycles': [
                c for c in upcoming_cycles if c['cycle_number'] in [5, 7]
            ]
        }
    
    def _get_financial_activity_suitability(self, score: int) -> List[str]:
        """Get suitable financial activities for score."""
        if score >= 80:
            return ['Major investments', 'Large transactions', 'Financial launches']
        elif score >= 70:
            return ['Moderate investments', 'Important transactions']
        elif score >= 60:
            return ['Regular transactions', 'Small investments']
        else:
            return ['Avoid major financial activities']
    
    def _get_financial_timing_recommendations(self, business_vib: int, owner_lp: int) -> List[str]:
        """Get financial timing recommendations."""
        recommendations = []
        
        if business_vib in [4, 8]:
            recommendations.append('Business vibration supports financial activities')
        
        recommendations.append('Focus on dates with Personal Day 4, 6, or 8')
        recommendations.append('Avoid Personal Day 5 for major financial decisions')
        
        return recommendations
    
    def _get_role_suitability(self, life_path: int, business_vib: int) -> Dict[str, Any]:
        """Get role suitability based on life path and business vibration."""
        role_mapping = {
            1: ['CEO', 'Founder', 'Leader'],
            2: ['Partnership Manager', 'HR', 'Mediator'],
            4: ['Operations', 'Finance', 'Structure'],
            6: ['Customer Service', 'Support', 'Care'],
            8: ['Finance', 'Sales', 'Business Development']
        }
        
        suitable_roles = role_mapping.get(life_path, ['General Team Member'])
        compatibility = self._calculate_owner_compatibility(business_vib, life_path)
        
        return {
            'suitable_roles': suitable_roles,
            'compatibility_score': compatibility['score'],
            'fit_level': compatibility['level']
        }
    
    def _analyze_team_dynamics(self, team_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze team dynamics based on numerology."""
        if not team_analysis:
            return {}
        
        life_paths = [m['life_path'] for m in team_analysis]
        
        # Check for complementary numbers
        complementary_pairs = []
        for i, member1 in enumerate(team_analysis):
            for j, member2 in enumerate(team_analysis[i+1:], i+1):
                diff = abs(member1['life_path'] - member2['life_path'])
                if diff in [1, 8]:  # Complementary
                    complementary_pairs.append({
                        'member1': member1['name'],
                        'member2': member2['name'],
                        'type': 'complementary'
                    })
        
        return {
            'average_compatibility': sum(m['compatibility_with_business']['score'] for m in team_analysis) / len(team_analysis),
            'complementary_pairs': complementary_pairs,
            'team_strengths': self._identify_team_strengths(life_paths),
            'team_challenges': self._identify_team_challenges(life_paths)
        }
    
    def _identify_team_strengths(self, life_paths: List[int]) -> List[str]:
        """Identify team strengths."""
        strengths = []
        
        if 1 in life_paths:
            strengths.append('Strong leadership presence')
        if 2 in life_paths:
            strengths.append('Good collaboration skills')
        if 4 in life_paths:
            strengths.append('Strong organizational ability')
        if 8 in life_paths:
            strengths.append('Financial and business acumen')
        
        return strengths if strengths else ['Diverse skill set']
    
    def _identify_team_challenges(self, life_paths: List[int]) -> List[str]:
        """Identify potential team challenges."""
        challenges = []
        
        if life_paths.count(1) > 2:
            challenges.append('Multiple leaders may cause conflicts')
        if 5 in life_paths and 4 in life_paths:
            challenges.append('Balance needed between change and stability')
        
        return challenges
    
    def _get_team_recommendations(
        self,
        team_analysis: List[Dict[str, Any]],
        business_vib: int
    ) -> List[str]:
        """Get recommendations for team."""
        recommendations = []
        
        avg_score = sum(m['compatibility_with_business']['score'] for m in team_analysis) / len(team_analysis) if team_analysis else 0
        
        if avg_score < 70:
            recommendations.append('Consider team members with better business alignment')
        
        recommendations.append('Ensure diverse life paths for balanced team')
        recommendations.append('Match roles to individual life path strengths')
        
        return recommendations

