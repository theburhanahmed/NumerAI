"""
Daily reading content generator for NumerAI.
Enhanced with personalization based on user numerology profiles.
"""
from typing import Dict, List, Any
from datetime import date
import random
from .numerology import NumerologyCalculator
from .interpretations import get_interpretation


class DailyReadingGenerator:
    """Generate daily reading content based on personal day number and user profile."""
    
    # Lucky colors for each number
    LUCKY_COLORS = {
        1: ["Red", "Orange", "Gold"],
        2: ["White", "Cream", "Light Blue"],
        3: ["Yellow", "Pink", "Purple"],
        4: ["Green", "Brown", "Earth tones"],
        5: ["Silver", "Grey", "Turquoise"],
        6: ["Blue", "Indigo", "Rose"],
        7: ["Violet", "Purple", "Lavender"],
        8: ["Black", "Dark Blue", "Charcoal"],
        9: ["Gold", "Crimson", "Burgundy"],
    }
    
    # Auspicious times for each number
    AUSPICIOUS_TIMES = {
        1: ["6-8 AM", "12-2 PM", "6-8 PM"],
        2: ["7-9 AM", "1-3 PM", "7-9 PM"],
        3: ["8-10 AM", "2-4 PM", "8-10 PM"],
        4: ["9-11 AM", "3-5 PM", "9-11 PM"],
        5: ["10 AM-12 PM", "4-6 PM", "10 PM-12 AM"],
        6: ["11 AM-1 PM", "5-7 PM", "11 PM-1 AM"],
        7: ["5-7 AM", "11 AM-1 PM", "5-7 PM"],
        8: ["6-8 AM", "12-2 PM", "6-8 PM"],
        9: ["7-9 AM", "1-3 PM", "7-9 PM"],
    }
    
    # Activity recommendations
    ACTIVITIES = {
        1: [
            "Start a new project or initiative",
            "Take leadership in a group activity",
            "Make important decisions independently",
            "Set new personal goals",
            "Assert yourself in a challenging situation"
        ],
        2: [
            "Collaborate with others on a project",
            "Practice active listening",
            "Mediate a conflict between friends",
            "Spend quality time with a partner",
            "Join a group activity or class"
        ],
        3: [
            "Express yourself creatively through art or writing",
            "Socialize and network with new people",
            "Share your ideas in a meeting",
            "Attend a cultural event or performance",
            "Start a creative hobby"
        ],
        4: [
            "Organize your workspace or home",
            "Create a detailed plan for a project",
            "Focus on completing pending tasks",
            "Review and update your budget",
            "Build or repair something practical"
        ],
        5: [
            "Try something new and adventurous",
            "Travel or explore a new place",
            "Meet new people from different backgrounds",
            "Learn a new skill or hobby",
            "Break from routine and be spontaneous"
        ],
        6: [
            "Spend time with family and loved ones",
            "Help someone in need",
            "Beautify your living space",
            "Cook a healthy meal for yourself or others",
            "Practice self-care and nurturing"
        ],
        7: [
            "Meditate or practice mindfulness",
            "Study or research a topic of interest",
            "Spend time in nature alone",
            "Journal about your thoughts and feelings",
            "Seek spiritual or philosophical insights"
        ],
        8: [
            "Focus on career goals and advancement",
            "Make important financial decisions",
            "Network with influential people",
            "Take charge of a business matter",
            "Invest in your future success"
        ],
        9: [
            "Volunteer or help a charitable cause",
            "Let go of something that no longer serves you",
            "Practice forgiveness and compassion",
            "Share your wisdom with others",
            "Complete unfinished projects"
        ],
    }
    
    # Warnings
    WARNINGS = {
        1: [
            "Avoid being overly aggressive or domineering",
            "Don't let ego cloud your judgment",
            "Be patient with others' slower pace",
            "Avoid impulsive decisions",
            "Don't isolate yourself from help"
        ],
        2: [
            "Don't be overly dependent on others",
            "Avoid being too passive or indecisive",
            "Don't take criticism too personally",
            "Set healthy boundaries",
            "Avoid people-pleasing at your expense"
        ],
        3: [
            "Don't scatter your energy too thin",
            "Avoid superficial conversations",
            "Be mindful of overspending",
            "Don't neglect serious responsibilities",
            "Avoid gossip and drama"
        ],
        4: [
            "Don't be too rigid or inflexible",
            "Avoid overworking yourself",
            "Be open to new methods",
            "Don't resist necessary changes",
            "Avoid being overly critical"
        ],
        5: [
            "Don't be reckless or irresponsible",
            "Avoid making hasty commitments",
            "Be mindful of overindulgence",
            "Don't neglect important obligations",
            "Avoid restlessness and impatience"
        ],
        6: [
            "Don't take on too much responsibility",
            "Avoid being overly controlling",
            "Don't neglect your own needs",
            "Set realistic expectations",
            "Avoid martyrdom and self-sacrifice"
        ],
        7: [
            "Don't isolate yourself too much",
            "Avoid over-analyzing situations",
            "Don't be overly skeptical",
            "Share your insights with others",
            "Avoid perfectionism"
        ],
        8: [
            "Don't prioritize work over relationships",
            "Avoid being too controlling",
            "Be mindful of materialism",
            "Don't neglect your health",
            "Avoid ruthless behavior"
        ],
        9: [
            "Don't give more than you can afford",
            "Avoid emotional manipulation",
            "Let go of what's already gone",
            "Don't neglect practical matters",
            "Avoid martyrdom"
        ],
    }
    
    # Affirmations
    AFFIRMATIONS = {
        1: [
            "I am a confident leader, capable of achieving my goals",
            "I trust my ability to make the right decisions",
            "I embrace new beginnings with courage",
            "I am independent and self-reliant",
            "I have the power to create my own reality"
        ],
        2: [
            "I am a peacemaker, bringing harmony wherever I go",
            "I trust my intuition to guide me",
            "I am patient and understanding with others",
            "I create balanced and loving relationships",
            "I am valuable and my contributions matter"
        ],
        3: [
            "I express myself freely and creatively",
            "I bring joy and inspiration to others",
            "I am optimistic about my future",
            "I communicate my truth with confidence",
            "I embrace my creative gifts"
        ],
        4: [
            "I am building a solid foundation for my future",
            "I am disciplined and focused on my goals",
            "I create stability and security in my life",
            "I am reliable and trustworthy",
            "I accomplish what I set out to do"
        ],
        5: [
            "I embrace change and welcome new experiences",
            "I am free to explore and discover",
            "I adapt easily to new situations",
            "I live life to the fullest",
            "I am versatile and resourceful"
        ],
        6: [
            "I nurture myself and others with love",
            "I create harmony and beauty in my environment",
            "I am responsible and caring",
            "I give and receive love freely",
            "I am a source of comfort and support"
        ],
        7: [
            "I trust my inner wisdom and intuition",
            "I seek truth and understanding",
            "I am connected to my spiritual nature",
            "I find peace in solitude and reflection",
            "I am wise and insightful"
        ],
        8: [
            "I am successful and abundant",
            "I use my power wisely and responsibly",
            "I achieve my goals with confidence",
            "I create prosperity in all areas of my life",
            "I am a capable and effective leader"
        ],
        9: [
            "I am compassionate and understanding",
            "I release what no longer serves me",
            "I serve humanity with love and wisdom",
            "I forgive myself and others",
            "I am complete and whole"
        ],
    }
    
    # Actionable tips
    TIPS = {
        1: [
            "Write down one goal and take the first step today",
            "Practice assertive communication in one conversation",
            "Do something independently that you've been postponing",
            "Lead by example in a small way",
            "Make one decision without seeking others' approval"
        ],
        2: [
            "Reach out to someone and offer your support",
            "Practice saying 'yes' to collaboration opportunities",
            "Listen more than you speak in conversations today",
            "Find common ground in a disagreement",
            "Express appreciation to someone who helps you"
        ],
        3: [
            "Create something artistic, even if just for 15 minutes",
            "Share a positive message on social media",
            "Compliment three people genuinely today",
            "Wear something colorful that makes you feel good",
            "Start a conversation with someone new"
        ],
        4: [
            "Complete one task you've been avoiding",
            "Organize one area of your space",
            "Create a to-do list and prioritize tasks",
            "Review your budget or financial goals",
            "Establish one new productive routine"
        ],
        5: [
            "Try a new restaurant or cuisine",
            "Take a different route to work or home",
            "Learn one new fact or skill today",
            "Say yes to an unexpected opportunity",
            "Do something spontaneous"
        ],
        6: [
            "Call or visit a family member",
            "Do something kind for someone without being asked",
            "Prepare a healthy meal with love",
            "Spend 30 minutes on self-care",
            "Create a more beautiful space in your home"
        ],
        7: [
            "Meditate for at least 10 minutes",
            "Read something philosophical or spiritual",
            "Spend time alone in nature",
            "Journal about a question you're pondering",
            "Research a topic that fascinates you"
        ],
        8: [
            "Take one action toward a career goal",
            "Review and adjust your financial plan",
            "Network with one influential person",
            "Delegate a task to someone capable",
            "Invest time in professional development"
        ],
        9: [
            "Donate time, money, or resources to a cause",
            "Let go of one grudge or resentment",
            "Share your knowledge with someone who needs it",
            "Complete and close one chapter of your life",
            "Practice random acts of kindness"
        ],
    }
    
    # Personalized activities based on numerology numbers
    PERSONALIZED_ACTIVITIES = {
        'life_path': {
            1: ["Focus on leadership opportunities today", "Start a new initiative that aligns with your goals"],
            2: ["Seek harmony in your relationships", "Practice active listening with loved ones"],
            3: ["Express your creativity through writing or art", "Share your ideas with confidence"],
            4: ["Build structure in your daily routine", "Focus on completing long-term projects"],
            5: ["Embrace change and new experiences", "Step out of your comfort zone"],
            6: ["Nurture your relationships", "Create beauty in your environment"],
            7: ["Spend time in quiet reflection", "Pursue knowledge or spiritual growth"],
            8: ["Focus on career advancement", "Make strategic financial decisions"],
            9: ["Serve others through volunteering", "Let go of what no longer serves you"],
            11: ["Trust your intuitive insights", "Share your spiritual wisdom"],
            22: ["Work on your grand vision", "Build something that serves humanity"],
            33: ["Express unconditional love", "Help others heal and grow"]
        },
        'destiny': {
            1: ["Express your unique talents boldly", "Take initiative in creative projects"],
            2: ["Collaborate on meaningful projects", "Bring people together"],
            3: ["Share your creative gifts with the world", "Communicate your vision"],
            4: ["Build lasting systems or structures", "Focus on practical achievements"],
            5: ["Embrace your adaptable nature", "Explore new ways of self-expression"],
            6: ["Use your gifts to nurture others", "Create harmony in your community"],
            7: ["Share your wisdom and insights", "Pursue deeper understanding"],
            8: ["Express your leadership abilities", "Use your talents for success"],
            9: ["Serve humanity through your gifts", "Express universal love"],
            11: ["Share your inspirational insights", "Help others see new possibilities"],
            22: ["Manifest your grand vision", "Create something that benefits many"],
            33: ["Teach through compassionate service", "Heal through unconditional love"]
        }
    }
    
    # Personalized affirmations based on numerology numbers
    PERSONALIZED_AFFIRMATIONS = {
        'life_path': {
            1: ["I lead with confidence and courage", "My vision creates reality"],
            2: ["I create harmony in all my relationships", "My intuition guides me to peace"],
            3: ["I express my creativity with joy", "My communication inspires others"],
            4: ["I build solid foundations for my future", "My discipline creates lasting success"],
            5: ["I embrace change with enthusiasm", "My adaptability is my strength"],
            6: ["I nurture love and beauty in my world", "My compassion heals relationships"],
            7: ["I seek truth and wisdom within", "My inner knowing guides me"],
            8: ["I attract abundance through my efforts", "My leadership creates prosperity"],
            9: ["I serve with unconditional love", "My compassion transforms the world"],
            11: ["I illuminate the path for others", "My intuition connects me to divine wisdom"],
            22: ["I manifest my vision into reality", "My purpose serves humanity"],
            33: ["I embody unconditional love", "My service heals and uplifts"]
        }
    }
    
    @classmethod
    def generate_reading(cls, personal_day_number: int) -> Dict[str, Any]:
        """
        Generate daily reading content.
        
        Args:
            personal_day_number: Personal day number (1-9)
        
        Returns:
            Dictionary with reading content
        """
        # Normalize to 1-9
        if personal_day_number > 9:
            personal_day_number = personal_day_number % 9
            if personal_day_number == 0:
                personal_day_number = 9
        
        # Generate lucky number (different from personal day number)
        lucky_numbers = [n for n in range(1, 10) if n != personal_day_number]
        lucky_number = random.choice(lucky_numbers)
        
        return {
            'lucky_number': lucky_number,  # Return as integer, not string
            'lucky_color': random.choice(cls.LUCKY_COLORS[personal_day_number]),
            'auspicious_time': random.choice(cls.AUSPICIOUS_TIMES[personal_day_number]),
            'activity_recommendation': random.choice(cls.ACTIVITIES[personal_day_number]),
            'warning': random.choice(cls.WARNINGS[personal_day_number]),
            'affirmation': random.choice(cls.AFFIRMATIONS[personal_day_number]),
            'actionable_tip': random.choice(cls.TIPS[personal_day_number]),
        }
    
    @classmethod
    def generate_personalized_reading(cls, personal_day_number: int, user_profile: Dict) -> Dict[str, Any]:
        """
        Generate personalized daily reading content based on user's numerology profile.
        
        Args:
            personal_day_number: Personal day number (1-9)
            user_profile: Dictionary containing user's numerology numbers
        
        Returns:
            Dictionary with personalized reading content
        """
        # Normalize to 1-9
        if personal_day_number > 9:
            personal_day_number = personal_day_number % 9
            if personal_day_number == 0:
                personal_day_number = 9
        
        # Generate lucky number (different from personal day number)
        lucky_numbers = [n for n in range(1, 10) if n != personal_day_number]
        lucky_number = random.choice(lucky_numbers)
        
        # Get base reading
        base_reading = cls.generate_reading(personal_day_number)
        
        # Personalize based on user profile
        personalized_elements = {}
        
        # Add personalized activity if available
        life_path = user_profile.get('life_path_number')
        if life_path and 'life_path' in cls.PERSONALIZED_ACTIVITIES:
            life_path_activities = cls.PERSONALIZED_ACTIVITIES['life_path'].get(life_path)
            if life_path_activities:
                personalized_elements['personalized_activity'] = random.choice(life_path_activities)
        
        # Add personalized affirmation if available
        if life_path and 'life_path' in cls.PERSONALIZED_AFFIRMATIONS:
            life_path_affirmations = cls.PERSONALIZED_AFFIRMATIONS['life_path'].get(life_path)
            if life_path_affirmations:
                personalized_elements['personalized_affirmation'] = random.choice(life_path_affirmations)
        
        # Add life path insight
        if life_path:
            try:
                interpretation = get_interpretation(life_path)
                personalized_elements['life_path_insight'] = f"As a {interpretation['title']}, {random.choice(interpretation['strengths'])} will be particularly beneficial today."
            except Exception as e:
                # Log the exception for debugging purposes
                import logging
                logging.warning(f"Failed to get interpretation for life path {life_path}: {str(e)}")
                # Continue without the life path insight
                pass
        
        # Combine base reading with personalized elements
        return {**base_reading, **personalized_elements}
