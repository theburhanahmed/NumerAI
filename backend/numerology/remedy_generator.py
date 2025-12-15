"""
Rectification suggestions generator for numerology reports.
Generates personalized remedies based on numerology analysis.
"""
from typing import Dict, List, Optional, Any
from .models import NumerologyProfile, NameReport, PhoneReport
from .subscription_utils import get_user_subscription_tier


def generate_rectification_suggestions(
    profile: NumerologyProfile,
    name_report: Optional[NameReport] = None,
    phone_report: Optional[PhoneReport] = None,
    subscription_tier: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generate rectification suggestions based on numerology analysis.
    
    Args:
        profile: NumerologyProfile instance
        name_report: Optional NameReport instance
        phone_report: Optional PhoneReport instance
        subscription_tier: Optional subscription tier (if None, will be limited)
        
    Returns:
        List of rectification suggestions with priority levels
    """
    suggestions = []
    
    # Analyze Lo Shu Grid for missing numbers
    if profile.lo_shu_grid:
        missing_numbers = profile.lo_shu_grid.get('missing_numbers', [])
        if missing_numbers:
            suggestions.extend(_generate_missing_number_remedies(missing_numbers))
    
    # Analyze karmic debt numbers
    if profile.karmic_debt_number:
        suggestions.extend(_generate_karmic_debt_remedies(profile.karmic_debt_number))
    
    # Analyze challenges from number interpretations
    suggestions.extend(_generate_challenge_remedies(profile))
    
    # Generate general balance remedies
    suggestions.extend(_generate_balance_remedies(profile))
    
    # If subscription tier allows, add advanced suggestions
    if subscription_tier in ['premium', 'elite']:
        if name_report:
            suggestions.extend(_generate_name_based_remedies(name_report))
        if phone_report:
            suggestions.extend(_generate_phone_based_remedies(phone_report))
    
    # Sort by priority
    priority_order = {'high': 0, 'medium': 1, 'low': 2}
    suggestions.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 2))
    
    return suggestions


def _generate_missing_number_remedies(missing_numbers: List[int]) -> List[Dict[str, Any]]:
    """Generate remedies for missing numbers in Lo Shu Grid."""
    suggestions = []
    
    number_remedies = {
        1: {
            'gemstone': {'name': 'Ruby', 'description': 'Enhances leadership and independence', 'recommendation': 'Wear as a ring on Sunday'},
            'color': {'name': 'Red', 'description': 'Boosts energy and confidence', 'recommendation': 'Incorporate red in clothing or decor'},
            'mantra': {'name': 'Om Hum', 'description': 'Enhances leadership qualities', 'recommendation': 'Chant 108 times on Sundays'},
        },
        2: {
            'gemstone': {'name': 'Pearl', 'description': 'Promotes harmony and cooperation', 'recommendation': 'Wear as a pendant on Monday'},
            'color': {'name': 'Silver/White', 'description': 'Brings peace and balance', 'recommendation': 'Incorporate silver/white in accessories'},
            'mantra': {'name': 'Om Shantih', 'description': 'Promotes peace and harmony', 'recommendation': 'Chant 108 times on Mondays'},
        },
        3: {
            'gemstone': {'name': 'Yellow Sapphire', 'description': 'Boosts creativity and communication', 'recommendation': 'Wear as a ring on Thursday'},
            'color': {'name': 'Yellow', 'description': 'Enhances creativity and joy', 'recommendation': 'Incorporate yellow in clothing'},
            'mantra': {'name': 'Om Aim', 'description': 'Enhances creative expression', 'recommendation': 'Chant 108 times on Thursdays'},
        },
        4: {
            'gemstone': {'name': 'Emerald', 'description': 'Brings stability and structure', 'recommendation': 'Wear as a pendant on Wednesday'},
            'color': {'name': 'Green', 'description': 'Promotes growth and stability', 'recommendation': 'Incorporate green in home decor'},
            'mantra': {'name': 'Om Hrim', 'description': 'Brings stability and focus', 'recommendation': 'Chant 108 times on Wednesdays'},
        },
        5: {
            'gemstone': {'name': 'Peridot', 'description': 'Enhances freedom and adaptability', 'recommendation': 'Wear as a ring on Wednesday'},
            'color': {'name': 'Orange', 'description': 'Promotes change and adventure', 'recommendation': 'Incorporate orange in clothing'},
            'mantra': {'name': 'Om Pim', 'description': 'Enhances adaptability', 'recommendation': 'Chant 108 times on Wednesdays'},
        },
        6: {
            'gemstone': {'name': 'Pink Tourmaline', 'description': 'Attracts love and harmony', 'recommendation': 'Wear as a pendant on Friday'},
            'color': {'name': 'Pink', 'description': 'Promotes love and compassion', 'recommendation': 'Incorporate pink in clothing or decor'},
            'mantra': {'name': 'Om Shrim', 'description': 'Attracts love and harmony', 'recommendation': 'Chant 108 times on Fridays'},
        },
        7: {
            'gemstone': {'name': 'Amethyst', 'description': 'Enhances intuition and wisdom', 'recommendation': 'Wear as a ring on Saturday'},
            'color': {'name': 'Purple', 'description': 'Promotes spirituality and wisdom', 'recommendation': 'Incorporate purple in clothing'},
            'mantra': {'name': 'Om Aum', 'description': 'Enhances intuition', 'recommendation': 'Chant 108 times on Saturdays'},
        },
        8: {
            'gemstone': {'name': 'Diamond', 'description': 'Brings success and abundance', 'recommendation': 'Wear as a ring on Saturday'},
            'color': {'name': 'White/Gold', 'description': 'Promotes success and clarity', 'recommendation': 'Incorporate white/gold in accessories'},
            'mantra': {'name': 'Om Mahalakshmiyei Swaha', 'description': 'Brings abundance', 'recommendation': 'Chant 108 times on Saturdays'},
        },
        9: {
            'gemstone': {'name': 'Bloodstone', 'description': 'Enhances compassion and healing', 'recommendation': 'Wear as a pendant on Tuesday'},
            'color': {'name': 'Blue', 'description': 'Promotes compassion and service', 'recommendation': 'Incorporate blue in clothing'},
            'mantra': {'name': 'Om Mani Padme Hum', 'description': 'Enhances compassion', 'recommendation': 'Chant 108 times on Tuesdays'},
        },
    }
    
    for number in missing_numbers:
        if number in number_remedies:
            remedies = number_remedies[number]
            
            # Gemstone suggestion
            suggestions.append({
                'type': 'gemstone',
                'title': f'{remedies["gemstone"]["name"]} for Missing Number {number}',
                'description': f'Number {number} is missing from your Lo Shu Grid. {remedies["gemstone"]["description"]}',
                'recommendation': remedies['gemstone']['recommendation'],
                'priority': 'high',
                'reason': f'Missing number {number} in Lo Shu Grid',
            })
            
            # Color suggestion
            suggestions.append({
                'type': 'color',
                'title': f'{remedies["color"]["name"]} Color Therapy for Number {number}',
                'description': f'Incorporate {remedies["color"]["name"].lower()} to balance missing number {number}',
                'recommendation': remedies['color']['recommendation'],
                'priority': 'medium',
                'reason': f'Missing number {number} in Lo Shu Grid',
            })
            
            # Mantra suggestion
            suggestions.append({
                'type': 'mantra',
                'title': f'{remedies["mantra"]["name"]} Mantra for Number {number}',
                'description': remedies['mantra']['description'],
                'recommendation': remedies['mantra']['recommendation'],
                'priority': 'medium',
                'reason': f'Missing number {number} in Lo Shu Grid',
            })
    
    return suggestions


def _generate_karmic_debt_remedies(karmic_debt_number: int) -> List[Dict[str, Any]]:
    """Generate remedies for karmic debt numbers."""
    suggestions = []
    
    karmic_remedies = {
        13: {
            'description': 'Karmic Debt 13 indicates past misuse of power. Focus on service and humility.',
            'ritual': 'Practice daily acts of service to others. Volunteer or help those in need.',
            'mantra': 'Chant "Om Namah Shivaya" 108 times daily for transformation.',
            'color': 'Wear or surround yourself with deep blue to promote transformation.',
        },
        14: {
            'description': 'Karmic Debt 14 suggests past misuse of freedom. Focus on discipline and responsibility.',
            'ritual': 'Establish a daily routine and stick to it. Practice self-discipline.',
            'mantra': 'Chant "Om Hrim" 108 times daily for stability.',
            'color': 'Incorporate green in your environment for grounding.',
        },
        16: {
            'description': 'Karmic Debt 16 indicates past misuse of ego. Focus on humility and spiritual growth.',
            'ritual': 'Practice meditation and self-reflection daily. Let go of ego attachments.',
            'mantra': 'Chant "Om Aum" 108 times daily for spiritual awakening.',
            'color': 'Use purple in your meditation space for spiritual connection.',
        },
        19: {
            'description': 'Karmic Debt 19 suggests past misuse of power over others. Focus on leadership through service.',
            'ritual': 'Lead by example through service. Practice humility in leadership.',
            'mantra': 'Chant "Om Gam Ganapataye Namaha" 108 times daily to remove obstacles.',
            'color': 'Incorporate white or gold for purity and leadership.',
        },
    }
    
    if karmic_debt_number in karmic_remedies:
        remedy = karmic_remedies[karmic_debt_number]
        
        suggestions.append({
            'type': 'ritual',
            'title': f'Karmic Debt {karmic_debt_number} - Ritual Practice',
            'description': remedy['description'],
            'recommendation': remedy['ritual'],
            'priority': 'high',
            'reason': f'Karmic debt number {karmic_debt_number}',
        })
        
        suggestions.append({
            'type': 'mantra',
            'title': f'Karmic Debt {karmic_debt_number} - Mantra Practice',
            'description': f'Transform karmic patterns through mantra practice.',
            'recommendation': remedy['mantra'],
            'priority': 'high',
            'reason': f'Karmic debt number {karmic_debt_number}',
        })
        
        suggestions.append({
            'type': 'color',
            'title': f'Karmic Debt {karmic_debt_number} - Color Therapy',
            'description': 'Use color to support karmic transformation.',
            'recommendation': remedy['color'],
            'priority': 'medium',
            'reason': f'Karmic debt number {karmic_debt_number}',
        })
    
    return suggestions


def _generate_challenge_remedies(profile: NumerologyProfile) -> List[Dict[str, Any]]:
    """Generate remedies based on challenging number combinations."""
    suggestions = []
    
    # Check for challenging combinations
    life_path = profile.life_path_number
    destiny = profile.destiny_number
    
    # If life path and destiny are the same, suggest balance
    if life_path == destiny:
        suggestions.append({
            'type': 'ritual',
            'title': 'Balance Life Path and Destiny',
            'description': 'Your Life Path and Destiny numbers are the same, indicating a need for balance between inner and outer expression.',
            'recommendation': 'Practice activities that balance your inner desires with outer expression. Try journaling and creative expression.',
            'priority': 'medium',
            'reason': 'Life Path and Destiny numbers are identical',
        })
    
    # Check for master numbers that need special attention
    if life_path in [11, 22, 33]:
        suggestions.append({
            'type': 'ritual',
            'title': f'Master Number {life_path} - Spiritual Practice',
            'description': f'Master Number {life_path} requires special spiritual attention and service to others.',
            'recommendation': 'Dedicate time daily to spiritual practice and service. Avoid material attachments.',
            'priority': 'high',
            'reason': f'Master number {life_path} in Life Path',
        })
    
    # Balance number recommendations
    if profile.balance_number:
        balance_remedies = {
            1: 'Practice independence while maintaining connections with others.',
            2: 'Balance cooperation with personal needs. Set healthy boundaries.',
            3: 'Balance creative expression with practical responsibilities.',
            4: 'Balance structure with flexibility. Allow for spontaneity.',
            5: 'Balance freedom with commitment. Find stability in change.',
            6: 'Balance service to others with self-care.',
            7: 'Balance solitude with social connection.',
            8: 'Balance material success with spiritual growth.',
            9: 'Balance giving with receiving. Practice self-compassion.',
        }
        
        if profile.balance_number in balance_remedies:
            suggestions.append({
                'type': 'ritual',
                'title': f'Balance Number {profile.balance_number} - Daily Practice',
                'description': f'Your Balance Number {profile.balance_number} indicates what needs balancing in your life.',
                'recommendation': balance_remedies[profile.balance_number],
                'priority': 'medium',
                'reason': f'Balance number {profile.balance_number}',
            })
    
    return suggestions


def _generate_balance_remedies(profile: NumerologyProfile) -> List[Dict[str, Any]]:
    """Generate general balance remedies based on profile."""
    suggestions = []
    
    # Dietary recommendations based on life path
    dietary_recommendations = {
        1: 'Include protein-rich foods and spicy foods for energy. Avoid excessive caffeine.',
        2: 'Focus on dairy products and fruits. Avoid overly spicy or acidic foods.',
        3: 'Include colorful fruits and vegetables. Add natural sweeteners like honey.',
        4: 'Focus on root vegetables, grains, and hearty foods. Eat regular meals.',
        5: 'Include variety in your diet. Try new foods regularly.',
        6: 'Include heart-healthy foods like berries, dark chocolate, and leafy greens.',
        7: 'Focus on light, pure foods. Include fish, nuts, and fresh herbs.',
        8: 'Include foods that support energy and focus like green tea and whole grains.',
        9: 'Focus on plant-based foods and cleansing foods like lemon water.',
    }
    
    if profile.life_path_number in dietary_recommendations:
        suggestions.append({
            'type': 'dietary',
            'title': f'Dietary Recommendations for Life Path {profile.life_path_number}',
            'description': 'Food choices that support your life path energy.',
            'recommendation': dietary_recommendations[profile.life_path_number],
            'priority': 'low',
            'reason': f'Life Path number {profile.life_path_number}',
        })
    
    # Exercise recommendations based on attitude number
    exercise_recommendations = {
        1: 'High-energy activities like running, martial arts, or competitive sports.',
        2: 'Partner activities like dancing, tennis, or yoga classes.',
        3: 'Expressive activities like dance, aerobics, or group fitness classes.',
        4: 'Structured activities like weight training, hiking, or regular gym routines.',
        5: 'Varied activities like cycling, swimming, or outdoor adventures.',
        6: 'Activities that connect you with others like group sports or community walks.',
        7: 'Mindful activities like yoga, tai chi, or meditation walks.',
        8: 'Goal-oriented activities like personal training or competitive sports.',
        9: 'Activities that serve others like charity runs or community sports.',
    }
    
    if profile.attitude_number in exercise_recommendations:
        suggestions.append({
            'type': 'exercise',
            'title': f'Exercise Recommendations for Attitude Number {profile.attitude_number}',
            'description': 'Physical activities that align with your natural attitude.',
            'recommendation': exercise_recommendations[profile.attitude_number],
            'priority': 'low',
            'reason': f'Attitude number {profile.attitude_number}',
        })
    
    return suggestions


def _generate_name_based_remedies(name_report: NameReport) -> List[Dict[str, Any]]:
    """Generate remedies based on name numerology analysis."""
    suggestions = []
    
    if not name_report.numbers:
        return suggestions
    
    # Analyze name numbers
    expression = name_report.numbers.get('expression', {}).get('reduced', 0)
    soul_urge = name_report.numbers.get('soul_urge', {}).get('reduced', 0)
    
    # If expression and soul urge are very different, suggest alignment
    if abs(expression - soul_urge) >= 5:
        suggestions.append({
            'type': 'ritual',
            'title': 'Align Expression with Soul Urge',
            'description': 'Your name expression and soul urge numbers are significantly different, suggesting a need for alignment.',
            'recommendation': 'Practice activities that connect your inner desires with your outer expression. Consider meditation and self-reflection.',
            'priority': 'medium',
            'reason': 'Large difference between expression and soul urge numbers',
        })
    
    return suggestions


def _generate_phone_based_remedies(phone_report: PhoneReport) -> List[Dict[str, Any]]:
    """Generate remedies based on phone numerology analysis."""
    suggestions = []
    
    if not phone_report.computed:
        return suggestions
    
    core_number = phone_report.computed.get('core_number', {}).get('reduced', 0)
    
    # If core number is challenging, suggest remedies
    if core_number in [4, 7, 8]:
        suggestions.append({
            'type': 'ritual',
            'title': f'Phone Number Core {core_number} - Energy Balancing',
            'description': f'Your phone number core is {core_number}, which may need balancing through specific practices.',
            'recommendation': 'Use your phone mindfully. Set specific times for calls and avoid excessive use.',
            'priority': 'low',
            'reason': f'Phone number core {core_number}',
        })
    
    return suggestions












