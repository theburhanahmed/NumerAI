"""
Email service for sending templated emails.
"""
import re
import logging
from typing import Dict, Optional
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template import Context, Template
from .models import EmailTemplate

logger = logging.getLogger(__name__)


def render_email_template(template: EmailTemplate, context: Dict) -> tuple[str, str]:
    """
    Render email template with context variables.
    
    Args:
        template: EmailTemplate instance
        context: Dictionary of variables to substitute
        
    Returns:
        Tuple of (rendered_html, rendered_text)
    """
    try:
        # Create template objects
        html_template = Template(template.body_html)
        text_template = Template(template.body_text)
        
        # Create context
        template_context = Context(context)
        
        # Render templates
        rendered_html = html_template.render(template_context)
        rendered_text = text_template.render(template_context)
        
        return rendered_html, rendered_text
    except Exception as e:
        logger.error(f"Error rendering email template {template.template_type}: {str(e)}")
        # Fallback to simple variable substitution
        rendered_html = template.body_html
        rendered_text = template.body_text
        
        for key, value in context.items():
            placeholder = f"{{{{{key}}}}}"
            rendered_html = rendered_html.replace(placeholder, str(value))
            rendered_text = rendered_text.replace(placeholder, str(value))
        
        return rendered_html, rendered_text


def send_templated_email(
    template_type: str,
    recipient: str,
    context: Optional[Dict] = None,
    fail_silently: bool = False
) -> bool:
    """
    Send email using a template.
    
    Args:
        template_type: Type of email template (e.g., 'otp', 'password_reset')
        recipient: Email address of recipient
        context: Dictionary of variables to substitute in template
        fail_silently: If True, suppress exceptions
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    if context is None:
        context = {}
    
    try:
        # Get active template
        template = EmailTemplate.objects.get(
            template_type=template_type,
            is_active=True
        )
    except EmailTemplate.DoesNotExist:
        logger.error(f"Email template '{template_type}' not found or inactive")
        if not fail_silently:
            raise ValueError(f"Email template '{template_type}' not found")
        return False
    
    try:
        # Render template
        rendered_html, rendered_text = render_email_template(template, context)
        
        # Render subject
        subject_template = Template(template.subject)
        subject_context = Context(context)
        rendered_subject = subject_template.render(subject_context)
        
        # Send email
        from_email = settings.DEFAULT_FROM_EMAIL
        
        # Use EmailMultiAlternatives to send both HTML and text versions
        email = EmailMultiAlternatives(
            subject=rendered_subject,
            body=rendered_text,
            from_email=from_email,
            to=[recipient]
        )
        email.attach_alternative(rendered_html, "text/html")
        email.send(fail_silently=fail_silently)
        
        logger.info(f"Templated email '{template_type}' sent successfully to {recipient}")
        return True
        
    except Exception as e:
        logger.error(
            f"Failed to send templated email '{template_type}' to {recipient}: {str(e)}"
        )
        if not fail_silently:
            raise
        return False

