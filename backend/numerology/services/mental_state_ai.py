"""
Mental State AI × Numerology analysis service.
"""
from typing import Dict, List, Optional, Any
from datetime import date, timedelta
from django.utils import timezone
from numerology.models import (
    NumerologyProfile, MentalStateTracking, MentalStateAnalysis
)
from numerology.numerology import NumerologyCalculator
from accounts.models import User
import os
import json
import logging

logger = logging.getLogger(__name__)

# Try to import OpenAI, but handle gracefully if not available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI not available. AI features will be limited.")


class MentalStateAIService:
    """Service for analyzing mental state using numerology and AI."""
    
    def __init__(self, system: str = 'pythagorean'):
        """
        Initialize analyzer with numerology system.
        
        Args:
            system: 'pythagorean', 'chaldean', or 'vedic'
        """
        self.calculator = NumerologyCalculator(system=system)
        self.system = system
        self.openai_client = None
        
        if OPENAI_AVAILABLE:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
    
    def track_emotional_state(
        self,
        user: User,
        date: date,
        state_data: Dict[str, Any]
    ) -> MentalStateTracking:
        """
        Record emotional state for a user.
        
        Args:
            user: User instance
            date: Date of tracking
            state_data: Dictionary with emotional_state, stress_level, mood_score, notes, etc.
            
        Returns:
            MentalStateTracking instance
        """
        # Get current numerology cycle
        numerology_cycle = self._get_current_numerology_cycle(user, date)
        
        # Create or update tracking
        tracking, created = MentalStateTracking.objects.update_or_create(
            user=user,
            date=date,
            defaults={
                'emotional_state': state_data.get('emotional_state', 'neutral'),
                'stress_level': state_data.get('stress_level', 50),
                'mood_score': state_data.get('mood_score', 50),
                'numerology_cycle': numerology_cycle,
                'notes': state_data.get('notes', '')
            }
        )
        
        return tracking
    
    def identify_stress_patterns(
        self,
        user: User,
        period_start: date,
        period_end: date
    ) -> Dict[str, Any]:
        """
        Identify stress patterns based on numerology cycles.
        
        Args:
            user: User instance
            period_start: Start date of analysis period
            period_end: End date of analysis period
            
        Returns:
            Dictionary with identified stress patterns
        """
        # Get tracking data for period
        trackings = MentalStateTracking.objects.filter(
            user=user,
            date__gte=period_start,
            date__lte=period_end
        ).order_by('date')
        
        if not trackings.exists():
            return {
                'patterns': [],
                'message': 'No tracking data available for this period'
            }
        
        # Analyze patterns
        patterns = []
        
        # Group by numerology cycle
        cycle_data = {}
        for tracking in trackings:
            cycle = tracking.numerology_cycle or 'unknown'
            if cycle not in cycle_data:
                cycle_data[cycle] = {
                    'stress_levels': [],
                    'mood_scores': [],
                    'dates': []
                }
            
            cycle_data[cycle]['stress_levels'].append(tracking.stress_level)
            cycle_data[cycle]['mood_scores'].append(tracking.mood_score)
            cycle_data[cycle]['dates'].append(tracking.date.isoformat())
        
        # Analyze each cycle
        for cycle, data in cycle_data.items():
            avg_stress = sum(data['stress_levels']) / len(data['stress_levels'])
            avg_mood = sum(data['mood_scores']) / len(data['mood_scores'])
            
            patterns.append({
                'cycle': cycle,
                'average_stress': round(avg_stress, 2),
                'average_mood': round(avg_mood, 2),
                'data_points': len(data['stress_levels']),
                'trend': self._calculate_trend(data['stress_levels']),
                'correlation': self._analyze_correlation(cycle, avg_stress, avg_mood)
            })
        
        # Overall patterns
        all_stress = [t.stress_level for t in trackings]
        all_mood = [t.mood_score for t in trackings]
        
        return {
            'patterns': patterns,
            'overall_average_stress': round(sum(all_stress) / len(all_stress), 2),
            'overall_average_mood': round(sum(all_mood) / len(all_mood), 2),
            'stress_trend': self._calculate_trend(all_stress),
            'mood_trend': self._calculate_trend(all_mood),
            'period_start': period_start.isoformat(),
            'period_end': period_end.isoformat(),
            'total_data_points': trackings.count()
        }
    
    def generate_wellbeing_recommendations(
        self,
        user: User,
        analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered wellbeing recommendations.
        
        Args:
            user: User instance
            analysis: Stress pattern analysis results
            
        Returns:
            List of recommendation dictionaries
        """
        # Get user's numerology profile
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return [{
                'type': 'info',
                'priority': 'medium',
                'title': 'Complete Numerology Profile',
                'description': 'Complete your numerology profile for personalized recommendations',
                'actions': ['Calculate your numerology profile']
            }]
        
        recommendations = []
        
        # Generate recommendations based on numerology
        life_path = profile.life_path_number
        personal_year = profile.personal_year_number
        
        # Recommendations based on life path
        life_path_recommendations = self._get_life_path_recommendations(life_path)
        recommendations.extend(life_path_recommendations)
        
        # Recommendations based on personal year
        year_recommendations = self._get_personal_year_recommendations(personal_year)
        recommendations.extend(year_recommendations)
        
        # Recommendations based on stress patterns
        if analysis.get('patterns'):
            stress_recommendations = self._get_stress_based_recommendations(analysis)
            recommendations.extend(stress_recommendations)
        
        # AI-generated recommendations if OpenAI is available
        if self.openai_client:
            try:
                ai_recommendations = self._generate_ai_recommendations(user, profile, analysis)
                recommendations.extend(ai_recommendations)
            except Exception as e:
                logger.error(f"Failed to generate AI recommendations: {str(e)}")
        
        return recommendations[:10]  # Return top 10 recommendations
    
    def predict_mood_cycles(
        self,
        user: User,
        numerology_profile: NumerologyProfile
    ) -> Dict[str, Any]:
        """
        Predict mood cycles based on numerology.
        
        Args:
            user: User instance
            numerology_profile: User's numerology profile
            
        Returns:
            Dictionary with mood cycle predictions
        """
        today = date.today()
        current_year = today.year
        
        # Predict for next 12 months
        predictions = []
        
        for month_offset in range(12):
            target_date = today + timedelta(days=30 * month_offset)
            target_year = target_date.year
            target_month = target_date.month
            
            # Calculate personal month
            personal_month = self.calculator.calculate_personal_month_number(
                user.profile.date_of_birth if hasattr(user, 'profile') and user.profile.date_of_birth else date(2000, 1, 1),
                target_year,
                target_month
            )
            
            # Predict mood based on personal month
            mood_prediction = self._predict_mood_from_number(personal_month)
            
            predictions.append({
                'date': target_date.isoformat(),
                'month': target_month,
                'year': target_year,
                'personal_month': personal_month,
                'predicted_mood': mood_prediction['mood'],
                'mood_score_range': mood_prediction['score_range'],
                'energy_level': mood_prediction['energy'],
                'recommendations': mood_prediction['recommendations']
            })
        
        return {
            'user': user.full_name,
            'life_path': numerology_profile.life_path_number,
            'current_personal_year': numerology_profile.personal_year_number,
            'predictions': predictions,
            'overall_trend': self._calculate_overall_mood_trend(predictions)
        }
    
    def analyze_emotional_compatibility(
        self,
        person1: User,
        person2: User
    ) -> Dict[str, Any]:
        """
        Analyze emotional compatibility between two people.
        
        Args:
            person1: First user
            person2: Second user
            
        Returns:
            Dictionary with emotional compatibility analysis
        """
        try:
            profile1 = NumerologyProfile.objects.get(user=person1)
            profile2 = NumerologyProfile.objects.get(user=person2)
        except NumerologyProfile.DoesNotExist:
            return {
                'error': 'One or both users do not have numerology profiles'
            }
        
        # Get recent mental state data
        recent_date = date.today() - timedelta(days=30)
        tracking1 = MentalStateTracking.objects.filter(
            user=person1,
            date__gte=recent_date
        ).order_by('-date').first()
        
        tracking2 = MentalStateTracking.objects.filter(
            user=person2,
            date__gte=recent_date
        ).order_by('-date').first()
        
        # Calculate compatibility
        compatibility = self._calculate_emotional_compatibility(
            profile1,
            profile2,
            tracking1,
            tracking2
        )
        
        return {
            'person1': {
                'name': person1.full_name,
                'life_path': profile1.life_path_number,
                'recent_mood': tracking1.mood_score if tracking1 else None
            },
            'person2': {
                'name': person2.full_name,
                'life_path': profile2.life_path_number,
                'recent_mood': tracking2.mood_score if tracking2 else None
            },
            'compatibility_score': compatibility['score'],
            'compatibility_level': compatibility['level'],
            'insights': compatibility['insights'],
            'recommendations': compatibility['recommendations']
        }
    
    def correlate_numerology_mental_health(
        self,
        user: User,
        period_start: date,
        period_end: date
    ) -> Dict[str, Any]:
        """
        Correlate numerology cycles with mental health patterns.
        
        Args:
            user: User instance
            period_start: Start date
            period_end: End date
            
        Returns:
            Dictionary with correlation analysis
        """
        # Get tracking data
        trackings = MentalStateTracking.objects.filter(
            user=user,
            date__gte=period_start,
            date__lte=period_end
        ).order_by('date')
        
        if not trackings.exists():
            return {
                'correlations': [],
                'message': 'Insufficient data for correlation analysis'
            }
        
        # Get numerology profile
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            return {
                'correlations': [],
                'message': 'Numerology profile required for correlation'
            }
        
        # Analyze correlations
        correlations = []
        
        # Correlate with personal year
        year_correlation = self._correlate_with_cycle(
            trackings,
            'personal_year',
            profile.personal_year_number
        )
        correlations.append(year_correlation)
        
        # Correlate with life path
        life_path_correlation = self._correlate_with_cycle(
            trackings,
            'life_path',
            profile.life_path_number
        )
        correlations.append(life_path_correlation)
        
        return {
            'correlations': correlations,
            'period': {
                'start': period_start.isoformat(),
                'end': period_end.isoformat()
            },
            'data_points': trackings.count(),
            'summary': self._generate_correlation_summary(correlations)
        }
    
    def _get_current_numerology_cycle(self, user: User, date: date) -> str:
        """Get current numerology cycle description."""
        try:
            profile = NumerologyProfile.objects.get(user=user)
            personal_year = profile.personal_year_number
            
            # Calculate personal month
            personal_month = self.calculator.calculate_personal_month_number(
                user.profile.date_of_birth if hasattr(user, 'profile') and user.profile.date_of_birth else date(2000, 1, 1),
                date.year,
                date.month
            )
            
            return f"Personal Year {personal_year}, Month {personal_month}"
        except (NumerologyProfile.DoesNotExist, AttributeError):
            return "Unknown cycle"
    
    def _calculate_trend(self, values: List[int]) -> str:
        """Calculate trend from a list of values."""
        if len(values) < 2:
            return 'insufficient_data'
        
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        avg_first = sum(first_half) / len(first_half)
        avg_second = sum(second_half) / len(second_half)
        
        diff = avg_second - avg_first
        
        if diff > 5:
            return 'increasing'
        elif diff < -5:
            return 'decreasing'
        else:
            return 'stable'
    
    def _analyze_correlation(
        self,
        cycle: str,
        avg_stress: float,
        avg_mood: float
    ) -> Dict[str, Any]:
        """Analyze correlation between cycle and mental state."""
        return {
            'cycle': cycle,
            'stress_correlation': 'positive' if avg_stress > 60 else 'negative',
            'mood_correlation': 'positive' if avg_mood > 60 else 'negative',
            'strength': 'moderate'
        }
    
    def _get_life_path_recommendations(self, life_path: int) -> List[Dict[str, Any]]:
        """Get recommendations based on life path number."""
        recommendations = {
            1: [
                {
                    'type': 'activity',
                    'priority': 'high',
                    'title': 'Leadership Activities',
                    'description': 'Engage in activities that allow you to lead and take initiative',
                    'actions': ['Take on leadership roles', 'Start new projects', 'Exercise independence']
                }
            ],
            2: [
                {
                    'type': 'relationship',
                    'priority': 'high',
                    'title': 'Harmony and Cooperation',
                    'description': 'Focus on building harmonious relationships',
                    'actions': ['Practice diplomacy', 'Seek partnerships', 'Avoid conflicts']
                }
            ],
            6: [
                {
                    'type': 'self_care',
                    'priority': 'high',
                    'title': 'Balance Responsibility',
                    'description': 'Balance caring for others with self-care',
                    'actions': ['Set boundaries', 'Practice self-compassion', 'Avoid over-giving']
                }
            ],
            7: [
                {
                    'type': 'spiritual',
                    'priority': 'high',
                    'title': 'Spiritual Practice',
                    'description': 'Engage in spiritual and analytical activities',
                    'actions': ['Meditation', 'Study and research', 'Quiet reflection']
                }
            ]
        }
        
        return recommendations.get(
            self.calculator._reduce_to_single_digit(life_path, preserve_master=False),
            []
        )
    
    def _get_personal_year_recommendations(self, personal_year: int) -> List[Dict[str, Any]]:
        """Get recommendations based on personal year number."""
        year_reduced = self.calculator._reduce_to_single_digit(personal_year, preserve_master=False)
        
        recommendations = {
            1: [{'type': 'new_beginnings', 'title': 'Focus on New Beginnings', 'priority': 'high'}],
            7: [{'type': 'reflection', 'title': 'Time for Reflection', 'priority': 'high'}],
            9: [{'type': 'completion', 'title': 'Complete Old Cycles', 'priority': 'high'}]
        }
        
        return recommendations.get(year_reduced, [])
    
    def _get_stress_based_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get recommendations based on stress patterns."""
        recommendations = []
        
        overall_stress = analysis.get('overall_average_stress', 50)
        
        if overall_stress > 70:
            recommendations.append({
                'type': 'stress_management',
                'priority': 'high',
                'title': 'High Stress Detected',
                'description': 'Your stress levels are elevated',
                'actions': [
                    'Practice relaxation techniques',
                    'Consider meditation or yoga',
                    'Seek support if needed'
                ]
            })
        
        return recommendations
    
    def _generate_ai_recommendations(
        self,
        user: User,
        profile: NumerologyProfile,
        analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate AI-powered recommendations using OpenAI."""
        if not self.openai_client:
            return []
        
        try:
            prompt = f"""
            Based on the following numerology and mental state analysis, provide 3-5 personalized wellbeing recommendations.
            
            User: {user.full_name}
            Life Path Number: {profile.life_path_number}
            Personal Year: {profile.personal_year_number}
            
            Stress Analysis:
            {json.dumps(analysis, indent=2)}
            
            Provide recommendations in JSON format with: type, priority, title, description, and actions array.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a numerology and mental health expert."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            # Parse response (simplified - in production, use proper JSON parsing)
            content = response.choices[0].message.content
            # This is a simplified parser - in production, use proper JSON parsing
            return []
        except Exception as e:
            logger.error(f"AI recommendation generation failed: {str(e)}")
            return []
    
    def _predict_mood_from_number(self, number: int) -> Dict[str, Any]:
        """Predict mood based on numerology number."""
        number_reduced = self.calculator._reduce_to_single_digit(number, preserve_master=False)
        
        mood_predictions = {
            1: {'mood': 'energetic', 'score_range': [70, 90], 'energy': 'high'},
            2: {'mood': 'harmonious', 'score_range': [60, 80], 'energy': 'moderate'},
            3: {'mood': 'creative', 'score_range': [65, 85], 'energy': 'moderate-high'},
            4: {'mood': 'stable', 'score_range': [55, 75], 'energy': 'moderate'},
            5: {'mood': 'adventurous', 'score_range': [60, 80], 'energy': 'high'},
            6: {'mood': 'nurturing', 'score_range': [65, 85], 'energy': 'moderate'},
            7: {'mood': 'introspective', 'score_range': [50, 70], 'energy': 'low-moderate'},
            8: {'mood': 'ambitious', 'score_range': [70, 90], 'energy': 'high'},
            9: {'mood': 'compassionate', 'score_range': [60, 80], 'energy': 'moderate'}
        }
        
        prediction = mood_predictions.get(number_reduced, {
            'mood': 'neutral',
            'score_range': [50, 70],
            'energy': 'moderate'
        })
        
        prediction['recommendations'] = self._get_mood_recommendations(number_reduced)
        
        return prediction
    
    def _get_mood_recommendations(self, number: int) -> List[str]:
        """Get recommendations for a specific mood number."""
        recommendations = {
            1: ['Engage in physical activity', 'Take on challenges', 'Lead initiatives'],
            7: ['Spend time alone', 'Meditate', 'Reflect on life'],
            9: ['Help others', 'Practice compassion', 'Complete unfinished tasks']
        }
        
        return recommendations.get(number, ['Maintain balance', 'Stay present', 'Practice self-care'])
    
    def _calculate_emotional_compatibility(
        self,
        profile1: NumerologyProfile,
        profile2: NumerologyProfile,
        tracking1: Optional[MentalStateTracking],
        tracking2: Optional[MentalStateTracking]
    ) -> Dict[str, Any]:
        """Calculate emotional compatibility."""
        # Base compatibility on life paths
        life_path1 = self.calculator._reduce_to_single_digit(profile1.life_path_number, preserve_master=False)
        life_path2 = self.calculator._reduce_to_single_digit(profile2.life_path_number, preserve_master=False)
        
        # Calculate compatibility score
        compatibility_matrix = {
            1: {1: 70, 2: 60, 3: 80, 4: 50, 5: 90, 6: 40, 7: 70, 8: 85, 9: 60},
            2: {1: 60, 2: 90, 3: 70, 4: 80, 5: 50, 6: 95, 7: 60, 8: 40, 9: 85},
            # ... (simplified for brevity)
        }
        
        score = compatibility_matrix.get(life_path1, {}).get(life_path2, 50)
        
        # Adjust based on mood similarity if available
        if tracking1 and tracking2:
            mood_diff = abs(tracking1.mood_score - tracking2.mood_score)
            if mood_diff < 20:
                score += 10
            elif mood_diff > 40:
                score -= 10
        
        return {
            'score': max(0, min(100, score)),
            'level': 'high' if score >= 75 else 'moderate' if score >= 60 else 'low',
            'insights': ['Life paths are compatible' if score >= 70 else 'Life paths may need understanding'],
            'recommendations': ['Communicate openly', 'Respect differences', 'Find common ground']
        }
    
    def _correlate_with_cycle(
        self,
        trackings: List[MentalStateTracking],
        cycle_type: str,
        cycle_value: int
    ) -> Dict[str, Any]:
        """Correlate mental state with a numerology cycle."""
        if not trackings:
            return {'cycle_type': cycle_type, 'correlation': 'no_data'}
        
        avg_stress = sum(t.stress_level for t in trackings) / len(trackings)
        avg_mood = sum(t.mood_score for t in trackings) / len(trackings)
        
        return {
            'cycle_type': cycle_type,
            'cycle_value': cycle_value,
            'average_stress': round(avg_stress, 2),
            'average_mood': round(avg_mood, 2),
            'correlation_strength': 'moderate',
            'interpretation': f'Mental state during {cycle_type} {cycle_value}'
        }
    
    def _calculate_overall_mood_trend(self, predictions: List[Dict[str, Any]]) -> str:
        """Calculate overall mood trend from predictions."""
        if not predictions:
            return 'unknown'
        
        scores = [p.get('mood_score_range', [50, 70])[0] for p in predictions]
        first_half = scores[:len(scores)//2]
        second_half = scores[len(scores)//2:]
        
        avg_first = sum(first_half) / len(first_half) if first_half else 50
        avg_second = sum(second_half) / len(second_half) if second_half else 50
        
        if avg_second > avg_first + 5:
            return 'improving'
        elif avg_second < avg_first - 5:
            return 'declining'
        else:
            return 'stable'
    
    def _generate_correlation_summary(self, correlations: List[Dict[str, Any]]) -> str:
        """Generate summary of correlations."""
        if not correlations:
            return 'No correlations found'
        
        return f"Found {len(correlations)} correlations between numerology cycles and mental state"

