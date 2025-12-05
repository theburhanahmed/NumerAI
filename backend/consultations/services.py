"""
Services for consultations application.
"""
import uuid
import os
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class JitsiService:
    """Service for managing Jitsi meeting rooms."""
    
    def __init__(self):
        self.domain = getattr(settings, 'JITSI_DOMAIN', 'meet.jit.si')
        self.app_id = getattr(settings, 'JITSI_APP_ID', None)
        self.secret = getattr(settings, 'JITSI_SECRET', None)
        self.use_jwt = getattr(settings, 'JITSI_USE_JWT', False)
    
    def create_meeting_room(self, consultation_id=None):
        """
        Generate a unique Jitsi room name.
        
        Args:
            consultation_id: Optional consultation UUID for room name
            
        Returns:
            str: Unique room identifier
        """
        if consultation_id:
            # Use consultation ID as part of room name for traceability
            room_id = f"consultation-{str(consultation_id).replace('-', '')}"
        else:
            # Generate random room ID
            room_id = f"room-{uuid.uuid4().hex[:16]}"
        
        return room_id
    
    def get_meeting_url(self, room_id, user_display_name=None, expert_display_name=None):
        """
        Generate Jitsi Meet URL for a room.
        
        Args:
            room_id: Room identifier
            user_display_name: Display name for user
            expert_display_name: Display name for expert
            
        Returns:
            str: Jitsi Meet URL
        """
        base_url = f"https://{self.domain}/{room_id}"
        
        # Add user info as URL parameters (optional)
        params = []
        if user_display_name:
            params.append(f"userInfo.displayName={user_display_name}")
        if expert_display_name:
            params.append(f"userInfo.displayName={expert_display_name}")
        
        if params:
            base_url += "?" + "&".join(params)
        
        return base_url
    
    def validate_meeting_access(self, room_id, user, consultation):
        """
        Validate if user can access the meeting room.
        
        Args:
            room_id: Room identifier
            user: User object
            consultation: Consultation object
            
        Returns:
            bool: True if user has access
        """
        # Check if user is either the consultation user or expert
        if consultation.user == user:
            return True
        
        # Check if user is the expert (if expert has user account)
        if consultation.expert.user == user:
            return True
        
        # Check if user is staff/admin
        if hasattr(user, 'is_staff') and user.is_staff:
            return True
        
        return False
    
    def generate_jwt_token(self, room_id, user_display_name, is_moderator=False):
        """
        Generate JWT token for Jitsi room (if using JWT authentication).
        
        Args:
            room_id: Room identifier
            user_display_name: User display name
            is_moderator: Whether user is moderator
            
        Returns:
            str: JWT token
        """
        if not self.use_jwt or not self.app_id or not self.secret:
            return None
        
        try:
            import jwt
            from datetime import datetime, timedelta
            
            now = datetime.utcnow()
            payload = {
                'iss': self.app_id,
                'aud': 'jitsi',
                'exp': now + timedelta(hours=2),
                'room': room_id,
                'sub': self.domain,
                'context': {
                    'user': {
                        'name': user_display_name,
                        'moderator': is_moderator
                    }
                }
            }
            
            token = jwt.encode(payload, self.secret, algorithm='HS256')
            return token
        except ImportError:
            # PyJWT not installed
            return None
        except Exception as e:
            print(f"Error generating JWT token: {e}")
            return None


class SchedulingService:
    """Service for managing expert availability and scheduling."""
    
    def get_available_slots(self, expert, date, duration_minutes=30):
        """
        Get available time slots for an expert on a given date.
        
        Args:
            expert: Expert object
            date: Date to check availability
            duration_minutes: Duration of consultation in minutes
            
        Returns:
            list: List of available time slots (datetime objects)
        """
        from .models import ExpertAvailability, ExpertUnavailability, Consultation
        
        # Check if expert has unavailability on this date
        unavailability = ExpertUnavailability.objects.filter(
            expert=expert,
            start_date__lte=date,
            end_date__gte=date
        ).exists()
        
        if unavailability:
            return []
        
        # Get day of week (0=Monday, 6=Sunday)
        day_of_week = date.weekday()
        
        # Get expert's availability for this day
        availability = ExpertAvailability.objects.filter(
            expert=expert,
            day_of_week=day_of_week,
            is_available=True
        )
        
        if not availability.exists():
            return []
        
        # Get existing consultations for this date
        existing_consultations = Consultation.objects.filter(
            expert=expert,
            scheduled_at__date=date,
            status__in=['pending', 'confirmed']
        ).order_by('scheduled_at')
        
        # Generate available slots
        available_slots = []
        
        for avail in availability:
            # Convert to datetime for the specific date
            start_datetime = timezone.make_aware(
                timezone.datetime.combine(date, avail.start_time)
            )
            end_datetime = timezone.make_aware(
                timezone.datetime.combine(date, avail.end_time)
            )
            
            # Generate slots every 30 minutes (or based on duration)
            current_slot = start_datetime
            while current_slot + timedelta(minutes=duration_minutes) <= end_datetime:
                # Check if this slot conflicts with existing consultations
                slot_end = current_slot + timedelta(minutes=duration_minutes)
                conflict = False
                
                for consultation in existing_consultations:
                    consultation_end = consultation.scheduled_at + timedelta(
                        minutes=consultation.duration_minutes
                    )
                    # Check for overlap
                    if (current_slot < consultation_end and 
                        slot_end > consultation.scheduled_at):
                        conflict = True
                        break
                
                if not conflict and current_slot > timezone.now():
                    available_slots.append(current_slot)
                
                current_slot += timedelta(minutes=30)  # Next slot
        
        return sorted(available_slots)
    
    def check_conflict(self, expert, scheduled_at, duration_minutes):
        """
        Check if a scheduled time conflicts with existing consultations.
        
        Args:
            expert: Expert object
            scheduled_at: Proposed scheduled time
            duration_minutes: Duration of consultation
            
        Returns:
            bool: True if conflict exists
        """
        from .models import Consultation
        
        scheduled_end = scheduled_at + timedelta(minutes=duration_minutes)
        
        conflicts = Consultation.objects.filter(
            expert=expert,
            scheduled_at__date=scheduled_at.date(),
            status__in=['pending', 'confirmed']
        ).filter(
            scheduled_at__lt=scheduled_end,
            scheduled_at__gte=scheduled_at - timedelta(minutes=duration_minutes)
        ).exists()
        
        return conflicts
    
    def suggest_alternative_times(self, expert, preferred_date, duration_minutes=30, num_suggestions=5):
        """
        Suggest alternative available times if preferred time is not available.
        
        Args:
            expert: Expert object
            preferred_date: Preferred date
            duration_minutes: Duration of consultation
            num_suggestions: Number of suggestions to return
            
        Returns:
            list: List of suggested datetime objects
        """
        suggestions = []
        current_date = preferred_date
        
        # Check next 7 days
        for _ in range(7):
            slots = self.get_available_slots(expert, current_date, duration_minutes)
            suggestions.extend(slots[:num_suggestions])
            
            if len(suggestions) >= num_suggestions:
                break
            
            current_date += timedelta(days=1)
        
        return suggestions[:num_suggestions]

