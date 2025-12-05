"""
Celery tasks for consultations application.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Consultation
from utils.notifications import create_notification
from .services import JitsiService


@shared_task
def send_consultation_reminders():
    """Send reminder notifications for upcoming consultations."""
    now = timezone.now()
    
    # 24 hours before
    reminder_24h_time = now + timedelta(hours=24)
    consultations_24h = Consultation.objects.filter(
        scheduled_at__gte=reminder_24h_time - timedelta(minutes=30),
        scheduled_at__lte=reminder_24h_time + timedelta(minutes=30),
        status__in=['pending', 'confirmed']
    )
    
    for consultation in consultations_24h:
        create_notification(
            user=consultation.user,
            title='Consultation Reminder',
            message=f'Your consultation with {consultation.expert.name} is in 24 hours',
            notification_type='info',
            data={'consultation_id': str(consultation.id), 'type': 'consultation_reminder_24h'},
            send_push=True
        )
    
    # 1 hour before
    reminder_1h_time = now + timedelta(hours=1)
    consultations_1h = Consultation.objects.filter(
        scheduled_at__gte=reminder_1h_time - timedelta(minutes=15),
        scheduled_at__lte=reminder_1h_time + timedelta(minutes=15),
        status__in=['pending', 'confirmed']
    )
    
    for consultation in consultations_1h:
        # Generate meeting link if video consultation
        if consultation.consultation_type == 'video' and not consultation.meeting_link:
            jitsi_service = JitsiService()
            if consultation.meeting_room_id:
                consultation.meeting_link = jitsi_service.get_meeting_url(
                    consultation.meeting_room_id,
                    user_display_name=consultation.user.full_name,
                    expert_display_name=consultation.expert.name
                )
                consultation.save()
        
        create_notification(
            user=consultation.user,
            title='Consultation Starting Soon',
            message=f'Your consultation with {consultation.expert.name} starts in 1 hour',
            notification_type='warning',
            data={
                'consultation_id': str(consultation.id),
                'meeting_link': consultation.meeting_link,
                'type': 'consultation_reminder_1h'
            },
            send_push=True
        )


@shared_task
def check_upcoming_consultations():
    """Check and send reminders for upcoming consultations."""
    send_consultation_reminders.delay()


@shared_task
def cleanup_old_meetings():
    """Clean up old meeting rooms (if needed)."""
    # This can be used to clean up old Jitsi rooms or other cleanup tasks
    # For now, just a placeholder
    pass

