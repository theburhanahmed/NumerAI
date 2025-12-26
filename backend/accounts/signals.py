"""
Django signals for NumerAI core application.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from accounts.models import User, UserProfile
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when user is created."""
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=UserProfile)
def create_numerology_profile_and_self_person(sender, instance, created, **kwargs):
    """Create numerology profile and self Person record when user profile is completed."""
    # Only proceed if profile has required data
    if not instance.date_of_birth or not instance.user.full_name:
        return
    
    user = instance.user
    
    # Check if numerology profile already exists
    from numerology.models import NumerologyProfile, Person
    from numerology.numerology import NumerologyCalculator, validate_name, validate_birth_date
    
    try:
        # Validate name and birth date
        if not validate_name(user.full_name) or not validate_birth_date(instance.date_of_birth):
            logger.warning(f'Invalid name or birth date for user {user.id}, skipping numerology profile creation')
            return
        
        # Create numerology profile if it doesn't exist
        numerology_profile, profile_created = NumerologyProfile.objects.get_or_create(
            user=user,
            defaults={}
        )
        
        if profile_created or not numerology_profile.calculated_at:
            # Calculate numerology numbers
            calculator = NumerologyCalculator(system='pythagorean')
            numbers = calculator.calculate_all(user.full_name, instance.date_of_birth)
            lo_shu_grid = calculator.calculate_lo_shu_grid(user.full_name, instance.date_of_birth)
            
            # Update profile with calculated numbers
            numerology_profile.life_path_number = numbers['life_path_number']
            numerology_profile.destiny_number = numbers['destiny_number']
            numerology_profile.soul_urge_number = numbers['soul_urge_number']
            numerology_profile.personality_number = numbers['personality_number']
            numerology_profile.attitude_number = numbers['attitude_number']
            numerology_profile.maturity_number = numbers['maturity_number']
            numerology_profile.balance_number = numbers['balance_number']
            numerology_profile.personal_year_number = numbers['personal_year_number']
            numerology_profile.personal_month_number = numbers['personal_month_number']
            numerology_profile.karmic_debt_number = numbers.get('karmic_debt_number')
            numerology_profile.hidden_passion_number = numbers.get('hidden_passion_number')
            numerology_profile.subconscious_self_number = numbers.get('subconscious_self_number')
            numerology_profile.lo_shu_grid = lo_shu_grid
            numerology_profile.calculation_system = 'pythagorean'
            numerology_profile.save()
            
            logger.info(f'Created/updated numerology profile for user {user.id}')
        
        # Create "self" Person record if it doesn't exist
        self_person, person_created = Person.objects.get_or_create(
            user=user,
            name=user.full_name,
            birth_date=instance.date_of_birth,
            relationship='self',
            defaults={
                'notes': 'Auto-created profile for self'
            }
        )
        
        if person_created:
            # Calculate numerology for the self person
            from numerology.models import PersonNumerologyProfile
            person_numbers = calculator.calculate_all(user.full_name, instance.date_of_birth)
            
            PersonNumerologyProfile.objects.get_or_create(
                person=self_person,
                defaults={
                    'life_path_number': person_numbers['life_path_number'],
                    'destiny_number': person_numbers['destiny_number'],
                    'soul_urge_number': person_numbers['soul_urge_number'],
                    'personality_number': person_numbers['personality_number'],
                    'attitude_number': person_numbers['attitude_number'],
                    'maturity_number': person_numbers['maturity_number'],
                    'balance_number': person_numbers['balance_number'],
                    'personal_year_number': person_numbers['personal_year_number'],
                    'personal_month_number': person_numbers['personal_month_number'],
                    'calculation_system': 'pythagorean'
                }
            )
            
            logger.info(f'Created self Person record for user {user.id}')
            
    except Exception as e:
        logger.error(f'Error creating numerology profile for user {user.id}: {str(e)}', exc_info=True)
        # Don't raise - allow user creation to succeed even if numerology fails