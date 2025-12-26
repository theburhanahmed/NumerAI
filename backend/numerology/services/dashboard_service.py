"""
Dashboard service for personalized insights, quick actions, activity feed, and recommendations.
"""
from typing import Dict, List, Any, Optional
from datetime import date, datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count
from numerology.models import NumerologyProfile, DailyReading, Remedy, RemedyTracking

# Import GeneratedReport from reports app
try:
    from reports.models import GeneratedReport
except ImportError:
    GeneratedReport = None


class DashboardService:
    """Service for dashboard data aggregation and insights."""
    
    def get_personalized_insights(
        self,
        user,
        numerology_profile: NumerologyProfile
    ) -> List[Dict[str, Any]]:
        """
        Generate AI insights based on user activity and numerology profile.
        
        Args:
            user: User instance
            numerology_profile: NumerologyProfile instance
            
        Returns:
            List of insight dictionaries
        """
        insights = []
        
        # Get recent activity counts
        recent_reports = GeneratedReport.objects.filter(
            user=user,
            generated_at__gte=timezone.now() - timedelta(days=30)
        ).count() if GeneratedReport else 0
        
        recent_readings = DailyReading.objects.filter(
            user=user,
            reading_date__gte=date.today() - timedelta(days=7)
        ).count()
        
        active_remedies = Remedy.objects.filter(user=user, is_active=True).count()
        
        # Generate insights based on numbers
        life_path = numerology_profile.life_path_number
        
        # Cycle insights
        personal_year = numerology_profile.personal_year_number
        insights.append({
            'type': 'cycle',
            'title': f'Personal Year {personal_year}',
            'description': f'You are in a Personal Year {personal_year}. This is a time for specific themes aligned with this number.',
            'priority': 'high',
            'category': 'timing'
        })
        
        # Number insights
        insights.append({
            'type': 'number',
            'title': f'Life Path {life_path}',
            'description': f'Your Life Path number {life_path} indicates your life purpose and direction.',
            'priority': 'high',
            'category': 'profile'
        })
        
        # Activity insights
        if recent_readings < 3:
            insights.append({
                'type': 'activity',
                'title': 'Daily Readings',
                'description': 'Check your daily numerology reading to stay aligned with cosmic energies.',
                'priority': 'medium',
                'category': 'engagement'
            })
        
        if active_remedies == 0:
            insights.append({
                'type': 'remedy',
                'title': 'Start Using Remedies',
                'description': 'Explore personalized remedies to enhance your numerology journey.',
                'priority': 'medium',
                'category': 'remedies'
            })
        
        return insights
    
    def get_quick_actions(
        self,
        user,
        context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Suggest quick actions based on context.
        
        Args:
            user: User instance
            context: Optional context (home, profile, etc.)
            
        Returns:
            List of quick action dictionaries
        """
        actions = [
            {
                'id': 'daily_reading',
                'label': 'Daily Reading',
                'description': 'Get today\'s numerology guidance',
                'icon': 'book',
                'path': '/daily-reading',
                'priority': 1
            },
            {
                'id': 'generate_report',
                'label': 'Generate Report',
                'description': 'Create a comprehensive numerology report',
                'icon': 'file-text',
                'path': '/reports/generate',
                'priority': 2
            },
            {
                'id': 'check_compatibility',
                'label': 'Check Compatibility',
                'description': 'Compare numerology with someone',
                'icon': 'users',
                'path': '/compatibility',
                'priority': 3
            },
            {
                'id': 'view_remedies',
                'label': 'View Remedies',
                'description': 'Explore personalized remedies',
                'icon': 'gem',
                'path': '/remedies',
                'priority': 4
            },
        ]
        
        # Context-aware suggestions
        if context == 'profile':
            actions.insert(0, {
                'id': 'update_profile',
                'label': 'Update Profile',
                'description': 'Update your numerology profile',
                'icon': 'user',
                'path': '/profile',
                'priority': 0
            })
        
        # Sort by priority
        actions.sort(key=lambda x: x['priority'])
        
        return actions
    
    def get_recent_activity(
        self,
        user,
        limit: int = 10,
        activity_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recent numerology activity feed.
        
        Args:
            user: User instance
            limit: Maximum number of activities
            activity_types: Optional filter by types
            
        Returns:
            List of activity dictionaries
        """
        activities = []
        
        # Get recent reports
        if not activity_types or 'report' in activity_types:
            reports = GeneratedReport.objects.filter(user=user).order_by('-generated_at')[:limit]
            for report in reports:
                activities.append({
                    'type': 'report',
                    'id': str(report.id),
                    'title': f'Generated report: {report.title}',
                    'description': f'Report for {report.person.name}',
                    'timestamp': report.generated_at.isoformat(),
                    'path': f'/reports/{report.id}'
                })
        
        # Get recent readings
        if not activity_types or 'reading' in activity_types:
            readings = DailyReading.objects.filter(user=user).order_by('-reading_date')[:limit]
            for reading in readings:
                activities.append({
                    'type': 'reading',
                    'id': str(reading.id),
                    'title': f'Daily reading for {reading.reading_date}',
                    'description': f'Personal day {reading.personal_day_number}',
                    'timestamp': reading.created_at.isoformat(),
                    'path': f'/daily-reading?date={reading.reading_date}'
                })
        
        # Get recent remedy tracking
        if not activity_types or 'remedy' in activity_types:
            trackings = RemedyTracking.objects.filter(user=user, is_completed=True).order_by('-date')[:limit]
            for tracking in trackings:
                activities.append({
                    'type': 'remedy',
                    'id': str(tracking.id),
                    'title': f'Completed: {tracking.remedy.title}',
                    'description': f'Tracked on {tracking.date}',
                    'timestamp': tracking.created_at.isoformat(),
                    'path': '/remedies'
                })
        
        # Sort by timestamp and limit
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return activities[:limit]
    
    def get_recommendations(
        self,
        user,
        numerology_profile: NumerologyProfile
    ) -> List[Dict[str, Any]]:
        """
        Get personalized feature recommendations.
        
        Args:
            user: User instance
            numerology_profile: NumerologyProfile instance
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Check what user has accessed
        has_reports = GeneratedReport.objects.filter(user=user).exists() if GeneratedReport else False
        has_remedies = Remedy.objects.filter(user=user).exists()
        has_readings = DailyReading.objects.filter(user=user).exists()
        
        # Recommend based on what's missing
        if not has_reports:
            recommendations.append({
                'type': 'feature',
                'title': 'Generate Your First Report',
                'description': 'Create a comprehensive numerology report to understand your complete profile',
                'path': '/reports/generate',
                'priority': 'high',
                'category': 'reports'
            })
        
        if not has_remedies:
            recommendations.append({
                'type': 'feature',
                'title': 'Explore Remedies',
                'description': 'Discover personalized remedies to enhance your numerology journey',
                'path': '/remedies',
                'priority': 'medium',
                'category': 'remedies'
            })
        
        if not has_readings:
            recommendations.append({
                'type': 'feature',
                'title': 'Check Daily Reading',
                'description': 'Get daily numerology guidance aligned with your personal cycles',
                'path': '/daily-reading',
                'priority': 'high',
                'category': 'readings'
            })
        
        # Recommend based on numbers
        personal_year = numerology_profile.personal_year_number
        if personal_year == 9:
            recommendations.append({
                'type': 'cycle',
                'title': 'Year 9 - Completion Phase',
                'description': 'You\'re in a completion year. Focus on finishing projects and preparing for new beginnings.',
                'path': '/timing-cycles',
                'priority': 'high',
                'category': 'timing'
            })
        
        return recommendations
