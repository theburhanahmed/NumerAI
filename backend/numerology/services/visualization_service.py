"""
Visualization service for numerology data.
Provides data structures for various visualization types.
"""
from typing import Dict, List, Any, Optional
from datetime import date, datetime, timedelta
from numerology.numerology import NumerologyCalculator
from numerology.models import NumerologyProfile


class VisualizationService:
    """Service for generating visualization data for numerology."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
    
    def generate_numerology_wheel(
        self,
        profile: NumerologyProfile,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Generate data for numerology wheel visualization.
        Numbers are positioned in a circular arrangement.
        
        Args:
            profile: NumerologyProfile instance
            full_name: Full name
            birth_date: Date of birth
            
        Returns:
            Dictionary with wheel data including positions and connections
        """
        # Get all numbers
        numbers = self.calculator.calculate_all(full_name, birth_date)
        
        # Calculate angles for each number on the wheel (360 degrees / 9 positions = 40 degrees each)
        # Numbers 1-9 are positioned around the circle
        wheel_positions = []
        angle_step = 360 / 9
        
        number_types = {
            'life_path': numbers.get('life_path_number'),
            'destiny': numbers.get('destiny_number'),
            'soul_urge': numbers.get('soul_urge_number'),
            'personality': numbers.get('personality_number'),
            'attitude': numbers.get('attitude_number'),
            'maturity': numbers.get('maturity_number'),
            'balance': numbers.get('balance_number'),
        }
        
        # Group numbers by their value (1-9)
        number_groups = {i: [] for i in range(1, 10)}
        for num_type, num_value in number_types.items():
            if num_value:
                reduced = self._reduce_to_1_9(num_value)
                if reduced in number_groups:
                    number_groups[reduced].append(num_type)
        
        # Create wheel positions
        for number, angle in enumerate(range(0, 360, int(angle_step)), start=1):
            if angle >= 360:
                angle = angle % 360
            
            wheel_positions.append({
                'number': number,
                'angle': angle,
                'x': 0.5 + 0.4 * self._cos_deg(angle),  # Normalized coordinates
                'y': 0.5 + 0.4 * self._sin_deg(angle),
                'associated_types': number_groups.get(number, []),
                'strength': len(number_groups.get(number, [])),
                'is_master': number in [11, 22, 33]
            })
        
        # Calculate connections between related numbers
        connections = self._calculate_wheel_connections(number_types)
        
        # Calculate center number (most frequent)
        center_number = self._get_center_number(number_groups)
        
        return {
            'positions': wheel_positions,
            'connections': connections,
            'center_number': center_number,
            'number_types': number_types,
            'total_numbers': len([v for v in number_types.values() if v]),
            'master_numbers': [v for v in number_types.values() if v in [11, 22, 33]]
        }
    
    def create_timeline_data(
        self,
        profile: NumerologyProfile,
        full_name: str,
        birth_date: date,
        years_ahead: int = 10
    ) -> Dict[str, Any]:
        """
        Generate timeline data for life events and cycles.
        
        Args:
            profile: NumerologyProfile instance
            full_name: Full name
            birth_date: Date of birth
            years_ahead: Number of years to project forward
            
        Returns:
            Dictionary with timeline events and cycle markers
        """
        today = date.today()
        birth_year = birth_date.year
        current_year = today.year
        
        timeline_events = []
        
        # Add birth event
        timeline_events.append({
            'date': birth_date.isoformat(),
            'type': 'birth',
            'label': 'Birth',
            'year': birth_year,
            'personal_year': self._calculate_personal_year(birth_date, birth_date),
            'personal_month': self._calculate_personal_month(birth_date, birth_date),
            'personal_day': self._calculate_personal_day(birth_date, birth_date),
        })
        
        # Calculate personal years from birth to current + years_ahead
        end_year = current_year + years_ahead
        for year in range(birth_year, end_year + 1):
            year_date = date(year, 1, 1)
            personal_year = self._calculate_personal_year(birth_date, year_date)
            
            # Mark important years (9-year cycle transitions)
            is_cycle_transition = (year - birth_year) % 9 == 0
            
            # Mark pinnacle transitions (rough estimates)
            is_pinnacle_transition = False
            age = year - birth_year
            if age in [0, 28, 36, 44]:
                is_pinnacle_transition = True
            
            timeline_events.append({
                'date': year_date.isoformat(),
                'type': 'personal_year',
                'label': f'Personal Year {personal_year}',
                'year': year,
                'personal_year': personal_year,
                'is_cycle_transition': is_cycle_transition,
                'is_pinnacle_transition': is_pinnacle_transition,
                'age': age
            })
            
            # Add monthly markers for current and next year only
            if year >= current_year - 1 and year <= current_year + 1:
                for month in range(1, 13):
                    month_date = date(year, month, 1)
                    personal_month = self._calculate_personal_month(birth_date, month_date)
                    
                    timeline_events.append({
                        'date': month_date.isoformat(),
                        'type': 'personal_month',
                        'label': f'Personal Month {personal_month}',
                        'year': year,
                        'month': month,
                        'personal_month': personal_month,
                        'personal_year': personal_year
                    })
        
        # Sort events by date
        timeline_events.sort(key=lambda x: x['date'])
        
        # Get current position
        current_position = next(
            (i for i, event in enumerate(timeline_events) if event['date'] >= today.isoformat()),
            len(timeline_events) - 1
        )
        
        return {
            'events': timeline_events,
            'current_position': current_position,
            'birth_date': birth_date.isoformat(),
            'current_date': today.isoformat(),
            'total_events': len(timeline_events),
            'years_covered': end_year - birth_year
        }
    
    def generate_comparison_charts(
        self,
        profiles: List[Dict[str, Any]],
        names: List[str]
    ) -> Dict[str, Any]:
        """
        Generate comparison chart data between multiple profiles.
        
        Args:
            profiles: List of profile data dictionaries
            names: List of names corresponding to profiles
            
        Returns:
            Dictionary with comparison chart data
        """
        if len(profiles) != len(names):
            raise ValueError("Profiles and names lists must have the same length")
        
        # Extract numbers for comparison
        number_fields = [
            'life_path_number', 'destiny_number', 'soul_urge_number',
            'personality_number', 'attitude_number', 'maturity_number',
            'balance_number'
        ]
        
        comparison_data = {
            'bar_chart': {
                'labels': [],
                'datasets': []
            },
            'radar_chart': {
                'labels': number_fields,
                'datasets': []
            },
            'scatter_plot': []
        }
        
        # Prepare data for each profile
        for idx, (profile, name) in enumerate(zip(profiles, names)):
            # Bar chart data
            comparison_data['bar_chart']['labels'].extend(
                [f"{name} - {field.replace('_', ' ').title()}" for field in number_fields]
            )
            
            # Radar chart data
            radar_values = [
                self._reduce_to_1_9(profile.get(field, 0)) for field in number_fields
            ]
            comparison_data['radar_chart']['datasets'].append({
                'label': name,
                'data': radar_values
            })
            
            # Scatter plot data (life path vs destiny)
            comparison_data['scatter_plot'].append({
                'x': self._reduce_to_1_9(profile.get('life_path_number', 0)),
                'y': self._reduce_to_1_9(profile.get('destiny_number', 0)),
                'label': name
            })
        
        # Calculate compatibility scores
        compatibility_scores = []
        if len(profiles) >= 2:
            for i in range(len(profiles)):
                for j in range(i + 1, len(profiles)):
                    score = self._calculate_compatibility_score(
                        profiles[i], profiles[j]
                    )
                    compatibility_scores.append({
                        'person1': names[i],
                        'person2': names[j],
                        'score': score
                    })
        
        return {
            **comparison_data,
            'compatibility_scores': compatibility_scores,
            'profiles_count': len(profiles)
        }
    
    def create_heatmap_data(
        self,
        profile: NumerologyProfile,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Generate heatmap data showing number strength/weakness.
        
        Args:
            profile: NumerologyProfile instance
            full_name: Full name
            birth_date: Date of birth
            
        Returns:
            Dictionary with heatmap data
        """
        numbers = self.calculator.calculate_all(full_name, birth_date)
        
        # Map numbers to 1-9 grid
        number_types = {
            'Life Path': numbers.get('life_path_number'),
            'Destiny': numbers.get('destiny_number'),
            'Soul Urge': numbers.get('soul_urge_number'),
            'Personality': numbers.get('personality_number'),
            'Attitude': numbers.get('attitude_number'),
            'Maturity': numbers.get('maturity_number'),
            'Balance': numbers.get('balance_number'),
        }
        
        # Count frequency of each number (1-9)
        frequency_map = {i: 0 for i in range(1, 10)}
        for num_type, num_value in number_types.items():
            if num_value:
                reduced = self._reduce_to_1_9(num_value)
                if reduced in frequency_map:
                    frequency_map[reduced] += 1
        
        # Create heatmap cells (3x3 grid for numbers 1-9)
        heatmap_cells = []
        grid_positions = [
            (1, 0, 0), (2, 0, 1), (3, 0, 2),
            (4, 1, 0), (5, 1, 1), (6, 1, 2),
            (7, 2, 0), (8, 2, 1), (9, 2, 2)
        ]
        
        max_frequency = max(frequency_map.values()) if frequency_map.values() else 1
        
        for number, row, col in grid_positions:
            frequency = frequency_map.get(number, 0)
            intensity = frequency / max_frequency if max_frequency > 0 else 0
            
            # Determine strength level
            if frequency >= 3:
                strength = 'very_strong'
            elif frequency >= 2:
                strength = 'strong'
            elif frequency == 1:
                strength = 'present'
            else:
                strength = 'missing'
            
            # Get associated types
            associated_types = [
                num_type for num_type, num_value in number_types.items()
                if num_value and self._reduce_to_1_9(num_value) == number
            ]
            
            heatmap_cells.append({
                'number': number,
                'row': row,
                'col': col,
                'frequency': frequency,
                'intensity': intensity,
                'strength': strength,
                'associated_types': associated_types
            })
        
        return {
            'cells': heatmap_cells,
            'frequency_map': frequency_map,
            'max_frequency': max_frequency,
            'total_numbers': sum(frequency_map.values())
        }
    
    def generate_3d_visualization_data(
        self,
        profile: NumerologyProfile,
        full_name: str,
        birth_date: date
    ) -> Dict[str, Any]:
        """
        Generate 3D visualization data for number relationships.
        
        Args:
            profile: NumerologyProfile instance
            full_name: Full name
            birth_date: Date of birth
            
        Returns:
            Dictionary with 3D positions and connections
        """
        numbers = self.calculator.calculate_all(full_name, birth_date)
        
        number_types = {
            'life_path': numbers.get('life_path_number'),
            'destiny': numbers.get('destiny_number'),
            'soul_urge': numbers.get('soul_urge_number'),
            'personality': numbers.get('personality_number'),
            'attitude': numbers.get('attitude_number'),
            'maturity': numbers.get('maturity_number'),
            'balance': numbers.get('balance_number'),
        }
        
        # Create 3D positions in a sphere
        # Center point (0, 0, 0) represents balance
        nodes = []
        connections = []
        
        # Position numbers in 3D space
        unique_numbers = set()
        for num_type, num_value in number_types.items():
            if num_value:
                reduced = self._reduce_to_1_9(num_value)
                unique_numbers.add(reduced)
        
        unique_numbers_list = sorted(list(unique_numbers))
        num_nodes = len(unique_numbers_list)
        
        # Position nodes on a sphere
        for idx, number in enumerate(unique_numbers_list):
            # Spherical coordinates
            phi = 2 * 3.14159 * idx / num_nodes  # Azimuth angle
            theta = 3.14159 * (idx % (num_nodes // 2 + 1)) / (num_nodes // 2 + 1)  # Polar angle
            
            x = 1.0 * self._sin_deg_rad(theta) * self._cos_deg_rad(phi)
            y = 1.0 * self._sin_deg_rad(theta) * self._sin_deg_rad(phi)
            z = 1.0 * self._cos_deg_rad(theta)
            
            # Get types associated with this number
            associated_types = [
                num_type for num_type, num_value in number_types.items()
                if num_value and self._reduce_to_1_9(num_value) == number
            ]
            
            nodes.append({
                'id': f'number_{number}',
                'number': number,
                'position': {'x': x, 'y': y, 'z': z},
                'associated_types': associated_types,
                'is_master': number in [11, 22, 33]
            })
        
        # Create connections between related numbers
        # Connect numbers that appear together in calculations
        for i, node1 in enumerate(nodes):
            for j, node2 in enumerate(nodes[i+1:], start=i+1):
                # Connect if they share associated types (simplified)
                types1 = set(node1['associated_types'])
                types2 = set(node2['associated_types'])
                
                # Create connection if numbers are close or related
                num_diff = abs(node1['number'] - node2['number'])
                if num_diff <= 2 or types1.intersection(types2):
                    connections.append({
                        'from': node1['id'],
                        'to': node2['id'],
                        'strength': len(types1.intersection(types2)) + (3 - num_diff) / 3
                    })
        
        return {
            'nodes': nodes,
            'connections': connections,
            'center': {'x': 0, 'y': 0, 'z': 0},
            'bounds': {'min': -1.5, 'max': 1.5}
        }
    
    def _reduce_to_1_9(self, number: int) -> int:
        """Reduce number to 1-9, preserving master numbers as their reduced form."""
        master_reductions = {11: 2, 22: 4, 33: 6}
        if number in master_reductions:
            return master_reductions[number]
        
        while number > 9:
            number = sum(int(digit) for digit in str(number))
        return number
    
    def _calculate_personal_year(self, birth_date: date, target_date: date) -> int:
        """Calculate personal year number."""
        birth_month = birth_date.month
        birth_day = birth_date.day
        target_year = target_date.year
        
        total = birth_month + birth_day + target_year
        return self._reduce_to_1_9(total)
    
    def _calculate_personal_month(self, birth_date: date, target_date: date) -> int:
        """Calculate personal month number."""
        personal_year = self._calculate_personal_year(birth_date, target_date)
        target_month = target_date.month
        
        total = personal_year + target_month
        return self._reduce_to_1_9(total)
    
    def _calculate_personal_day(self, birth_date: date, target_date: date) -> int:
        """Calculate personal day number."""
        personal_month = self._calculate_personal_month(birth_date, target_date)
        target_day = target_date.day
        
        total = personal_month + target_day
        return self._reduce_to_1_9(total)
    
    def _cos_deg(self, degrees: float) -> float:
        """Cosine in degrees."""
        import math
        return math.cos(math.radians(degrees))
    
    def _sin_deg(self, degrees: float) -> float:
        """Sine in degrees."""
        import math
        return math.sin(math.radians(degrees))
    
    def _cos_deg_rad(self, radians: float) -> float:
        """Cosine."""
        import math
        return math.cos(radians)
    
    def _sin_deg_rad(self, radians: float) -> float:
        """Sine."""
        import math
        return math.sin(radians)
    
    def _calculate_wheel_connections(self, number_types: Dict[str, int]) -> List[Dict[str, Any]]:
        """Calculate connections between numbers in the wheel."""
        connections = []
        
        # Connect numbers that share the same value
        number_groups = {}
        for num_type, num_value in number_types.items():
            if num_value:
                reduced = self._reduce_to_1_9(num_value)
                if reduced not in number_groups:
                    number_groups[reduced] = []
                number_groups[reduced].append(num_type)
        
        # Create connections within groups
        for number, types in number_groups.items():
            if len(types) > 1:
                for i, type1 in enumerate(types):
                    for type2 in types[i+1:]:
                        connections.append({
                            'from': number,
                            'to': number,
                            'type': 'same_value',
                            'strength': 1.0
                        })
        
        return connections
    
    def _get_center_number(self, number_groups: Dict[int, List[str]]) -> Optional[int]:
        """Get the center number (most frequent)."""
        if not number_groups:
            return None
        
        max_count = max(len(types) for types in number_groups.values())
        center_numbers = [
            number for number, types in number_groups.items()
            if len(types) == max_count
        ]
        
        return center_numbers[0] if center_numbers else None
    
    def _calculate_compatibility_score(
        self,
        profile1: Dict[str, Any],
        profile2: Dict[str, Any]
    ) -> int:
        """Calculate compatibility score between two profiles."""
        score = 0
        number_fields = [
            'life_path_number', 'destiny_number', 'soul_urge_number',
            'personality_number'
        ]
        
        for field in number_fields:
            val1 = self._reduce_to_1_9(profile1.get(field, 0))
            val2 = self._reduce_to_1_9(profile2.get(field, 0))
            
            if val1 == val2:
                score += 25  # Perfect match
            elif abs(val1 - val2) == 1:
                score += 15  # Close match
            elif abs(val1 - val2) <= 2:
                score += 10  # Some similarity
        
        return min(100, score)
