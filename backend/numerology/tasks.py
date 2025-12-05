"""
Celery tasks for NumerAI numerology application.
"""
from celery import shared_task
from django.utils import timezone
from datetime import date
from accounts.models import User, UserProfile
from .models import DailyReading, NameReport, PhoneReport
from .numerology import NumerologyCalculator
from .reading_generator import DailyReadingGenerator
from .name_numerology import compute_name_numbers
from .services.name_explainer import generate_name_explanation
from .phone_numerology import sanitize_and_validate_phone, compute_phone_numerology
from .services.phone_explainer import generate_phone_explanation
from utils.notifications import send_push_notification
import logging
import time

logger = logging.getLogger(__name__)


@shared_task
def generate_daily_readings():
    """
    Generate daily readings for all active users.
    Runs at 7:00 AM daily via Celery Beat.
    """
    today = date.today()
    calculator = NumerologyCalculator()
    generator = DailyReadingGenerator()
    
    # Get all active verified users with profiles
    users = User.objects.filter(
        is_active=True,
        is_verified=True,
        profile__date_of_birth__isnull=False
    ).select_related('profile')
    
    created_count = 0
    error_count = 0
    
    for user in users:
        try:
            # Check if reading already exists for today
            if DailyReading.objects.filter(user=user, reading_date=today).exists():
                continue
            
            # Get user's date of birth from profile
            try:
                user_profile = UserProfile.objects.get(user=user)
                date_of_birth = user_profile.date_of_birth
            except UserProfile.DoesNotExist:
                logger.warning(f'User {user.id} has no profile')
                continue
            
            # Calculate personal day number
            personal_day_number = calculator.calculate_personal_day_number(
                date_of_birth,
                today
            )
            
            # Get user's numerology profile for personalized reading
            from .models import NumerologyProfile
            try:
                numerology_profile = NumerologyProfile.objects.get(user=user)
                user_profile = {
                    'life_path_number': numerology_profile.life_path_number,
                    'destiny_number': numerology_profile.destiny_number,
                    'soul_urge_number': numerology_profile.soul_urge_number,
                    'personality_number': numerology_profile.personality_number
                }
                
                # Generate personalized reading with Raj Yog insights
                reading_content = generator.generate_personalized_reading(
                    personal_day_number=personal_day_number,
                    user_profile=user_profile,
                    user=user,
                    include_raj_yog=True
                )
            except NumerologyProfile.DoesNotExist:
                # Fallback to basic reading if profile doesn't exist
                reading_content = generator.generate_reading(personal_day_number)
            
            # Extract Raj Yog fields if present
            raj_yog_status = reading_content.pop('raj_yog_status', None)
            raj_yog_insight = reading_content.pop('raj_yog_insight', None)
            
            # Create daily reading
            DailyReading.objects.create(
                user=user,
                reading_date=today,
                personal_day_number=personal_day_number,
                raj_yog_status=raj_yog_status,
                raj_yog_insight=raj_yog_insight,
                **reading_content
            )
            
            created_count += 1
            logger.info(f'Created daily reading for user {user.id}')
            
        except Exception as e:
            error_count += 1
            logger.error(f'Error creating daily reading for user {user.id}: {str(e)}')
    
    result = f'Generated {created_count} daily readings, {error_count} errors'
    logger.info(result)
    return result


@shared_task
def send_daily_reading_notifications():
    """
    Send push notifications for daily readings.
    Runs after generate_daily_readings task.
    """
    today = date.today()
    sent_count = 0
    error_count = 0
    
    # Get users who have readings for today
    readings = DailyReading.objects.filter(reading_date=today).select_related('user')
    
    for reading in readings:
        try:
            user = reading.user
            # Send push notification
            success = send_push_notification(
                user=user,
                title="Your Daily Numerology Reading is Ready 🔮",
                body=f"Today is a {reading.personal_day_number} day. Tap to see your lucky number and guidance.",
                data={
                    "type": "daily_reading",
                    "reading_id": str(reading.id)
                }
            )
            
            if success:
                sent_count += 1
                logger.info(f'Sent daily reading notification to user {user.id}')
            else:
                error_count += 1
                logger.error(f'Failed to send daily reading notification to user {user.id}')
                
        except Exception as e:
            error_count += 1
            logger.error(f'Error sending daily reading notification to user {reading.user.id}: {str(e)}')
    
    result = f'Sent {sent_count} daily reading notifications, {error_count} errors'
    logger.info(result)
    return result


