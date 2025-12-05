"""
AI-powered detailed numerology reading generator.
"""
import os
import logging
import openai
from typing import Dict, Optional
from django.conf import settings
from accounts.models import User
from numerology.models import NumerologyProfile, DetailedReading
from numerology.interpretations import get_interpretation

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY', getattr(settings, 'OPENAI_API_KEY', None))


def generate_detailed_reading(
    user: User,
    number_type: str,
    number_value: int,
    numerology_profile: Optional[NumerologyProfile] = None
) -> Optional[DetailedReading]:
    """
    Generate a detailed AI-powered reading for a specific numerology number.
    
    Args:
        user: User instance
        number_type: Type of number (e.g., 'life_path', 'destiny', 'soul_urge')
        number_value: The numerology number value
        numerology_profile: Optional NumerologyProfile for additional context
        
    Returns:
        DetailedReading instance or None if generation fails
    """
    if not openai.api_key:
        logger.warning("OpenAI API key not configured. Cannot generate detailed readings.")
        return None
    
    try:
        # Get or fetch numerology profile
        if not numerology_profile:
            try:
                numerology_profile = NumerologyProfile.objects.get(user=user)
            except NumerologyProfile.DoesNotExist:
                logger.error(f"Numerology profile not found for user {user.id}")
                return None
        
        # Get basic interpretation for context
        try:
            basic_interpretation = get_interpretation(number_value)
        except ValueError:
            basic_interpretation = None
        
        # Build comprehensive prompt
        prompt = f"""
        You are an expert numerologist with deep knowledge of numerology principles. 
        Generate a comprehensive, personalized reading for a {number_type.replace('_', ' ').title()} Number {number_value}.
        
        User Information:
        - Name: {user.full_name}
        - Email: {user.email}
        
        Numerology Profile Context:
        - Life Path Number: {numerology_profile.life_path_number}
        - Destiny Number: {numerology_profile.destiny_number}
        - Soul Urge Number: {numerology_profile.soul_urge_number}
        - Personality Number: {numerology_profile.personality_number}
        - Personal Year Number: {numerology_profile.personal_year_number}
        """
        
        if numerology_profile.karmic_debt_number:
            prompt += f"- Karmic Debt Number: {numerology_profile.karmic_debt_number}\n"
        
        if numerology_profile.hidden_passion_number:
            prompt += f"- Hidden Passion Number: {numerology_profile.hidden_passion_number}\n"
        
        if basic_interpretation:
            prompt += f"\nBasic Interpretation: {basic_interpretation.get('description', '')}\n"
        
        prompt += f"""
        
        Generate a detailed, personalized reading for {number_type.replace('_', ' ').title()} Number {number_value} that includes:
        
        1. **Detailed Interpretation** (300-400 words): A comprehensive explanation of what this number means for this specific person, considering their full numerology profile. Make it personal and relevant.
        
        2. **Career Insights** (150-200 words): How this number influences their career path, suitable professions, work style, and professional strengths.
        
        3. **Relationship Insights** (150-200 words): How this number affects their relationships, communication style, compatibility, and what they seek in partners.
        
        4. **Life Purpose** (100-150 words): The deeper purpose and mission associated with this number for this person.
        
        5. **Challenges and Growth** (150-200 words): Potential challenges, lessons to learn, and opportunities for personal growth.
        
        6. **Personalized Advice** (150-200 words): Actionable, specific advice tailored to this person's numerology profile.
        
        Format your response as JSON with the following structure:
        {{
            "detailed_interpretation": "...",
            "career_insights": "...",
            "relationship_insights": "...",
            "life_purpose": "...",
            "challenges_and_growth": "...",
            "personalized_advice": "..."
        }}
        
        Be specific, empathetic, and provide actionable insights. Reference how this number interacts with their other numerology numbers.
        """
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert numerologist. Provide detailed, personalized numerology readings in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        import json
        ai_response = response.choices[0].message.content
        reading_data = json.loads(ai_response)
        
        # Create or update DetailedReading
        detailed_reading, created = DetailedReading.objects.update_or_create(
            user=user,
            reading_type=number_type,
            number=number_value,
            defaults={
                'detailed_interpretation': reading_data.get('detailed_interpretation', ''),
                'career_insights': reading_data.get('career_insights', ''),
                'relationship_insights': reading_data.get('relationship_insights', ''),
                'life_purpose': reading_data.get('life_purpose', ''),
                'challenges_and_growth': reading_data.get('challenges_and_growth', ''),
                'personalized_advice': reading_data.get('personalized_advice', ''),
                'generated_by_ai': True,
            }
        )
        
        logger.info(f"Generated detailed reading for user {user.id}, type {number_type}, number {number_value}")
        return detailed_reading
        
    except Exception as e:
        logger.error(f"Failed to generate detailed reading: {str(e)}", exc_info=True)
        return None


def generate_all_detailed_readings(user: User) -> Dict[str, Optional[DetailedReading]]:
    """
    Generate detailed readings for all core numerology numbers.
    
    Args:
        user: User instance
        
    Returns:
        Dictionary mapping reading types to DetailedReading instances
    """
    try:
        profile = NumerologyProfile.objects.get(user=user)
    except NumerologyProfile.DoesNotExist:
        logger.error(f"Numerology profile not found for user {user.id}")
        return {}
    
    readings = {}
    
    # Core numbers to generate readings for
    core_numbers = {
        'life_path': profile.life_path_number,
        'destiny': profile.destiny_number,
        'soul_urge': profile.soul_urge_number,
        'personality': profile.personality_number,
    }
    
    # Optional numbers
    if profile.attitude_number:
        core_numbers['attitude'] = profile.attitude_number
    if profile.maturity_number:
        core_numbers['maturity'] = profile.maturity_number
    if profile.balance_number:
        core_numbers['balance'] = profile.balance_number
    
    # Generate readings for each number
    for number_type, number_value in core_numbers.items():
        if number_value:
            reading = generate_detailed_reading(user, number_type, number_value, profile)
            readings[number_type] = reading
    
    return readings

