"""
Celery configuration for NumerAI project.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerai.settings.production')

app = Celery('numerai')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'generate-daily-readings': {
        'task': 'core.tasks.generate_daily_readings',
        'schedule': crontab(hour=7, minute=0),  # Run at 7:00 AM daily
    },
    'cleanup-expired-otps': {
        'task': 'core.tasks.cleanup_expired_otps',
        'schedule': crontab(hour=0, minute=0),  # Run at midnight daily
    },
    'cleanup-expired-tokens': {
        'task': 'core.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=0, minute=30),  # Run at 12:30 AM daily
    },
    'send-consultation-reminders': {
        'task': 'consultations.tasks.send_consultation_reminders',
        'schedule': crontab(minute='*/15'),  # Run every 15 minutes to check for reminders
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')