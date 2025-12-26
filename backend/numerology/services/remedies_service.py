"""
Enhanced remedies service for personalized remedies, tracking, effectiveness, and combinations.
"""
from typing import Dict, List, Any, Optional
from datetime import date, datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Q
from numerology.models import Remedy, RemedyTracking, RemedyEffectiveness, RemedyCombination, NumerologyProfile


class RemediesService:
    """Service for enhanced remedy management and analysis."""
    
    def generate_personalized_remedies(
        self,
        user,
        numerology_profile: NumerologyProfile
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered personalized remedy suggestions.
        
        Args:
            user: User instance
            numerology_profile: NumerologyProfile instance
            
        Returns:
            List of personalized remedy dictionaries
        """
        # Use existing remedy generation logic as base
        # This would integrate with AI service for personalization
        personalized_remedies = []
        
        # Base remedies on life path and other numbers
        life_path = numerology_profile.life_path_number
        
        # Example personalized remedies based on numbers
        remedy_suggestions = self._get_remedy_suggestions_by_number(life_path)
        
        for remedy_data in remedy_suggestions:
            personalized_remedies.append({
                **remedy_data,
                'personalization_reason': f"Recommended based on your Life Path number {life_path}",
                'priority': remedy_data.get('priority', 5),
                'difficulty': remedy_data.get('difficulty', 'medium'),
                'duration_minutes': remedy_data.get('duration_minutes', 15),
                'frequency': remedy_data.get('frequency', 'daily')
            })
        
        return personalized_remedies
    
    def track_remedy_progress(
        self,
        user,
        remedy: Remedy,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Track remedy practice progress over time.
        
        Args:
            user: User instance
            remedy: Remedy instance
            start_date: Start date for tracking
            end_date: End date for tracking
            
        Returns:
            Dictionary with progress statistics
        """
        trackings = RemedyTracking.objects.filter(
            user=user,
            remedy=remedy,
            date__gte=start_date,
            date__lte=end_date
        )
        
        total_days = (end_date - start_date).days + 1
        completed_count = trackings.filter(is_completed=True).count()
        completion_rate = (completed_count / total_days * 100) if total_days > 0 else 0
        
        # Average effectiveness rating
        avg_rating = trackings.filter(effectiveness_rating__isnull=False).aggregate(
            avg_rating=Avg('effectiveness_rating')
        )['avg_rating'] or 0
        
        # Mood improvements
        mood_improvements = trackings.filter(
            mood_before__isnull=False,
            mood_after__isnull=False
        ).count()
        
        return {
            'remedy_id': str(remedy.id),
            'remedy_title': remedy.title,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'total_days': total_days,
            'completed_count': completed_count,
            'completion_rate': round(completion_rate, 2),
            'average_effectiveness_rating': round(avg_rating, 2) if avg_rating else None,
            'mood_tracked_days': mood_improvements,
            'tracking_entries': trackings.count()
        }
    
    def analyze_remedy_effectiveness(
        self,
        user,
        remedy: Remedy,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Analyze effectiveness of a remedy based on tracking data.
        
        Args:
            user: User instance
            remedy: Remedy instance
            period_days: Number of days to analyze
            
        Returns:
            Dictionary with effectiveness analysis
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=period_days)
        
        trackings = RemedyTracking.objects.filter(
            user=user,
            remedy=remedy,
            date__gte=start_date,
            date__lte=end_date
        )
        
        # Calculate effectiveness metrics
        total_entries = trackings.count()
        completed_entries = trackings.filter(is_completed=True).count()
        
        # Average effectiveness rating
        avg_rating = trackings.filter(effectiveness_rating__isnull=False).aggregate(
            avg=Avg('effectiveness_rating')
        )['avg']
        
        # Mood analysis
        mood_before_avg = self._calculate_mood_average(
            trackings.values_list('mood_before', flat=True)
        )
        mood_after_avg = self._calculate_mood_average(
            trackings.values_list('mood_after', flat=True)
        )
        mood_improvement = mood_after_avg - mood_before_avg if mood_before_avg and mood_after_avg else None
        
        # Calculate overall effectiveness score
        effectiveness_score = self._calculate_effectiveness_score(
            completion_rate=(completed_entries / total_entries * 100) if total_entries > 0 else 0,
            avg_rating=avg_rating,
            mood_improvement=mood_improvement
        )
        
        # Save effectiveness record
        effectiveness = RemedyEffectiveness.objects.create(
            user=user,
            remedy=remedy,
            effectiveness_score=effectiveness_score,
            period_start=start_date,
            period_end=end_date
        )
        
        return {
            'effectiveness_score': round(effectiveness_score, 2),
            'completion_rate': round((completed_entries / total_entries * 100) if total_entries > 0 else 0, 2),
            'average_rating': round(avg_rating, 2) if avg_rating else None,
            'mood_improvement': round(mood_improvement, 2) if mood_improvement else None,
            'total_tracked_days': total_entries,
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'effectiveness_id': str(effectiveness.id)
        }
    
    def get_remedy_combinations(
        self,
        user,
        primary_remedy: Remedy
    ) -> List[Dict[str, Any]]:
        """
        Suggest effective remedy combinations.
        
        Args:
            user: User instance
            primary_remedy: Primary Remedy instance
            
        Returns:
            List of suggested combinations
        """
        # Get all active remedies for user
        all_remedies = Remedy.objects.filter(user=user, is_active=True).exclude(id=primary_remedy.id)
        
        combinations = []
        
        for secondary_remedy in all_remedies:
            # Calculate combination score based on compatibility
            score = self._calculate_combination_score(primary_remedy, secondary_remedy)
            
            # Only include combinations with score >= 5
            if score >= 5:
                combinations.append({
                    'primary_remedy_id': str(primary_remedy.id),
                    'primary_remedy_title': primary_remedy.title,
                    'secondary_remedy_id': str(secondary_remedy.id),
                    'secondary_remedy_title': secondary_remedy.title,
                    'combination_score': round(score, 2),
                    'notes': f"Combining {primary_remedy.remedy_type} with {secondary_remedy.remedy_type} remedies"
                })
        
        # Sort by score descending
        combinations.sort(key=lambda x: x['combination_score'], reverse=True)
        
        return combinations[:10]  # Return top 10
    
    def schedule_remedy_reminders(
        self,
        user,
        remedy: Remedy,
        frequency: str,
        reminder_time: datetime.time,
        is_active: bool = True
    ) -> Dict[str, Any]:
        """
        Schedule reminder for remedy practice.
        
        Args:
            user: User instance
            remedy: Remedy instance
            frequency: Frequency (daily, weekly, monthly, custom)
            reminder_time: Time to send reminder
            is_active: Whether reminder is active
            
        Returns:
            Dictionary with reminder details
        """
        from numerology.models import RemedyReminder
        
        # Calculate next send date
        next_send_at = self._calculate_next_send_time(frequency, reminder_time)
        
        reminder = RemedyReminder.objects.create(
            user=user,
            remedy=remedy,
            frequency=frequency,
            reminder_time=reminder_time,
            is_active=is_active,
            next_send_at=next_send_at
        )
        
        return {
            'reminder_id': str(reminder.id),
            'remedy_id': str(remedy.id),
            'remedy_title': remedy.title,
            'frequency': frequency,
            'reminder_time': reminder_time.strftime('%H:%M:%S'),
            'next_send_at': next_send_at.isoformat() if next_send_at else None,
            'is_active': is_active
        }
    
    def _get_remedy_suggestions_by_number(self, number: int) -> List[Dict[str, Any]]:
        """Get remedy suggestions based on numerology number."""
        suggestions = {
            1: [
                {'remedy_type': 'gemstone', 'title': 'Ruby for Leadership', 'priority': 8, 'difficulty': 'easy'},
                {'remedy_type': 'color', 'title': 'Red Energy', 'priority': 7, 'difficulty': 'easy'},
            ],
            2: [
                {'remedy_type': 'gemstone', 'title': 'Pearl for Harmony', 'priority': 8, 'difficulty': 'easy'},
                {'remedy_type': 'ritual', 'title': 'Meditation for Balance', 'priority': 7, 'difficulty': 'medium'},
            ],
            3: [
                {'remedy_type': 'gemstone', 'title': 'Yellow Sapphire for Creativity', 'priority': 8, 'difficulty': 'easy'},
                {'remedy_type': 'color', 'title': 'Yellow Energy', 'priority': 7, 'difficulty': 'easy'},
            ],
        }
        
        return suggestions.get(number, [
            {'remedy_type': 'ritual', 'title': 'Daily Meditation', 'priority': 5, 'difficulty': 'medium'}
        ])
    
    def _calculate_mood_average(self, mood_values: List[str]) -> Optional[float]:
        """Calculate average mood value."""
        mood_scores = {
            'very_low': 1,
            'low': 2,
            'neutral': 3,
            'good': 4,
            'very_good': 5
        }
        
        valid_moods = [m for m in mood_values if m]
        if not valid_moods:
            return None
        
        scores = [mood_scores.get(m, 3) for m in valid_moods]
        return sum(scores) / len(scores) if scores else None
    
    def _calculate_effectiveness_score(
        self,
        completion_rate: float,
        avg_rating: Optional[float],
        mood_improvement: Optional[float]
    ) -> float:
        """Calculate overall effectiveness score."""
        score = 0.0
        
        # Completion rate contributes 40%
        score += (completion_rate / 100) * 40
        
        # Average rating contributes 40%
        if avg_rating:
            score += (avg_rating / 5) * 40
        
        # Mood improvement contributes 20%
        if mood_improvement:
            # Normalize mood improvement to 0-1 scale
            normalized_mood = max(0, min(1, (mood_improvement + 2) / 4))
            score += normalized_mood * 20
        
        return min(5.0, score)
    
    def _calculate_combination_score(
        self,
        remedy1: Remedy,
        remedy2: Remedy
    ) -> float:
        """Calculate compatibility score between two remedies."""
        score = 5.0  # Base score
        
        # Different types are generally better
        if remedy1.remedy_type != remedy2.remedy_type:
            score += 2.0
        
        # Complementary difficulties
        if remedy1.difficulty != remedy2.difficulty:
            score += 1.0
        
        # Different frequencies can work well
        if remedy1.frequency != remedy2.frequency:
            score += 1.0
        
        return min(10.0, score)
    
    def _calculate_next_send_time(
        self,
        frequency: str,
        reminder_time: datetime.time
    ) -> Optional[datetime]:
        """Calculate next send time for reminder."""
        now = timezone.now()
        today = now.date()
        next_datetime = datetime.combine(today, reminder_time)
        
        if next_datetime <= now:
            # If time has passed today, move to next occurrence
            if frequency == 'daily':
                next_datetime += timedelta(days=1)
            elif frequency == 'weekly':
                next_datetime += timedelta(weeks=1)
            elif frequency == 'monthly':
                # Move to next month (simplified)
                if today.month == 12:
                    next_datetime = next_datetime.replace(year=today.year + 1, month=1)
                else:
                    next_datetime = next_datetime.replace(month=today.month + 1)
        
        return timezone.make_aware(next_datetime)
