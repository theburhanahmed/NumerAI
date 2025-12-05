"""
Django signals for consultations application.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Consultation, ExpertApplication, ExpertChatMessage, ExpertChatConversation
from utils.notifications import create_notification


@receiver(post_save, sender=Consultation)
def consultation_created_notification(sender, instance, created, **kwargs):
    """Send notifications when consultation is created."""
    if created:
        # Notify user
        create_notification(
            user=instance.user,
            title='Consultation Booked',
            message=f'Your consultation with {instance.expert.name} is scheduled for {instance.scheduled_at.strftime("%Y-%m-%d %H:%M")}',
            notification_type='success',
            data={'consultation_id': str(instance.id), 'type': 'consultation_booked'},
            send_push=True
        )
        
        # Notify expert if expert has user account
        if instance.expert.user:
            create_notification(
                user=instance.expert.user,
                title='New Consultation Request',
                message=f'{instance.user.full_name} has requested a consultation on {instance.scheduled_at.strftime("%Y-%m-%d %H:%M")}',
                notification_type='info',
                data={'consultation_id': str(instance.id), 'type': 'consultation_request'},
                send_push=True
            )


@receiver(post_save, sender=Consultation)
def consultation_status_changed_notification(sender, instance, **kwargs):
    """Send notifications when consultation status changes."""
    if instance.status == 'confirmed':
        create_notification(
            user=instance.user,
            title='Consultation Confirmed',
            message=f'Your consultation with {instance.expert.name} has been confirmed',
            notification_type='success',
            data={'consultation_id': str(instance.id), 'type': 'consultation_confirmed'},
            send_push=True
        )
    elif instance.status == 'cancelled':
        create_notification(
            user=instance.user,
            title='Consultation Cancelled',
            message=f'Your consultation with {instance.expert.name} has been cancelled',
            notification_type='warning',
            data={'consultation_id': str(instance.id), 'type': 'consultation_cancelled'},
            send_push=True
        )
    elif instance.status == 'completed':
        create_notification(
            user=instance.user,
            title='Consultation Completed',
            message=f'Your consultation with {instance.expert.name} has been completed. Please leave a review.',
            notification_type='info',
            data={'consultation_id': str(instance.id), 'type': 'consultation_completed'},
            send_push=True
        )


@receiver(post_save, sender=ExpertApplication)
def expert_application_submitted_notification(sender, instance, created, **kwargs):
    """Send notification when expert application is submitted."""
    if created:
        create_notification(
            user=instance.user,
            title='Application Submitted',
            message='Your expert application has been submitted and is under review',
            notification_type='info',
            data={'application_id': str(instance.id), 'type': 'application_submitted'},
            send_push=True
        )


@receiver(post_save, sender=ExpertApplication)
def expert_application_reviewed_notification(sender, instance, **kwargs):
    """Send notification when expert application is reviewed."""
    if instance.status == 'approved':
        create_notification(
            user=instance.user,
            title='Application Approved',
            message='Congratulations! Your expert application has been approved.',
            notification_type='success',
            data={'application_id': str(instance.id), 'type': 'application_approved'},
            send_push=True
        )
    elif instance.status == 'rejected':
        create_notification(
            user=instance.user,
            title='Application Rejected',
            message=f'Your expert application has been rejected. Reason: {instance.rejection_reason}',
            notification_type='error',
            data={'application_id': str(instance.id), 'type': 'application_rejected'},
            send_push=True
        )


@receiver(post_save, sender=ExpertChatMessage)
def chat_message_notification(sender, instance, created, **kwargs):
    """Send notification when new chat message is received."""
    if created:
        conversation = instance.conversation
        
        # Determine recipient
        if instance.sender_type == 'user':
            # Notify expert
            if conversation.expert.user:
                create_notification(
                    user=conversation.expert.user,
                    title='New Message',
                    message=f'New message from {conversation.user.full_name}',
                    notification_type='info',
                    data={
                        'conversation_id': str(conversation.id),
                        'message_id': str(instance.id),
                        'type': 'chat_message'
                    },
                    send_push=True
                )
        else:
            # Notify user
            create_notification(
                user=conversation.user,
                title='New Message',
                message=f'New message from {conversation.expert.name}',
                notification_type='info',
                data={
                    'conversation_id': str(conversation.id),
                    'message_id': str(instance.id),
                    'type': 'chat_message'
                },
                send_push=True
            )

