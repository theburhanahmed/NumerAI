"""
MEUS app configuration.
"""
from django.apps import AppConfig


class MeusConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'meus'
    verbose_name = 'Multi-Entity Universe System'
