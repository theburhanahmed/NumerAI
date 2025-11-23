"""
Report generation utilities for NumerAI reports application.
"""
from django.utils import timezone
from datetime import datetime, timedelta
from numerology.interpretations import get_interpretation


def generate_report_content(person, numerology_profile, template):
    """Generate report content based on template type."""
    from .models import ReportTemplate
    
    content = {
        'person_name': person.name,
        'birth_date': person.birth_date.isoformat(),
        'report_type': template.report_type,
        'generated_at': timezone.now().isoformat(),
        'numbers': {
            'life_path': numerology_profile.life_path_number,
            'destiny': numerology_profile.destiny_number,
            'soul_urge': numerology_profile.soul_urge_number,
            'personality': numerology_profile.personality_number,
            'attitude': numerology_profile.attitude_number,
            'maturity': numerology_profile.maturity_number,
            'balance': numerology_profile.balance_number,
            'personal_year': numerology_profile.personal_year_number,
            'personal_month': numerology_profile.personal_month_number,
        }
    }
    
    # Add interpretations for each number
    interpretations = {}
    number_fields = ['life_path', 'destiny', 'soul_urge', 'personality', 
                     'attitude', 'maturity', 'balance', 'personal_year', 'personal_month']
    
    for field in number_fields:
        number_value = getattr(numerology_profile, f'{field}_number')
        try:
            interpretations[field] = get_interpretation(number_value)
        except ValueError:
            interpretations[field] = {
                'number': number_value,
                'title': 'Unknown',
                'description': 'Interpretation not available',
                'strengths': [],
                'challenges': [],
                'career': [],
                'relationships': '',
                'life_purpose': ''
            }
    
    content['interpretations'] = interpretations
    
    # Add template-specific content
    if template.report_type == 'basic':
        content['summary'] = f"This is a basic birth chart for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your numerology report, {person.name}. This basic report provides an overview of your core numbers.",
            'life_path': f"Your Life Path number {numerology_profile.life_path_number} reveals your purpose and direction in life.",
            'destiny': f"Your Destiny number {numerology_profile.destiny_number} shows your talents and potential.",
            'soul_urge': f"Your Soul Urge number {numerology_profile.soul_urge_number} reflects your inner desires and motivations."
        }
    elif template.report_type == 'detailed':
        content['summary'] = f"This is a detailed analysis for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your comprehensive numerology report, {person.name}. This detailed analysis explores all aspects of your numerological profile.",
            'life_path': f"Your Life Path number {numerology_profile.life_path_number} is the most significant number in your chart, revealing your purpose and direction in life.",
            'destiny': f"Your Destiny number {numerology_profile.destiny_number} shows your innate talents and potential that you'll express throughout your lifetime.",
            'soul_urge': f"Your Soul Urge number {numerology_profile.soul_urge_number} reflects your inner desires and motivations that drive you from within.",
            'personality': f"Your Personality number {numerology_profile.personality_number} shows how others perceive you and how you present yourself to the world.",
            'attitude': f"Your Attitude number {numerology_profile.attitude_number} represents your instinctive reaction to new situations and people.",
            'maturity': f"Your Maturity number {numerology_profile.maturity_number} reveals the lessons and wisdom you gain as you grow older.",
            'balance': f"Your Balance number {numerology_profile.balance_number} indicates what you need to balance in your life for harmony.",
            'personal_year': f"Your Personal Year number {numerology_profile.personal_year_number} shows the themes and opportunities for this year.",
            'personal_month': f"Your Personal Month number {numerology_profile.personal_month_number} highlights the energies influencing this month."
        }
    elif template.report_type == 'compatibility':
        content['summary'] = f"This is a compatibility report for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your compatibility report, {person.name}. This analysis focuses on relationship dynamics.",
            'compatibility_numbers': [
                {
                    'number': numerology_profile.life_path_number,
                    'type': 'Life Path',
                    'description': 'Your approach to life and relationships'
                },
                {
                    'number': numerology_profile.destiny_number,
                    'type': 'Destiny',
                    'description': 'Your shared talents and goals'
                },
                {
                    'number': numerology_profile.soul_urge_number,
                    'type': 'Soul Urge',
                    'description': 'Your emotional compatibility'
                }
            ]
        }
    elif template.report_type == 'career':
        content['summary'] = f"Career Guidance Report for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your career guidance report, {person.name}. This analysis explores your professional strengths and opportunities based on your numerological profile.",
            'career_path': f"Your Life Path number {numerology_profile.life_path_number} indicates your natural career inclinations and professional destiny.",
            'talents': f"Your Destiny number {numerology_profile.destiny_number} reveals your innate talents that can be leveraged in your career.",
            'work_style': f"Your Personality number {numerology_profile.personality_number} shows how you present yourself professionally.",
            'timing': f"Your Personal Year number {numerology_profile.personal_year_number} suggests favorable periods for career changes and advancement.",
            'challenges': f"Your Balance number {numerology_profile.balance_number} indicates potential challenges in your professional life that need attention."
        }
        # Add career-specific insights
        content['career_insights'] = {
            'best_industries': interpretations['life_path'].get('career', []),
            'leadership_style': "Based on your numbers, you exhibit a balanced approach to leadership.",
            'networking': "Your communication skills make you well-suited for collaborative environments.",
            'growth_periods': f"Your Personal Year {numerology_profile.personal_year_number} suggests opportunities for professional development."
        }
    elif template.report_type == 'relationship':
        content['summary'] = f"Relationship Analysis Report for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your relationship analysis report, {person.name}. This analysis explores your compatibility patterns and relationship dynamics.",
            'compatibility': f"Your Life Path number {numerology_profile.life_path_number} influences how you approach relationships.",
            'emotional_needs': f"Your Soul Urge number {numerology_profile.soul_urge_number} reveals your deepest emotional needs in relationships.",
            'communication': f"Your Personality number {numerology_profile.personality_number} shows how you express yourself in relationships.",
            'challenges': f"Your Balance number {numerology_profile.balance_number} indicates areas that may need attention in relationships."
        }
        # Add relationship-specific insights
        content['relationship_insights'] = {
            'love_style': interpretations['soul_urge'].get('relationships', ''),
            'communication_patterns': interpretations['personality'].get('relationships', ''),
            'compatibility_with': "Numbers 2, 6, and 9 tend to be most compatible with your profile.",
            'growth_areas': "Focus on developing patience and understanding different perspectives."
        }
    elif template.report_type == 'finance':
        content['summary'] = f"Financial Forecast Report for {person.name}"
        content['sections'] = {
            'overview': f"Welcome to your financial forecast report, {person.name}. This analysis explores your financial patterns and opportunities.",
            'money_mindset': f"Your Life Path number {numerology_profile.life_path_number} influences your approach to money and financial decisions.",
            'earning_potential': f"Your Destiny number {numerology_profile.destiny_number} reveals your natural talents for generating wealth.",
            'spending_habits': f"Your Personality number {numerology_profile.personality_number} shows how you tend to spend and save.",
            'timing': f"Your Personal Year number {numerology_profile.personal_year_number} suggests favorable periods for financial investments."
        }
        # Add finance-specific insights
        content['financial_insights'] = {
            'best_months': "Based on your Personal Month numbers, months 3, 6, and 9 are favorable for financial activities.",
            'investment_style': "Your numbers suggest a balanced approach to investments with moderate risk tolerance.",
            'wealth_building': f"Focus on opportunities related to your Life Path number {numerology_profile.life_path_number} for wealth generation.",
            'pitfalls': "Avoid impulsive financial decisions, especially during challenging Personal Month periods."
        }
    elif template.report_type == 'weekly':
        from datetime import datetime, timedelta
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        content['summary'] = f"Weekly Guidance Report for {person.name} ({week_start.strftime('%b %d')} - {week_end.strftime('%b %d, %Y')})"
        content['sections'] = {
            'overview': f"Welcome to your weekly guidance report, {person.name}. This analysis provides insights for the week ahead.",
            'energy_tone': f"Your Personal Month number {numerology_profile.personal_month_number} sets the overall tone for this week.",
            'focus_areas': "Based on your numbers, focus on personal growth and relationship building this week.",
            'opportunities': "Look for opportunities to express your creativity and connect with others.",
            'challenges': "Be mindful of potential communication misunderstandings this week."
        }
        # Add weekly-specific insights
        content['weekly_insights'] = {
            'best_days': "Tuesday and Thursday are particularly favorable days this week.",
            'activities': "Focus on collaborative projects and creative endeavors.",
            'health_focus': "Pay attention to stress management and maintaining work-life balance.",
            'affirmation': f"This week, remember: {interpretations['life_path'].get('description', 'Trust your journey')}"
        }
    elif template.report_type == 'monthly':
        from datetime import datetime
        today = datetime.now().date()
        
        content['summary'] = f"Monthly Guidance Report for {person.name} ({today.strftime('%B %Y')})"
        content['sections'] = {
            'overview': f"Welcome to your monthly guidance report, {person.name}. This analysis provides insights for the month ahead.",
            'monthly_theme': f"Your Personal Month number {numerology_profile.personal_month_number} defines the primary theme for this month.",
            'focus_areas': "Based on your numbers, focus on personal development and new beginnings this month.",
            'opportunities': "Look for opportunities to start new projects and strengthen important relationships.",
            'challenges': "Be mindful of potential obstacles related to decision-making this month."
        }
        # Add monthly-specific insights
        content['monthly_insights'] = {
            'best_weeks': "Weeks 2 and 4 are particularly favorable for taking action on important goals.",
            'activities': "Focus on strategic planning and long-term vision development.",
            'health_focus': "Prioritize self-care and maintaining healthy routines.",
            'affirmation': f"This month, embrace: {interpretations['destiny'].get('description', 'Your unique talents')}"
        }
    elif template.report_type == 'yearly':
        from datetime import datetime
        today = datetime.now().date()
        
        content['summary'] = f"Yearly Forecast Report for {person.name} ({today.strftime('%Y')})"
        content['sections'] = {
            'overview': f"Welcome to your yearly forecast report, {person.name}. This analysis provides insights for the year ahead.",
            'yearly_theme': f"Your Personal Year number {numerology_profile.personal_year_number} defines the primary theme for this year.",
            'focus_areas': "Based on your numbers, focus on transformation and personal empowerment this year.",
            'opportunities': "Look for opportunities to make significant life changes and pursue long-term goals.",
            'challenges': "Be prepared for periods of intense growth that may feel challenging but are ultimately beneficial."
        }
        # Add yearly-specific insights
        content['yearly_insights'] = {
            'best_seasons': "Spring and Fall are particularly favorable for major initiatives.",
            'activities': "Focus on personal reinvention and building a strong foundation for future success.",
            'health_focus': "Maintain consistent wellness practices and be patient with your personal transformation process.",
            'affirmation': f"This year, trust: {interpretations['life_path'].get('life_purpose', 'Your life purpose')}"
        }
    # Add more template types as needed
    
    return content