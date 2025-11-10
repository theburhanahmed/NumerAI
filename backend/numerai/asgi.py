"""
ASGI config for NumerAI project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerai.settings.production')

application = get_asgi_application()