@shared_task
def generate_weekly_reports():
    """
    Generate weekly reports for all active users.
    Runs weekly on Sunday via Celery Beat.
    """
    from datetime import date, timedelta
    from .models import WeeklyReport
    from .services.weekly_report_generator import get_weekly_report_generator
    
    # Get current week start (Sunday)
    today = date.today()
    days_since_sunday = today.weekday() + 1  # Monday=0, Sunday=6
    week_start_date = today - timedelta(days=days_since_sunday % 7)
    
    generator = get_weekly_report_generator()
    
    # Get all active verified users with profiles
    users = User.objects.filter(
        is_active=True,
        is_verified=True,
        profile__date_of_birth__isnull=False
    ).select_related('profile')
    
    created_count = 0
    error_count = 0
    
    for user in users:
        try:
            # Check if report already exists for this week
            if WeeklyReport.objects.filter(
                user=user,
                person=None,
                week_start_date=week_start_date
            ).exists():
                continue
            
            # Generate weekly report
            report_data = generator.generate_weekly_report(
                user=user,
                week_start_date=week_start_date,
                person=None
            )
            
            # Create weekly report
            WeeklyReport.objects.create(
                user=user,
                person=None,
                **report_data
            )
            
            created_count += 1
            logger.info(f'Created weekly report for user {user.id}')
            
        except Exception as e:
            error_count += 1
            logger.error(f'Error creating weekly report for user {user.id}: {str(e)}')
    
    result = f'Generated {created_count} weekly reports, {error_count} errors'
    logger.info(result)
    return result


@shared_task
def generate_yearly_reports():
    """
    Generate yearly reports for all active users.
    Runs annually on January 1st via Celery Beat.
    """
    from datetime import date
    from .models import YearlyReport
    from .services.yearly_report_generator import get_yearly_report_generator
    
    current_year = date.today().year
    generator = get_yearly_report_generator()
    
    # Get all active verified users with profiles
    users = User.objects.filter(
        is_active=True,
        is_verified=True,
        profile__date_of_birth__isnull=False
    ).select_related('profile')
    
    created_count = 0
    error_count = 0
    
    for user in users:
        try:
            # Check if report already exists for this year
            if YearlyReport.objects.filter(
                user=user,
                person=None,
                year=current_year
            ).exists():
                continue
            
            # Generate yearly report
            report_data = generator.generate_yearly_report(
                user=user,
                year=current_year,
                person=None
            )
            
            # Create yearly report
            YearlyReport.objects.create(
                user=user,
                person=None,
                **report_data
            )
            
            created_count += 1
            logger.info(f'Created yearly report for user {user.id}')
            
        except Exception as e:
            error_count += 1
            logger.error(f'Error creating yearly report for user {user.id}: {str(e)}')
    
    result = f'Generated {created_count} yearly reports, {error_count} errors'
    logger.info(result)
    return result


