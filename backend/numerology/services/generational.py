"""
Generational Numerology service for family analysis and karmic contracts.
"""
from typing import Dict, List, Optional, Any, Tuple
from datetime import date
from django.db.models import Q
from numerology.models import Person, PersonNumerologyProfile, GenerationalAnalysis, KarmicContract
from numerology.numerology import NumerologyCalculator
import hashlib
import json


class GenerationalAnalyzer:
    """Service for analyzing generational numerology patterns."""
    
    def __init__(self, system: str = 'pythagorean'):
        """
        Initialize analyzer with numerology system.
        
        Args:
            system: 'pythagorean', 'chaldean', or 'vedic'
        """
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
    
    def calculate_family_generational_number(self, family_members: List[Person]) -> Dict[str, Any]:
        """
        Calculate generational number for a family unit.
        
        Args:
            family_members: List of Person objects representing family members
            
        Returns:
            Dictionary with generational_number and analysis
        """
        if not family_members:
            raise ValueError("At least one family member is required")
        
        # Get all life path numbers from family members
        life_path_numbers = []
        member_data = []
        
        for person in family_members:
            try:
                profile = PersonNumerologyProfile.objects.get(person=person)
                life_path = profile.life_path_number
                life_path_numbers.append(life_path)
                member_data.append({
                    'name': person.name,
                    'relationship': person.relationship,
                    'life_path': life_path,
                    'birth_date': person.birth_date.isoformat()
                })
            except PersonNumerologyProfile.DoesNotExist:
                # Calculate on the fly if profile doesn't exist
                calculator = NumerologyCalculator(system=self.system)
                life_path = calculator.calculate_life_path_number(person.birth_date)
                life_path_numbers.append(life_path)
                member_data.append({
                    'name': person.name,
                    'relationship': person.relationship,
                    'life_path': life_path,
                    'birth_date': person.birth_date.isoformat()
                })
        
        # Calculate generational number: sum of all life paths, reduced
        total = sum(life_path_numbers)
        generational_number = self.calculator._reduce_to_single_digit(total, preserve_master=True)
        
        # Analyze the generational number
        interpretation = self._interpret_generational_number(generational_number)
        
        # Calculate family dynamics
        dynamics = self._analyze_family_dynamics(life_path_numbers)
        
        return {
            'generational_number': generational_number,
            'member_data': member_data,
            'interpretation': interpretation,
            'family_dynamics': dynamics,
            'total_life_paths': total,
            'member_count': len(family_members)
        }
    
    def analyze_parent_child_karmic_contract(
        self,
        parent: Person,
        child: Person
    ) -> Dict[str, Any]:
        """
        Analyze karmic contract between parent and child.
        
        Args:
            parent: Parent Person object
            child: Child Person object
            
        Returns:
            Dictionary with karmic contract analysis
        """
        # Get numerology profiles
        try:
            parent_profile = PersonNumerologyProfile.objects.get(person=parent)
        except PersonNumerologyProfile.DoesNotExist:
            calculator = NumerologyCalculator(system=self.system)
            parent_profile = None
            parent_life_path = calculator.calculate_life_path_number(parent.birth_date)
        else:
            parent_life_path = parent_profile.life_path_number
        
        try:
            child_profile = PersonNumerologyProfile.objects.get(person=child)
        except PersonNumerologyProfile.DoesNotExist:
            calculator = NumerologyCalculator(system=self.system)
            child_profile = None
            child_life_path = calculator.calculate_life_path_number(child.birth_date)
        else:
            child_life_path = child_profile.life_path_number
        
        # Calculate compatibility
        compatibility_score = self._calculate_compatibility(parent_life_path, child_life_path)
        
        # Determine contract type
        contract_type = self._determine_contract_type(parent_life_path, child_life_path)
        
        # Identify karmic lessons
        karmic_lessons = self._identify_karmic_lessons(parent_life_path, child_life_path)
        
        # Generate insights
        insights = self._generate_karmic_insights(
            parent_life_path,
            child_life_path,
            contract_type,
            compatibility_score
        )
        
        return {
            'parent': {
                'name': parent.name,
                'life_path': parent_life_path,
                'birth_date': parent.birth_date.isoformat()
            },
            'child': {
                'name': child.name,
                'life_path': child_life_path,
                'birth_date': child.birth_date.isoformat()
            },
            'contract_type': contract_type,
            'compatibility_score': compatibility_score,
            'karmic_lessons': karmic_lessons,
            'insights': insights
        }
    
    def identify_generational_patterns(self, family_tree: List[Person]) -> Dict[str, Any]:
        """
        Identify patterns across generations.
        
        Args:
            family_tree: List of Person objects representing family members
            
        Returns:
            Dictionary with identified patterns
        """
        patterns = {
            'recurring_numbers': [],
            'missing_numbers': [],
            'master_numbers': [],
            'karmic_debt_numbers': [],
            'generation_gaps': [],
            'compatibility_clusters': []
        }
        
        # Collect all numerology data
        life_paths = []
        birth_years = []
        
        for person in family_tree:
            try:
                profile = PersonNumerologyProfile.objects.get(person=person)
                life_paths.append(profile.life_path_number)
            except PersonNumerologyProfile.DoesNotExist:
                calculator = NumerologyCalculator(system=self.system)
                life_path = calculator.calculate_life_path_number(person.birth_date)
                life_paths.append(life_path)
            
            birth_years.append(person.birth_date.year)
        
        # Find recurring numbers
        from collections import Counter
        number_counts = Counter(life_paths)
        patterns['recurring_numbers'] = [
            {'number': num, 'count': count}
            for num, count in number_counts.items()
            if count > 1
        ]
        
        # Find missing numbers (1-9)
        all_numbers = set(range(1, 10))
        present_numbers = set(life_paths)
        patterns['missing_numbers'] = list(all_numbers - present_numbers)
        
        # Find master numbers
        patterns['master_numbers'] = [
            num for num in life_paths if num in [11, 22, 33]
        ]
        
        # Find karmic debt numbers
        patterns['karmic_debt_numbers'] = [
            num for num in life_paths if num in [13, 14, 16, 19]
        ]
        
        # Analyze generation gaps
        if len(birth_years) > 1:
            birth_years.sort()
            gaps = [birth_years[i+1] - birth_years[i] for i in range(len(birth_years)-1)]
            patterns['generation_gaps'] = {
                'average': sum(gaps) / len(gaps) if gaps else 0,
                'min': min(gaps) if gaps else 0,
                'max': max(gaps) if gaps else 0
            }
        
        # Compatibility clusters
        patterns['compatibility_clusters'] = self._find_compatibility_clusters(life_paths)
        
        return patterns
    
    def generate_family_compatibility_matrix(self, family_members: List[Person]) -> Dict[str, Any]:
        """
        Generate compatibility matrix for all family members.
        
        Args:
            family_members: List of Person objects
            
        Returns:
            Dictionary with compatibility matrix
        """
        matrix = {}
        member_names = []
        
        # Get all life paths
        life_paths = {}
        for person in family_members:
            try:
                profile = PersonNumerologyProfile.objects.get(person=person)
                life_paths[person.id] = profile.life_path_number
            except PersonNumerologyProfile.DoesNotExist:
                calculator = NumerologyCalculator(system=self.system)
                life_paths[person.id] = calculator.calculate_life_path_number(person.birth_date)
            member_names.append(person.name)
        
        # Calculate compatibility between all pairs
        for i, person1 in enumerate(family_members):
            matrix[person1.name] = {}
            for j, person2 in enumerate(family_members):
                if i == j:
                    matrix[person1.name][person2.name] = 100  # Self-compatibility
                else:
                    score = self._calculate_compatibility(
                        life_paths[person1.id],
                        life_paths[person2.id]
                    )
                    matrix[person1.name][person2.name] = score
        
        return {
            'matrix': matrix,
            'member_names': member_names,
            'average_compatibility': self._calculate_average_compatibility(matrix)
        }
    
    def track_generational_cycles(self, family_members: List[Person], year: int) -> Dict[str, Any]:
        """
        Track numerology cycles for family unit in a given year.
        
        Args:
            family_members: List of Person objects
            year: Year to analyze
            
        Returns:
            Dictionary with cycle information
        """
        cycles = []
        
        for person in family_members:
            try:
                profile = PersonNumerologyProfile.objects.get(person=person)
            except PersonNumerologyProfile.DoesNotExist:
                continue
            
            # Calculate personal year for this person
            calculator = NumerologyCalculator(system=self.system)
            personal_year = calculator.calculate_personal_year_number(
                person.birth_date,
                year
            )
            
            cycles.append({
                'name': person.name,
                'relationship': person.relationship,
                'personal_year': personal_year,
                'life_path': profile.life_path_number
            })
        
        # Find synchronizations (same personal year numbers)
        from collections import Counter
        year_counts = Counter([c['personal_year'] for c in cycles])
        synchronizations = [
            {'year_number': year_num, 'members': [
                c['name'] for c in cycles if c['personal_year'] == year_num
            ]}
            for year_num, count in year_counts.items()
            if count > 1
        ]
        
        return {
            'year': year,
            'cycles': cycles,
            'synchronizations': synchronizations,
            'family_personal_year': self._calculate_family_personal_year(cycles)
        }
    
    def _interpret_generational_number(self, number: int) -> Dict[str, Any]:
        """Interpret generational number meaning."""
        interpretations = {
            1: {
                'theme': 'Leadership and Independence',
                'description': 'This family unit is driven by leadership, innovation, and independence. Members may be pioneers and trailblazers.',
                'strengths': ['Strong leadership', 'Innovation', 'Independence'],
                'challenges': ['Potential conflicts', 'Ego issues', 'Need for cooperation']
            },
            2: {
                'theme': 'Cooperation and Harmony',
                'description': 'This family values cooperation, diplomacy, and harmony. Members work well together.',
                'strengths': ['Cooperation', 'Diplomacy', 'Peaceful relationships'],
                'challenges': ['Indecisiveness', 'Dependency', 'Need for assertiveness']
            },
            3: {
                'theme': 'Creativity and Expression',
                'description': 'This family is creative, expressive, and joyful. Members enjoy communication and artistic pursuits.',
                'strengths': ['Creativity', 'Communication', 'Joy'],
                'challenges': ['Scattered energy', 'Superficiality', 'Need for focus']
            },
            4: {
                'theme': 'Stability and Structure',
                'description': 'This family values stability, structure, and hard work. Members are practical and reliable.',
                'strengths': ['Stability', 'Reliability', 'Practicality'],
                'challenges': ['Rigidity', 'Resistance to change', 'Need for flexibility']
            },
            5: {
                'theme': 'Freedom and Adventure',
                'description': 'This family seeks freedom, adventure, and change. Members are adaptable and curious.',
                'strengths': ['Adaptability', 'Adventure', 'Freedom'],
                'challenges': ['Restlessness', 'Lack of commitment', 'Need for stability']
            },
            6: {
                'theme': 'Nurturing and Responsibility',
                'description': 'This family is nurturing, responsible, and service-oriented. Members care deeply for each other.',
                'strengths': ['Nurturing', 'Responsibility', 'Service'],
                'challenges': ['Over-responsibility', 'Interference', 'Need for boundaries']
            },
            7: {
                'theme': 'Spirituality and Analysis',
                'description': 'This family values spirituality, analysis, and introspection. Members seek deeper meaning.',
                'strengths': ['Spirituality', 'Analysis', 'Wisdom'],
                'challenges': ['Isolation', 'Over-analysis', 'Need for connection']
            },
            8: {
                'theme': 'Material Success and Power',
                'description': 'This family focuses on material success, power, and achievement. Members are ambitious.',
                'strengths': ['Material success', 'Power', 'Achievement'],
                'challenges': ['Materialism', 'Power struggles', 'Need for balance']
            },
            9: {
                'theme': 'Humanitarianism and Completion',
                'description': 'This family is humanitarian, compassionate, and completion-oriented. Members serve the greater good.',
                'strengths': ['Humanitarianism', 'Compassion', 'Completion'],
                'challenges': ['Over-giving', 'Burnout', 'Need for self-care']
            },
            11: {
                'theme': 'Spiritual Leadership',
                'description': 'This family has strong spiritual leadership potential. Members may be teachers or healers.',
                'strengths': ['Spiritual leadership', 'Intuition', 'Inspiration'],
                'challenges': ['High expectations', 'Sensitivity', 'Need for grounding']
            },
            22: {
                'theme': 'Master Builder',
                'description': 'This family has the potential to build something great for humanity. Members are master builders.',
                'strengths': ['Master building', 'Practical spirituality', 'Large-scale impact'],
                'challenges': ['Overwhelming responsibility', 'Perfectionism', 'Need for balance']
            },
            33: {
                'theme': 'Master Teacher',
                'description': 'This family has the potential to teach and heal on a large scale. Members are master teachers.',
                'strengths': ['Master teaching', 'Healing', 'Universal love'],
                'challenges': ['Overwhelming responsibility', 'Self-sacrifice', 'Need for boundaries']
            }
        }
        
        return interpretations.get(number, {
            'theme': 'Unknown',
            'description': 'This generational number requires further analysis.',
            'strengths': [],
            'challenges': []
        })
    
    def _analyze_family_dynamics(self, life_paths: List[int]) -> Dict[str, Any]:
        """Analyze family dynamics based on life path numbers."""
        from collections import Counter
        
        # Count number frequencies
        number_counts = Counter(life_paths)
        
        # Calculate average
        avg_life_path = sum(life_paths) / len(life_paths) if life_paths else 0
        
        # Find dominant energy
        most_common = number_counts.most_common(1)[0] if number_counts else (0, 0)
        dominant_energy = most_common[0]
        
        # Analyze balance
        odd_count = sum(1 for n in life_paths if n % 2 == 1)
        even_count = len(life_paths) - odd_count
        
        return {
            'average_life_path': round(avg_life_path, 2),
            'dominant_energy': dominant_energy,
            'number_distribution': dict(number_counts),
            'balance': {
                'odd_numbers': odd_count,
                'even_numbers': even_count,
                'ratio': odd_count / even_count if even_count > 0 else float('inf')
            }
        }
    
    def _calculate_compatibility(self, number1: int, number2: int) -> int:
        """Calculate compatibility score between two numbers (0-100)."""
        # Reduce to single digits for comparison
        num1 = self.calculator._reduce_to_single_digit(number1, preserve_master=False)
        num2 = self.calculator._reduce_to_single_digit(number2, preserve_master=False)
        
        # Compatibility matrix (simplified)
        compatibility_matrix = {
            1: {1: 70, 2: 60, 3: 80, 4: 50, 5: 90, 6: 40, 7: 70, 8: 85, 9: 60},
            2: {1: 60, 2: 90, 3: 70, 4: 80, 5: 50, 6: 95, 7: 60, 8: 40, 9: 85},
            3: {1: 80, 2: 70, 3: 75, 4: 60, 5: 85, 6: 70, 7: 50, 8: 70, 9: 90},
            4: {1: 50, 2: 80, 3: 60, 4: 85, 5: 40, 6: 75, 7: 80, 8: 90, 9: 50},
            5: {1: 90, 2: 50, 3: 85, 4: 40, 5: 80, 6: 50, 7: 70, 8: 60, 9: 70},
            6: {1: 40, 2: 95, 3: 70, 4: 75, 5: 50, 6: 90, 7: 85, 8: 50, 9: 80},
            7: {1: 70, 2: 60, 3: 50, 4: 80, 5: 70, 6: 85, 7: 75, 8: 60, 9: 70},
            8: {1: 85, 2: 40, 3: 70, 4: 90, 5: 60, 6: 50, 7: 60, 8: 85, 9: 50},
            9: {1: 60, 2: 85, 3: 90, 4: 50, 5: 70, 6: 80, 7: 70, 8: 50, 9: 80}
        }
        
        score = compatibility_matrix.get(num1, {}).get(num2, 50)
        
        # Adjust for master numbers
        if number1 in [11, 22, 33] or number2 in [11, 22, 33]:
            score += 5  # Slight boost for master numbers
        
        return min(100, max(0, score))
    
    def _determine_contract_type(self, parent_life_path: int, child_life_path: int) -> str:
        """Determine the type of karmic contract."""
        parent_num = self.calculator._reduce_to_single_digit(parent_life_path, preserve_master=False)
        child_num = self.calculator._reduce_to_single_digit(child_life_path, preserve_master=False)
        
        # Teaching contract: parent has higher number, child has lower
        if parent_num > child_num:
            return 'teaching'
        
        # Learning contract: child has higher number, parent has lower
        if child_num > parent_num:
            return 'learning'
        
        # Healing contract: complementary numbers
        healing_pairs = [(1, 9), (2, 8), (3, 7), (4, 6), (5, 5)]
        if (parent_num, child_num) in healing_pairs or (child_num, parent_num) in healing_pairs:
            return 'healing'
        
        # Karmic debt: if either has karmic debt number
        if parent_life_path in [13, 14, 16, 19] or child_life_path in [13, 14, 16, 19]:
            return 'karmic_debt'
        
        # Same number: soul evolution
        if parent_num == child_num:
            return 'soul_evolution'
        
        return 'neutral'
    
    def _identify_karmic_lessons(self, parent_life_path: int, child_life_path: int) -> List[str]:
        """Identify karmic lessons to be learned."""
        lessons = []
        
        parent_num = self.calculator._reduce_to_single_digit(parent_life_path, preserve_master=False)
        child_num = self.calculator._reduce_to_single_digit(child_life_path, preserve_master=False)
        
        # Lesson based on number differences
        if abs(parent_num - child_num) >= 4:
            lessons.append("Learn to bridge generational differences")
        
        if parent_num == 1 and child_num != 1:
            lessons.append("Parent teaches independence, child learns to lead")
        
        if child_num == 1 and parent_num != 1:
            lessons.append("Child teaches independence, parent learns to let go")
        
        if parent_num == 6 or child_num == 6:
            lessons.append("Learn balance between responsibility and freedom")
        
        if parent_num == 7 or child_num == 7:
            lessons.append("Learn to balance spirituality with practical life")
        
        if parent_num == 8 or child_num == 8:
            lessons.append("Learn balance between material success and relationships")
        
        if parent_num == 9 or child_num == 9:
            lessons.append("Learn to balance giving to others with self-care")
        
        return lessons if lessons else ["Learn to understand and respect each other's differences"]
    
    def _generate_karmic_insights(
        self,
        parent_life_path: int,
        child_life_path: int,
        contract_type: str,
        compatibility_score: int
    ) -> Dict[str, Any]:
        """Generate insights about the karmic relationship."""
        insights = {
            'relationship_dynamic': '',
            'challenges': [],
            'opportunities': [],
            'recommendations': []
        }
        
        if contract_type == 'teaching':
            insights['relationship_dynamic'] = 'Parent is the teacher, child is the student'
            insights['challenges'] = ['Parent may be too controlling', 'Child may resist learning']
            insights['opportunities'] = ['Parent can share wisdom', 'Child can learn valuable lessons']
            insights['recommendations'] = [
                'Parent: Be patient and allow child to learn at their own pace',
                'Child: Be open to receiving guidance and wisdom'
            ]
        elif contract_type == 'learning':
            insights['relationship_dynamic'] = 'Child is the teacher, parent is the student'
            insights['challenges'] = ['Parent may struggle with authority reversal', 'Child may be too independent']
            insights['opportunities'] = ['Parent can learn new perspectives', 'Child can teach valuable lessons']
            insights['recommendations'] = [
                'Parent: Be open to learning from your child',
                'Child: Respect your parent while sharing your wisdom'
            ]
        elif contract_type == 'healing':
            insights['relationship_dynamic'] = 'This relationship has healing potential'
            insights['challenges'] = ['May trigger old wounds', 'Requires vulnerability']
            insights['opportunities'] = ['Can heal generational patterns', 'Can create deep connection']
            insights['recommendations'] = [
                'Both: Be open to healing and transformation',
                'Practice forgiveness and understanding'
            ]
        else:
            insights['relationship_dynamic'] = 'Balanced relationship with mutual respect'
            insights['challenges'] = ['May lack depth', 'May need more connection']
            insights['opportunities'] = ['Can develop deeper bond', 'Can learn from each other']
            insights['recommendations'] = [
                'Both: Invest time in understanding each other',
                'Create shared experiences and memories'
            ]
        
        # Add compatibility-based insights
        if compatibility_score >= 80:
            insights['opportunities'].append('High compatibility - great potential for harmony')
        elif compatibility_score < 50:
            insights['challenges'].append('Lower compatibility - requires extra effort and understanding')
        
        return insights
    
    def _find_compatibility_clusters(self, life_paths: List[int]) -> List[Dict[str, Any]]:
        """Find groups of compatible numbers."""
        clusters = []
        processed = set()
        
        for i, num1 in enumerate(life_paths):
            if i in processed:
                continue
            
            cluster = [i]
            for j, num2 in enumerate(life_paths[i+1:], start=i+1):
                if j in processed:
                    continue
                
                compatibility = self._calculate_compatibility(num1, num2)
                if compatibility >= 75:  # High compatibility threshold
                    cluster.append(j)
                    processed.add(j)
            
            if len(cluster) > 1:
                clusters.append({
                    'members': cluster,
                    'average_compatibility': sum(
                        self._calculate_compatibility(life_paths[cluster[0]], life_paths[m])
                        for m in cluster[1:]
                    ) / (len(cluster) - 1) if len(cluster) > 1 else 100
                })
            
            processed.add(i)
        
        return clusters
    
    def _calculate_average_compatibility(self, matrix: Dict[str, Dict[str, int]]) -> float:
        """Calculate average compatibility from matrix."""
        total = 0
        count = 0
        
        for person1, compatibilities in matrix.items():
            for person2, score in compatibilities.items():
                if person1 != person2:  # Exclude self-compatibility
                    total += score
                    count += 1
        
        return total / count if count > 0 else 0
    
    def _calculate_family_personal_year(self, cycles: List[Dict[str, Any]]) -> int:
        """Calculate family's collective personal year."""
        if not cycles:
            return 0
        
        # Sum all personal years and reduce
        total = sum(c['personal_year'] for c in cycles)
        return self.calculator._reduce_to_single_digit(total, preserve_master=True)
    
    @staticmethod
    def generate_family_unit_hash(person_ids: List[str]) -> str:
        """Generate hash for family unit identification."""
        sorted_ids = sorted(person_ids)
        combined = ''.join(sorted_ids)
        return hashlib.sha256(combined.encode()).hexdigest()

