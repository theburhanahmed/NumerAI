"""
Subscription feature constants for numerology reports.
"""
SUBSCRIPTION_FEATURES = {
    'free': {
        'birth_date_numerology': True,
        'basic_interpretations': True,
        'name_numerology': False,
        'phone_numerology': False,
        'lo_shu_grid': False,
        'rectification_suggestions': False,
        'detailed_analysis': False,
        'compatibility_insights': False,
        'raj_yog_analysis': False,
        'yearly_forecast': False,
        'expert_recommendations': False,
    },
    'basic': {
        'birth_date_numerology': True,
        'basic_interpretations': True,
        'name_numerology': True,
        'phone_numerology': False,
        'lo_shu_grid': True,
        'rectification_suggestions': True,  # Limited
        'detailed_analysis': False,
        'compatibility_insights': False,
        'raj_yog_analysis': False,
        'yearly_forecast': False,
        'expert_recommendations': False,
    },
    'premium': {
        'birth_date_numerology': True,
        'basic_interpretations': True,
        'name_numerology': True,
        'phone_numerology': True,
        'lo_shu_grid': True,
        'rectification_suggestions': True,  # Full
        'detailed_analysis': True,
        'compatibility_insights': True,
        'raj_yog_analysis': False,
        'yearly_forecast': False,
        'expert_recommendations': False,
    },
    'elite': {
        # All features unlocked
        'birth_date_numerology': True,
        'basic_interpretations': True,
        'name_numerology': True,
        'phone_numerology': True,
        'lo_shu_grid': True,
        'rectification_suggestions': True,  # Full + Advanced
        'detailed_analysis': True,
        'compatibility_insights': True,
        'raj_yog_analysis': True,
        'yearly_forecast': True,
        'expert_recommendations': True,
    }
}

# Feature priority levels for rectification suggestions
REMEDY_PRIORITY_LEVELS = {
    'high': 'High Priority - Address these first',
    'medium': 'Medium Priority - Important for balance',
    'low': 'Low Priority - General recommendations'
}