@shared_task
def generate_name_report(user_id, name, name_type, system, force_refresh=False):
    """
    Generate name numerology report with LLM explanation.
    
    Args:
        user_id: User UUID
        name: Name to analyze
        name_type: "birth", "current", or "nickname"
        system: "pythagorean" or "chaldean"
        force_refresh: Whether to regenerate even if report exists
        
    Returns:
        Report ID or error message
    """
    start_time = time.time()
    
    try:
        from accounts.models import User
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f'User {user_id} not found')
        return {'error': 'User not found'}
    
    try:
        # Check if report already exists (unless force_refresh)
        if not force_refresh:
            existing = NameReport.objects.filter(
                user=user,
                name=name,
                name_type=name_type,
                system=system
            ).order_by('-computed_at').first()
            
            if existing:
                logger.info(f'Using existing report {existing.id} for user {user_id}')
                return {'report_id': str(existing.id), 'status': 'existing'}
        
        # Compute name numbers (pure deterministic logic)
        keep_master = True  # Can be made configurable per user
        numbers_data = compute_name_numbers(
            name=name,
            system=system,
            keep_master=keep_master
        )
        
        # Build evidence object for LLM
        evidence = {}
        evidence_id = 1
        
        # Expression
        evidence[f'E{evidence_id}'] = {
            'type': 'expression',
            'value': numbers_data['expression']['reduced'],
            'raw_total': numbers_data['expression']['raw_total']
        }
        evidence_id += 1
        
        # Soul urge
        evidence[f'E{evidence_id}'] = {
            'type': 'soul_urge',
            'value': numbers_data['soul_urge']['reduced'],
            'raw_total': numbers_data['soul_urge']['raw_total']
        }
        evidence_id += 1
        
        # Personality
        evidence[f'E{evidence_id}'] = {
            'type': 'personality',
            'value': numbers_data['personality']['reduced'],
            'raw_total': numbers_data['personality']['raw_total']
        }
        evidence_id += 1
        
        # Name vibration
        evidence[f'E{evidence_id}'] = {
            'type': 'name_vibration',
            'value': numbers_data['name_vibration']
        }
        
        # Generate LLM explanation
        explanation_result = generate_name_explanation(
            user=user,
            name=name,
            name_type=name_type,
            system=system,
            numbers=numbers_data,
            breakdown=numbers_data['breakdown'],
            keep_master=keep_master,
            report_type='saved'
        )
        
        # Create report
        report = NameReport.objects.create(
            user=user,
            name=name,
            name_type=name_type,
            system=system,
            normalized_name=numbers_data['normalized_name'],
            numbers=numbers_data,
            breakdown=numbers_data['breakdown'],
            explanation=explanation_result.get('explanation'),
            explanation_error=explanation_result.get('error')
        )
        
        # Emit metrics (if you have a metrics system)
        generation_time_ms = (time.time() - start_time) * 1000
        logger.info(
            f'Generated name report {report.id} for user {user_id} '
            f'in {generation_time_ms:.2f}ms'
        )
        
        # Log metrics
        if explanation_result.get('latency_ms'):
            logger.info(
                f'LLM explanation latency: {explanation_result["latency_ms"]:.2f}ms, '
                f'tokens: {explanation_result.get("tokens_used", 0)}'
            )
        
        return {
            'report_id': str(report.id),
            'status': 'completed',
            'generation_time_ms': generation_time_ms
        }
        
    except ValueError as e:
        logger.error(f'Invalid input for name report generation: {e}')
        return {'error': str(e)}
    except Exception as e:
        logger.error(f'Error generating name report for user {user_id}: {e}', exc_info=True)
        return {'error': str(e)}


