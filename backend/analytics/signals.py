"""
Signals for analytics app.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from accounts.models import User
from numerology.models import NumerologyProfile
from consultations.models import Consultation
from payments.models import Subscription
from .models import UserActivityLog, EventTracking
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def track_user_creation(sender, instance, created, **kwargs):
    """Track user creation for analytics."""
    if created:
        try:
            EventTracking.objects.create(
                user=instance,
                event_name='user_registered',
                event_category='conversion',
                event_properties={'email': instance.email}
            )
        except Exception as e:
            logger.error(f"Failed to track user creation: {str(e)}")


@receiver(post_save, sender=NumerologyProfile)
def track_profile_calculation(sender, instance, created, **kwargs):
    """Track numerology profile calculations."""
    if created:
        try:
            UserActivityLog.objects.create(
                user=instance.user,
                activity_type='numerology_profile_calculated',
                activity_data={
                    'system': instance.system,
                    'life_path_number': instance.life_path_number
                },
                feature_name='birth_chart'
            )
        except Exception as e:
            logger.error(f"Failed to track profile calculation: {str(e)}")


@receiver(post_save, sender=Consultation)
def track_consultation_booking(sender, instance, created, **kwargs):
    """Track consultation bookings."""
    if created:
        try:
            EventTracking.objects.create(
                user=instance.user,
                event_name='consultation_booked',
                event_category='conversion',
                event_properties={
                    'consultation_type': instance.consultation_type,
                    'expert_id': str(instance.expert.id) if instance.expert else None
                },
                funnel_name='consultation',
                funnel_step='booking_completed'
            )
        except Exception as e:
            logger.error(f"Failed to track consultation booking: {str(e)}")


@receiver(post_save, sender=Subscription)
def track_subscription_creation(sender, instance, created, **kwargs):
    """Track subscription creation."""
    if created:
        try:
            EventTracking.objects.create(
                user=instance.user,
                event_name='subscription_created',
                event_category='conversion',
                event_properties={
                    'plan': instance.plan,
                    'status': instance.status
                },
                funnel_name='subscription',
                funnel_step='subscription_created'
            )
        except Exception as e:
            logger.error(f"Failed to track subscription creation: {str(e)}")

