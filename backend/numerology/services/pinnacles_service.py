"""
Pinnacles and Challenges service for numerology.
Provides detailed analysis, timelines, and interpretations.
"""
from typing import Dict, Any, List
from datetime import date, datetime
from numerology.numerology import NumerologyCalculator


class PinnaclesService:
    """Service for analyzing pinnacles and challenges."""
    
    def __init__(self, calculation_system: str = 'pythagorean'):
        self.calculator = NumerologyCalculator(calculation_system)
    
    def calculate_pinnacle_ages(self, birth_date: date) -> Dict[str, Any]:
        """
        Calculate age ranges for each pinnacle.
        
        Pinnacle durations are based on Life Path number:
        - Life Path 1-9: 9 years each (36 years total)
        - Life Path 11, 22, 33: 9 years each (36 years total)
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Dictionary with pinnacle ages and details
        """
        life_path = self.calculator.calculate_life_path_number(birth_date)
        pinnacles = self.calculator.calculate_pinnacles(birth_date)
        
        # Calculate age ranges
        # Pinnacle 1: 0-36 (or until Life Path + 36)
        # Pinnacle 2: 36-45 (or Life Path + 36 to Life Path + 45)
        # Pinnacle 3: 45-54 (or Life Path + 45 to Life Path + 54)
        # Pinnacle 4: 54+ (or Life Path + 54 onwards)
        
        # Standard calculation (simplified)
        pinnacle_ages = [
            {'pinnacle': 1, 'number': pinnacles[0], 'start_age': 0, 'end_age': 36},
            {'pinnacle': 2, 'number': pinnacles[1], 'start_age': 36, 'end_age': 45},
            {'pinnacle': 3, 'number': pinnacles[2], 'start_age': 45, 'end_age': 54},
            {'pinnacle': 4, 'number': pinnacles[3], 'start_age': 54, 'end_age': None},
        ]
        
        # Calculate current pinnacle
        today = date.today()
        age = (today - birth_date).days // 365
        
        current_pinnacle = None
        for p in pinnacle_ages:
            if p['end_age'] is None:
                if age >= p['start_age']:
                    current_pinnacle = p
                    break
            elif p['start_age'] <= age < p['end_age']:
                current_pinnacle = p
                break
        
        return {
            'life_path': life_path,
            'pinnacles': pinnacle_ages,
            'current_age': age,
            'current_pinnacle': current_pinnacle['pinnacle'] if current_pinnacle else 4,
            'current_pinnacle_number': current_pinnacle['number'] if current_pinnacle else pinnacles[3],
            'next_transition_age': self._get_next_transition_age(age, pinnacle_ages)
        }
    
    def get_pinnacle_interpretation(self, pinnacle_number: int, pinnacle_index: int) -> Dict[str, Any]:
        """
        Get detailed interpretation for a pinnacle.
        
        Args:
            pinnacle_number: The pinnacle number (1-9, or master numbers)
            pinnacle_index: Which pinnacle (1-4)
            
        Returns:
            Dictionary with detailed interpretation
        """
        interpretations = {
            1: {
                'title': 'Leadership and Independence',
                'strengths': [
                    'Natural leadership abilities',
                    'Strong independence and self-reliance',
                    'Pioneering spirit and innovation',
                    'Ability to initiate and create',
                    'Confidence and assertiveness'
                ],
                'opportunities': [
                    'Starting new projects or businesses',
                    'Taking on leadership roles',
                    'Making important life decisions',
                    'Building your own path',
                    'Expressing your unique identity'
                ],
                'challenges': [
                    'Avoiding arrogance or ego issues',
                    'Learning to work with others',
                    'Balancing independence with cooperation',
                    'Managing impatience',
                    'Avoiding isolation'
                ],
                'guidance': 'This is a time to step forward as a leader. Trust your instincts, take initiative, and don\'t be afraid to stand alone when necessary. However, remember that true leadership involves listening to others and considering their perspectives.'
            },
            2: {
                'title': 'Cooperation and Partnership',
                'strengths': [
                    'Diplomatic skills',
                    'Strong intuition',
                    'Ability to work in partnerships',
                    'Patience and understanding',
                    'Emotional sensitivity'
                ],
                'opportunities': [
                    'Building strong partnerships',
                    'Mediating conflicts',
                    'Creating harmony in relationships',
                    'Developing intuitive abilities',
                    'Collaborative projects'
                ],
                'challenges': [
                    'Avoiding excessive dependence',
                    'Setting healthy boundaries',
                    'Overcoming indecisiveness',
                    'Managing oversensitivity',
                    'Avoiding people-pleasing'
                ],
                'guidance': 'This is a time for cooperation and partnership. Focus on building relationships, creating harmony, and working with others. Trust your intuition, but also maintain your own sense of self and set healthy boundaries.'
            },
            3: {
                'title': 'Creativity and Expression',
                'strengths': [
                    'Creative expression',
                    'Communication skills',
                    'Optimism and joy',
                    'Social abilities',
                    'Artistic talents'
                ],
                'opportunities': [
                    'Expressing creativity',
                    'Social networking',
                    'Communication and writing',
                    'Artistic pursuits',
                    'Sharing ideas and inspiration'
                ],
                'challenges': [
                    'Avoiding scattered energy',
                    'Managing superficiality',
                    'Controlling spending',
                    'Focusing on serious responsibilities',
                    'Avoiding gossip'
                ],
                'guidance': 'This is a time for creative expression and communication. Share your ideas, express yourself artistically, and bring joy to others. However, be mindful not to scatter your energy too thin or neglect important responsibilities.'
            },
            4: {
                'title': 'Stability and Building',
                'strengths': [
                    'Practical skills',
                    'Discipline and organization',
                    'Reliability',
                    'Building and construction',
                    'Systematic approach'
                ],
                'opportunities': [
                    'Building solid foundations',
                    'Organizing and structuring',
                    'Completing projects',
                    'Financial planning',
                    'Creating stability'
                ],
                'challenges': [
                    'Avoiding rigidity',
                    'Staying open to new methods',
                    'Preventing overwork',
                    'Balancing work and life',
                    'Avoiding excessive criticism'
                ],
                'guidance': 'This is a time for building and creating stability. Focus on practical matters, organize your life, and build solid foundations for your future. Be disciplined, but also remain flexible and open to new approaches.'
            },
            5: {
                'title': 'Freedom and Change',
                'strengths': [
                    'Adaptability',
                    'Freedom-loving nature',
                    'Curiosity and exploration',
                    'Communication skills',
                    'Versatility'
                ],
                'opportunities': [
                    'Embracing change',
                    'Exploring new experiences',
                    'Travel and adventure',
                    'Learning new skills',
                    'Breaking free from limitations'
                ],
                'challenges': [
                    'Avoiding restlessness',
                    'Maintaining commitments',
                    'Preventing impulsiveness',
                    'Balancing freedom with responsibility',
                    'Avoiding overindulgence'
                ],
                'guidance': 'This is a time for change and freedom. Embrace new experiences, explore different possibilities, and break free from limitations. However, be mindful not to become too scattered or avoid necessary commitments.'
            },
            6: {
                'title': 'Love and Responsibility',
                'strengths': [
                    'Nurturing abilities',
                    'Love and compassion',
                    'Responsibility',
                    'Creating beauty',
                    'Service to others'
                ],
                'opportunities': [
                    'Strengthening relationships',
                    'Creating harmony at home',
                    'Serving others',
                    'Beautifying your environment',
                    'Taking on responsibilities'
                ],
                'challenges': [
                    'Avoiding excessive responsibility',
                    'Setting boundaries',
                    'Preventing martyrdom',
                    'Balancing giving and receiving',
                    'Avoiding being overly controlling'
                ],
                'guidance': 'This is a time for love, responsibility, and service. Focus on relationships, create beauty in your environment, and help others. However, remember to take care of yourself and set healthy boundaries.'
            },
            7: {
                'title': 'Spirituality and Wisdom',
                'strengths': [
                    'Spiritual awareness',
                    'Analytical thinking',
                    'Intuition and inner wisdom',
                    'Seeking truth',
                    'Introspection'
                ],
                'opportunities': [
                    'Spiritual growth',
                    'Study and research',
                    'Developing intuition',
                    'Seeking deeper understanding',
                    'Inner reflection'
                ],
                'challenges': [
                    'Avoiding excessive isolation',
                    'Sharing insights with others',
                    'Preventing over-analysis',
                    'Balancing solitude and social connection',
                    'Avoiding perfectionism'
                ],
                'guidance': 'This is a time for spiritual growth and inner wisdom. Focus on introspection, study, and developing your intuition. However, remember to share your insights with others and maintain connections with the world.'
            },
            8: {
                'title': 'Material Success and Power',
                'strengths': [
                    'Business acumen',
                    'Leadership abilities',
                    'Material success',
                    'Organizational skills',
                    'Authority and power'
                ],
                'opportunities': [
                    'Career advancement',
                    'Financial success',
                    'Building businesses',
                    'Taking on leadership roles',
                    'Material achievement'
                ],
                'challenges': [
                    'Balancing work and relationships',
                    'Using power wisely',
                    'Avoiding materialism',
                    'Preventing workaholism',
                    'Avoiding ruthless behavior'
                ],
                'guidance': 'This is a time for material success and achievement. Focus on your career, build your financial resources, and take on leadership roles. However, remember to balance work with relationships and use your power wisely and ethically.'
            },
            9: {
                'title': 'Completion and Service',
                'strengths': [
                    'Compassion',
                    'Wisdom',
                    'Humanitarianism',
                    'Universal love',
                    'Completion'
                ],
                'opportunities': [
                    'Serving others',
                    'Completing projects',
                    'Sharing wisdom',
                    'Letting go of the past',
                    'Universal service'
                ],
                'challenges': [
                    'Avoiding martyrdom',
                    'Setting boundaries in giving',
                    'Letting go of what\'s finished',
                    'Balancing service with self-care',
                    'Avoiding emotional manipulation'
                ],
                'guidance': 'This is a time for completion and service. Focus on helping others, sharing your wisdom, and letting go of what no longer serves you. However, remember to set healthy boundaries and take care of yourself.'
            },
        }
        
        base_interpretation = interpretations.get(pinnacle_number, {
            'title': f'Pinnacle {pinnacle_number}',
            'strengths': [],
            'opportunities': [],
            'challenges': [],
            'guidance': f'This pinnacle brings the energy of number {pinnacle_number}.'
        })
        
        # Add pinnacle-specific context
        pinnacle_names = {
            1: 'First Pinnacle',
            2: 'Second Pinnacle',
            3: 'Third Pinnacle',
            4: 'Fourth Pinnacle'
        }
        
        return {
            **base_interpretation,
            'pinnacle_name': pinnacle_names.get(pinnacle_index, f'Pinnacle {pinnacle_index}'),
            'pinnacle_index': pinnacle_index,
            'pinnacle_number': pinnacle_number
        }
    
    def analyze_pinnacle_transitions(self, birth_date: date) -> Dict[str, Any]:
        """
        Analyze transitions between pinnacles.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Dictionary with transition analysis
        """
        pinnacle_ages = self.calculate_pinnacle_ages(birth_date)
        transitions = []
        
        for i, pinnacle in enumerate(pinnacle_ages['pinnacles']):
            if i < len(pinnacle_ages['pinnacles']) - 1:
                next_pinnacle = pinnacle_ages['pinnacles'][i + 1]
                transition_age = pinnacle['end_age']
                
                transitions.append({
                    'from_pinnacle': pinnacle['pinnacle'],
                    'from_number': pinnacle['number'],
                    'to_pinnacle': next_pinnacle['pinnacle'],
                    'to_number': next_pinnacle['number'],
                    'transition_age': transition_age,
                    'warning': f'Major life transition at age {transition_age}',
                    'guidance': self._get_transition_guidance(pinnacle['number'], next_pinnacle['number'])
                })
        
        return {
            'transitions': transitions,
            'transition_count': len(transitions),
            'upcoming_transitions': [t for t in transitions if t['transition_age'] > pinnacle_ages['current_age']]
        }
    
    def get_challenge_remedies(self, challenge_number: int) -> Dict[str, Any]:
        """
        Get remedies and solutions for challenges.
        
        Args:
            challenge_number: The challenge number (0-9)
            
        Returns:
            Dictionary with remedies and guidance
        """
        remedies = {
            0: {
                'meaning': 'No challenge - smooth period',
                'remedy': 'Enjoy this harmonious time. Focus on growth and development without major obstacles.',
                'actions': ['Maintain balance', 'Continue positive habits', 'Use this time for planning']
            },
            1: {
                'meaning': 'Challenge with independence and leadership',
                'remedy': 'Learn to balance independence with cooperation. Practice patience and avoid being overly aggressive.',
                'actions': ['Practice humility', 'Learn to work with others', 'Develop patience', 'Avoid ego-driven decisions']
            },
            2: {
                'meaning': 'Challenge with cooperation and sensitivity',
                'remedy': 'Develop self-confidence and learn to set boundaries. Avoid excessive dependence on others.',
                'actions': ['Build self-confidence', 'Set healthy boundaries', 'Practice assertiveness', 'Avoid people-pleasing']
            },
            3: {
                'meaning': 'Challenge with expression and creativity',
                'remedy': 'Focus your creative energy and avoid scattering. Learn to balance fun with responsibility.',
                'actions': ['Focus your energy', 'Complete creative projects', 'Balance fun and work', 'Avoid superficiality']
            },
            4: {
                'meaning': 'Challenge with stability and structure',
                'remedy': 'Learn flexibility while maintaining discipline. Avoid becoming too rigid or resistant to change.',
                'actions': ['Stay flexible', 'Embrace necessary changes', 'Avoid rigidity', 'Balance structure with adaptability']
            },
            5: {
                'meaning': 'Challenge with freedom and change',
                'remedy': 'Learn to commit while maintaining freedom. Balance adventure with responsibility.',
                'actions': ['Honor commitments', 'Balance freedom and responsibility', 'Avoid impulsiveness', 'Practice moderation']
            },
            6: {
                'meaning': 'Challenge with responsibility and service',
                'remedy': 'Learn to balance giving with receiving. Set boundaries and avoid taking on too much.',
                'actions': ['Set boundaries', 'Balance giving and receiving', 'Avoid martyrdom', 'Take care of yourself']
            },
            7: {
                'meaning': 'Challenge with spirituality and analysis',
                'remedy': 'Balance introspection with action. Share your insights and avoid excessive isolation.',
                'actions': ['Share your wisdom', 'Balance solitude and connection', 'Avoid over-analysis', 'Take practical action']
            },
            8: {
                'meaning': 'Challenge with material success and power',
                'remedy': 'Use power wisely and ethically. Balance material success with relationships and health.',
                'actions': ['Use power ethically', 'Balance work and relationships', 'Avoid materialism', 'Maintain integrity']
            },
            9: {
                'meaning': 'Challenge with completion and service',
                'remedy': 'Learn to let go and set boundaries in service. Balance compassion with practical wisdom.',
                'actions': ['Let go of the past', 'Set boundaries in giving', 'Avoid martyrdom', 'Balance service and self-care']
            },
        }
        
        return remedies.get(challenge_number, {
            'meaning': f'Challenge with number {challenge_number}',
            'remedy': 'Focus on developing the positive aspects of this number while addressing its challenges.',
            'actions': ['Self-reflection', 'Personal growth', 'Seeking guidance']
        })
    
    def compare_pinnacles(self, birth_date1: date, birth_date2: date) -> Dict[str, Any]:
        """
        Compare pinnacles between two people.
        
        Args:
            birth_date1: First person's birth date
            birth_date2: Second person's birth date
            
        Returns:
            Dictionary with comparison analysis
        """
        pinnacles1 = self.calculator.calculate_pinnacles(birth_date1)
        pinnacles2 = self.calculator.calculate_pinnacles(birth_date2)
        
        matches = []
        for i, (p1, p2) in enumerate(zip(pinnacles1, pinnacles2)):
            if p1 == p2:
                matches.append({
                    'pinnacle': i + 1,
                    'number': p1,
                    'match': True
                })
            else:
                matches.append({
                    'pinnacle': i + 1,
                    'number1': p1,
                    'number2': p2,
                    'match': False
                })
        
        return {
            'person1_pinnacles': pinnacles1,
            'person2_pinnacles': pinnacles2,
            'matches': matches,
            'match_count': sum(1 for m in matches if m['match']),
            'analysis': self._generate_comparison_analysis(matches)
        }
    
    def _get_next_transition_age(self, current_age: int, pinnacle_ages: List[Dict]) -> int:
        """Get the age of the next pinnacle transition."""
        for p in pinnacle_ages:
            if p['end_age'] and current_age < p['end_age']:
                return p['end_age']
        return None
    
    def _get_transition_guidance(self, from_number: int, to_number: int) -> str:
        """Get guidance for pinnacle transitions."""
        return f"Transitioning from Pinnacle {from_number} to Pinnacle {to_number}. This is a major life cycle change. Prepare for new opportunities and challenges aligned with Pinnacle {to_number} energy. Take time to reflect on lessons learned and set intentions for the new cycle."
    
    def _generate_comparison_analysis(self, matches: List[Dict]) -> str:
        """Generate analysis text for pinnacle comparison."""
        match_count = sum(1 for m in matches if m['match'])
        
        if match_count >= 3:
            return "Strong pinnacle alignment - you share similar life cycle energies and will experience similar themes during your pinnacle periods."
        elif match_count >= 2:
            return "Good pinnacle alignment - you have some shared life cycle experiences that will create understanding between you."
        elif match_count >= 1:
            return "Some pinnacle alignment - you'll experience some similar themes, but also have different life cycle focuses."
        else:
            return "Different pinnacle patterns - you'll experience different life cycle themes, which can create both challenges and opportunities for growth."