@shared_task
def generate_phone_report(
    user_id,
    phone_number,
    country_hint=None,
    method='core',
    persist=True,
    force_refresh=False,
    convert_vanity=False
):
    """
    Generate phone numerology report with LLM explanation.
    
    Args:
        user_id: User UUID
        phone_number: Phone number string
        country_hint: Optional ISO country code
        method: "core", "full", or "compatibility"
        persist: Whether to save to database
        force_refresh: Whether to regenerate even if report exists
        convert_vanity: Whether to convert letters to dial digits
        
    Returns:
        Report ID or error message
    """
    start_time = time.time()
    
    try:
        from accounts.models import User
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f'User {user_id} not found')
        return {'error': 'User not found'}
    
    try:
        # Sanitize and validate phone number
        validation_result = sanitize_and_validate_phone(
            phone_number,
            country_hint=country_hint,
            convert_vanity=convert_vanity
        )
        
        if not validation_result['valid']:
            logger.error(f'Invalid phone number: {validation_result["reason"]}')
            return {'error': validation_result['reason']}
        
        phone_e164 = validation_result['e164']
        
        # Check if report already exists (unless force_refresh)
        if not force_refresh and persist:
            existing = PhoneReport.objects.filter(
                user=user,
                phone_e164=phone_e164,
                method=method
            ).order_by('-computed_at').first()
            
            if existing:
                logger.info(f'Using existing report {existing.id} for user {user_id}')
                return {'report_id': str(existing.id), 'status': 'existing'}
        
        # Compute numerology (pure deterministic logic)
        computed = compute_phone_numerology(
            phone_e164,
            method=method,
            core_scope='national',  # Default to national
            keep_master=False
        )
        
        # Generate LLM explanation
        explanation_result = generate_phone_explanation(
            user=user,
            phone_raw=phone_number,
            phone_e164=phone_e164,
            method=method,
            computed=computed,
            persist=persist
        )
        
        # Create report if persist=True
        report = None
        if persist:
            report = PhoneReport.objects.create(
                user=user,
                phone_raw=phone_number,
                phone_e164=phone_e164,
                country=validation_result.get('country'),
                method=method,
                computed=computed,
                explanation=explanation_result.get('explanation'),
                explanation_error=explanation_result.get('error')
            )
            
            # Emit metrics
            generation_time_ms = (time.time() - start_time) * 1000
            logger.info(
                f'Generated phone report {report.id} for user {user_id} '
                f'in {generation_time_ms:.2f}ms'
            )
            
            # Log LLM metrics
            if explanation_result.get('latency_ms'):
                logger.info(
                    f'LLM explanation latency: {explanation_result["latency_ms"]:.2f}ms, '
                    f'tokens: {explanation_result.get("tokens_used", 0)}'
                )
            
            return {
                'report_id': str(report.id),
                'status': 'completed',
                'generation_time_ms': generation_time_ms
            }
        else:
            # Return computed data without persisting
            return {
                'status': 'computed',
                'computed': computed,
                'explanation': explanation_result.get('explanation'),
                'generation_time_ms': (time.time() - start_time) * 1000
            }
        
    except ValueError as e:
        logger.error(f'Invalid input for phone report generation: {e}')
        return {'error': str(e)}
    except Exception as e:
        logger.error(f'Error generating phone report for user {user_id}: {e}', exc_info=True)
        return {'error': str(e)}


@shared_task
def generate_detailed_readings_for_profile(user_id):
    """
    Generate AI-powered detailed readings for all core numerology numbers.
    This task is triggered after a numerology profile is calculated.
    
    Args:
        user_id: User UUID
        
    Returns:
        Dictionary with generation results
    """
    try:
        from accounts.models import User
        from .models import NumerologyProfile
        from .ai_reading_generator import generate_all_detailed_readings
        
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f'User {user_id} not found')
        return {'error': 'User not found'}
    
    try:
        # Verify profile exists
        try:
            profile = NumerologyProfile.objects.get(user=user)
        except NumerologyProfile.DoesNotExist:
            logger.error(f'Numerology profile not found for user {user_id}')
            return {'error': 'Numerology profile not found'}
        
        # Generate all detailed readings
        readings = generate_all_detailed_readings(user)
        
        # Count successful generations
        successful = sum(1 for r in readings.values() if r is not None)
        total = len(readings)
        
        logger.info(
            f'Generated {successful}/{total} detailed readings for user {user_id}'
        )
        
        return {
            'status': 'completed',
            'user_id': str(user_id),
            'successful': successful,
            'total': total,
            'readings': {
                k: str(v.id) if v else None 
                for k, v in readings.items()
            }
        }
        
    except Exception as e:
        logger.error(
            f'Error generating detailed readings for user {user_id}: {e}',
            exc_info=True
        )
        return {'error': str(e)}