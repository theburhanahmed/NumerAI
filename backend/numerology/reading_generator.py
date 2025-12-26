"""
Daily reading content generator for NumerAI.
Enhanced with personalization based on user numerology profiles.
"""
from typing import Dict, List, Any, Optional
from datetime import date
import random
from .numerology import NumerologyCalculator
from .interpretations import get_interpretation
from .models import RajYogDetection


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
    
    # Color therapy recommendations
    COLOR_THERAPY = {
        1: {
            'primary': 'Red',
            'secondary': 'Orange',
            'benefits': 'Enhances confidence, courage, and leadership energy',
            'usage': 'Wear red or orange clothing, use red accessories, or visualize red light during meditation'
        },
        2: {
            'primary': 'White',
            'secondary': 'Light Blue',
            'benefits': 'Promotes peace, harmony, and emotional balance',
            'usage': 'Wear white or light blue, use white candles, or visualize calming blue light'
        },
        3: {
            'primary': 'Yellow',
            'secondary': 'Pink',
            'benefits': 'Boosts creativity, joy, and self-expression',
            'usage': 'Wear yellow or pink, use yellow flowers, or visualize bright yellow light'
        },
        4: {
            'primary': 'Green',
            'secondary': 'Brown',
            'benefits': 'Grounds energy, promotes stability and growth',
            'usage': 'Wear green, spend time in nature, or visualize green earth energy'
        },
        5: {
            'primary': 'Silver',
            'secondary': 'Turquoise',
            'benefits': 'Enhances adaptability, freedom, and communication',
            'usage': 'Wear silver jewelry, use turquoise accents, or visualize silver light'
        },
        6: {
            'primary': 'Blue',
            'secondary': 'Rose',
            'benefits': 'Promotes love, nurturing, and emotional healing',
            'usage': 'Wear blue or rose colors, use blue crystals, or visualize loving blue light'
        },
        7: {
            'primary': 'Violet',
            'secondary': 'Purple',
            'benefits': 'Deepens spirituality, intuition, and inner wisdom',
            'usage': 'Wear violet or purple, use purple candles, or visualize violet light during meditation'
        },
        8: {
            'primary': 'Black',
            'secondary': 'Dark Blue',
            'benefits': 'Strengthens power, authority, and material success',
            'usage': 'Wear black or dark blue, use black accessories, or visualize deep blue-black energy'
        },
        9: {
            'primary': 'Gold',
            'secondary': 'Crimson',
            'benefits': 'Enhances compassion, completion, and universal love',
            'usage': 'Wear gold or crimson, use gold accents, or visualize golden light'
        },
    }
    
    # Crystal recommendations
    CRYSTALS = {
        1: {
            'primary': 'Red Jasper',
            'secondary': ['Carnelian', 'Ruby'],
            'benefits': 'Enhances leadership, courage, and determination',
            'usage': 'Carry or wear red jasper, place on your desk, or meditate with it'
        },
        2: {
            'primary': 'Moonstone',
            'secondary': ['Pearl', 'Selenite'],
            'benefits': 'Promotes intuition, emotional balance, and partnership harmony',
            'usage': 'Wear moonstone jewelry, place under your pillow, or hold during meditation'
        },
        3: {
            'primary': 'Citrine',
            'secondary': ['Amber', 'Yellow Topaz'],
            'benefits': 'Boosts creativity, joy, and communication',
            'usage': 'Carry citrine, place in creative spaces, or wear as jewelry'
        },
        4: {
            'primary': 'Green Aventurine',
            'secondary': ['Jade', 'Malachite'],
            'benefits': 'Promotes stability, growth, and practical success',
            'usage': 'Place in your workspace, carry in pocket, or wear as jewelry'
        },
        5: {
            'primary': 'Aquamarine',
            'secondary': ['Turquoise', 'Blue Lace Agate'],
            'benefits': 'Enhances freedom, communication, and adaptability',
            'usage': 'Wear aquamarine, place near communication devices, or meditate with it'
        },
        6: {
            'primary': 'Rose Quartz',
            'secondary': ['Pink Tourmaline', 'Rhodonite'],
            'benefits': 'Promotes love, healing, and nurturing energy',
            'usage': 'Wear rose quartz, place in bedroom, or hold during heart-centered meditation'
        },
        7: {
            'primary': 'Amethyst',
            'secondary': ['Lapis Lazuli', 'Sodalite'],
            'benefits': 'Deepens spirituality, intuition, and inner wisdom',
            'usage': 'Place amethyst on your altar, wear during meditation, or keep in study space'
        },
        8: {
            'primary': 'Black Obsidian',
            'secondary': ['Hematite', 'Black Tourmaline'],
            'benefits': 'Strengthens power, protection, and material success',
            'usage': 'Carry black obsidian, place in office, or wear for protection'
        },
        9: {
            'primary': 'Clear Quartz',
            'secondary': ['Diamond', 'White Topaz'],
            'benefits': 'Enhances completion, wisdom, and universal connection',
            'usage': 'Use clear quartz for meditation, place in healing spaces, or wear as jewelry'
        },
    }
    
    # Meditation guidance
    MEDITATION_GUIDANCE = {
        1: {
            'focus': 'Leadership and New Beginnings',
            'technique': 'Visualize yourself as a confident leader. See yourself taking bold action and achieving your goals.',
            'duration': '10-15 minutes',
            'mantra': 'I am a confident leader, creating my reality with purpose and power.'
        },
        2: {
            'focus': 'Harmony and Partnership',
            'technique': 'Focus on your breath and visualize harmony flowing through all your relationships.',
            'duration': '15-20 minutes',
            'mantra': 'I create peace and harmony in all my connections.'
        },
        3: {
            'focus': 'Creativity and Expression',
            'technique': 'Visualize creative energy flowing through you. See yourself expressing your unique gifts.',
            'duration': '10-15 minutes',
            'mantra': 'I express my creativity freely and joyfully.'
        },
        4: {
            'focus': 'Stability and Building',
            'technique': 'Ground yourself by visualizing roots connecting you to the earth. Feel stability and structure.',
            'duration': '15-20 minutes',
            'mantra': 'I build solid foundations for my future success.'
        },
        5: {
            'focus': 'Freedom and Change',
            'technique': 'Visualize yourself flowing like water, adapting to change with ease and grace.',
            'duration': '10-15 minutes',
            'mantra': 'I embrace change and welcome new experiences with open arms.'
        },
        6: {
            'focus': 'Love and Nurturing',
            'technique': 'Focus on your heart center. Visualize love radiating from your heart to all beings.',
            'duration': '15-20 minutes',
            'mantra': 'I am a source of love, healing, and nurturing energy.'
        },
        7: {
            'focus': 'Spirituality and Wisdom',
            'technique': 'Go deep within. Visualize a light at your third eye, connecting you to universal wisdom.',
            'duration': '20-30 minutes',
            'mantra': 'I am connected to divine wisdom and inner knowing.'
        },
        8: {
            'focus': 'Power and Success',
            'technique': 'Visualize yourself achieving your material goals. Feel the power of manifestation.',
            'duration': '10-15 minutes',
            'mantra': 'I attract abundance and success through focused action.'
        },
        9: {
            'focus': 'Completion and Compassion',
            'technique': 'Visualize letting go of what no longer serves you. Feel compassion for all beings.',
            'duration': '15-20 minutes',
            'mantra': 'I release with love and serve with compassion.'
        },
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
        
        # Get detailed interpretation
        detailed_interpretation = cls._get_detailed_interpretation(personal_day_number)
        
        # Get color therapy
        color_therapy = cls.COLOR_THERAPY.get(personal_day_number, {})
        
        # Get crystal recommendations
        crystals = cls.CRYSTALS.get(personal_day_number, {})
        
        # Get meditation guidance
        meditation = cls.MEDITATION_GUIDANCE.get(personal_day_number, {})
        
        return {
            'lucky_number': lucky_number,  # Return as integer, not string
            'lucky_color': random.choice(cls.LUCKY_COLORS[personal_day_number]),
            'auspicious_time': random.choice(cls.AUSPICIOUS_TIMES[personal_day_number]),
            'activity_recommendation': random.choice(cls.ACTIVITIES[personal_day_number]),
            'warning': random.choice(cls.WARNINGS[personal_day_number]),
            'affirmation': random.choice(cls.AFFIRMATIONS[personal_day_number]),
            'actionable_tip': random.choice(cls.TIPS[personal_day_number]),
            'detailed_interpretation': detailed_interpretation,
            'color_therapy': color_therapy,
            'crystals': crystals,
            'meditation': meditation,
        }
    
    @classmethod
    def _get_detailed_interpretation(cls, personal_day_number: int) -> str:
        """Generate detailed interpretation (500+ words) for personal day number."""
        interpretations = {
            1: """Today is a Personal Day 1, marking a powerful day of new beginnings and leadership. This is an exceptional time to initiate projects, take charge of situations, and assert your independence. The energy of number 1 brings with it the qualities of pioneering spirit, originality, and the courage to stand alone when necessary.

As you navigate this day, you'll find yourself naturally drawn to leadership roles and opportunities to make your mark. This is not a day to follow others' lead, but rather to step forward and create your own path. Your confidence will be heightened, and you'll feel a strong urge to take action on goals you've been contemplating.

The number 1 energy encourages you to trust your instincts and make decisions independently. You may find that others look to you for guidance today, and you'll have the clarity and determination to provide it. This is an excellent day for starting new habits, launching projects, or making important life decisions.

However, be mindful not to let the strong energy of 1 make you overly aggressive or domineering. While leadership is encouraged, remember that true leadership involves listening to others and considering their perspectives. Balance your assertiveness with diplomacy.

In relationships, this day favors taking initiative. If you've been waiting for someone else to make the first move, today is your day to step forward. In your career, this is an ideal time to pitch new ideas, ask for promotions, or start that business you've been dreaming about.

The Personal Day 1 energy is particularly powerful when combined with your Life Path number. If your Life Path is also 1, you'll experience a double dose of leadership energy. If your Life Path is different, this day offers you the opportunity to express leadership qualities that may not be your primary nature.

Use this day's energy wisely. The momentum you create today can carry you forward for weeks or even months. Set clear intentions, take bold action, and trust that the universe supports your leadership journey.""",
            
            2: """Today is a Personal Day 2, a day of cooperation, partnership, and harmony. The gentle, diplomatic energy of number 2 encourages you to work with others, seek balance, and create peace in your environment. This is not a day for going it alone, but rather for collaboration and partnership.

The number 2 energy brings sensitivity, intuition, and the ability to see both sides of any situation. You'll find yourself naturally drawn to mediating conflicts, bringing people together, and creating harmony where there was discord. Your diplomatic skills will be at their peak today.

This is an excellent day for relationship work. Whether it's romantic relationships, friendships, or professional partnerships, the energy of 2 supports cooperation and mutual understanding. If you've been experiencing tension in any relationship, today offers the perfect opportunity to address it with patience and empathy.

Your intuition will be particularly strong today. Pay attention to your gut feelings and emotional responses, as they're likely to guide you accurately. The number 2 is associated with the moon, bringing emotional depth and intuitive wisdom.

In your work, collaboration will be more effective than solo efforts. Seek out partnerships, join team projects, and be open to others' ideas. This is also a good day for networking and building professional relationships.

However, be careful not to become too passive or dependent on others. While cooperation is encouraged, maintain your own sense of self and don't lose yourself in trying to please everyone. Set healthy boundaries and remember that your needs matter too.

The Personal Day 2 energy is especially beneficial if you're a Life Path 2, as it amplifies your natural diplomatic abilities. For other Life Path numbers, this day offers a chance to develop your cooperative and intuitive side.

Use today to practice active listening, show appreciation to those who support you, and create peace in your environment. The harmony you cultivate today will benefit you and those around you.""",
            
            3: """Today is a Personal Day 3, a vibrant day of creativity, self-expression, and joy. The expressive energy of number 3 encourages you to share your ideas, express your creativity, and bring more joy and beauty into your life. This is a day to let your light shine and share your gifts with the world.

The number 3 energy is associated with communication, creativity, and optimism. You'll feel more sociable, expressive, and inspired today. This is an excellent time for creative projects, artistic endeavors, and sharing your thoughts and ideas with others.

Your communication skills will be enhanced today. Whether it's writing, speaking, or artistic expression, you'll find it easier to convey your thoughts and feelings. This is a great day for presentations, creative writing, social media posts, or any form of self-expression.

Social activities are particularly favored today. You'll enjoy being around others, and they'll be drawn to your positive energy. This is an excellent day for networking, social events, or simply spending quality time with friends and loved ones.

The creative energy of 3 can manifest in many ways - through art, music, writing, fashion, or even in how you approach problem-solving. Don't be afraid to think outside the box and express yourself in unique ways.

However, be mindful not to scatter your energy too thin. The number 3 can sometimes lead to starting many projects without finishing them. Focus on one or two creative endeavors rather than trying to do everything at once.

Also, be aware that the expressive nature of 3 can sometimes lead to oversharing or being too talkative. While communication is encouraged, remember to listen as well as speak, and be mindful of others' boundaries.

The Personal Day 3 energy is especially powerful for Life Path 3 individuals, amplifying their natural creativity. For others, this day offers an opportunity to tap into their creative side and express themselves more freely.

Use today to bring more joy, beauty, and creativity into your life. Share your gifts, express yourself authentically, and let your light shine brightly.""",
            
            4: """Today is a Personal Day 4, a day of stability, organization, and practical achievement. The grounded energy of number 4 encourages you to build structure, complete tasks, and focus on long-term goals. This is a day for getting things done and creating solid foundations.

The number 4 energy is associated with hard work, discipline, and reliability. You'll feel more focused, organized, and determined today. This is an excellent time to tackle projects that require attention to detail, planning, and systematic effort.

Your practical skills will be at their peak today. Whether it's organizing your space, creating budgets, building something physical, or developing systems and processes, the energy of 4 supports methodical, step-by-step progress.

This is a day for completing tasks rather than starting new ones. Focus on finishing projects you've been working on, organizing your environment, and creating order out of chaos. The discipline you apply today will pay dividends in the future.

In your career, this is an excellent day for detailed work, planning, and building professional foundations. Your reliability and work ethic will be noticed, and you may find opportunities to take on more responsibility.

The number 4 energy also supports financial planning and material security. This is a good day to review your budget, make financial plans, or work on building your material resources.

However, be careful not to become too rigid or inflexible. While structure and discipline are valuable, remember to remain open to new ideas and methods. The energy of 4 can sometimes lead to being overly cautious or resistant to change.

Also, avoid overworking yourself. While productivity is encouraged, remember to take breaks and maintain balance. The number 4 can sometimes lead to workaholic tendencies if not managed carefully.

The Personal Day 4 energy is especially beneficial for Life Path 4 individuals, as it amplifies their natural organizational abilities. For others, this day offers an opportunity to develop discipline and create more structure in their lives.

Use today to build solid foundations, complete important tasks, and create order in your life. The stability you create today will support your future growth and success.""",
            
            5: """Today is a Personal Day 5, a dynamic day of change, freedom, and adventure. The energetic vibration of number 5 encourages you to embrace new experiences, break free from routine, and explore new possibilities. This is a day for adventure, learning, and stepping outside your comfort zone.

The number 5 energy is associated with freedom, adaptability, and curiosity. You'll feel more restless, adventurous, and open to new experiences today. This is an excellent time to try something new, meet new people, or explore new places.

Your communication skills will be enhanced, and you'll feel more sociable and outgoing. This is a great day for networking, socializing, and making new connections. Your natural curiosity will lead you to interesting conversations and new insights.

Change is in the air today, and the energy of 5 supports embracing it rather than resisting it. Whether it's a change in routine, perspective, or life circumstances, you'll find it easier to adapt and flow with whatever comes your way.

This is an excellent day for learning new skills, trying new activities, or exploring new ideas. Your mind will be more open and receptive, making it easier to absorb new information and perspectives.

Travel and exploration are particularly favored today. Even if you can't travel physically, you can explore new ideas, cultures, or perspectives through books, conversations, or online resources.

However, be mindful not to become too scattered or restless. The energy of 5 can sometimes lead to starting many things without finishing them, or constantly seeking new stimulation without finding satisfaction. Try to balance your need for variety with some focus and commitment.

Also, be careful not to make impulsive decisions. While spontaneity is encouraged, take a moment to consider the consequences of major decisions. The freedom-loving nature of 5 can sometimes lead to avoiding necessary commitments.

The Personal Day 5 energy is especially powerful for Life Path 5 individuals, amplifying their natural adventurous spirit. For others, this day offers an opportunity to break free from routine and embrace change.

Use today to explore, learn, and embrace new experiences. Step outside your comfort zone, try something different, and allow yourself to be surprised by what you discover.""",
            
            6: """Today is a Personal Day 6, a nurturing day of love, service, and responsibility. The caring energy of number 6 encourages you to focus on relationships, family, and creating beauty in your environment. This is a day for giving and receiving love, and for taking care of those you care about.

The number 6 energy is associated with love, responsibility, and service. You'll feel more nurturing, caring, and focused on relationships today. This is an excellent time to strengthen bonds with family and friends, and to create harmony in your home environment.

Your ability to care for others will be enhanced today. Whether it's family members, friends, or even strangers in need, you'll feel a natural urge to help and support others. This is a great day for acts of service and kindness.

Home and family matters are particularly important today. This is an excellent time to spend quality time with loved ones, beautify your living space, or address any family issues that need attention. Creating a harmonious home environment will bring you satisfaction.

The number 6 also relates to beauty and aesthetics. You may feel inspired to create beauty in your environment, whether through decorating, gardening, cooking, or artistic expression. Surrounding yourself with beauty will uplift your spirits.

In relationships, this is a day for showing love and appreciation. Express your feelings to those you care about, and be open to receiving love in return. The energy of 6 supports deep, meaningful connections.

However, be careful not to take on too much responsibility or become overly controlling. While caring for others is positive, remember that you can't fix everyone's problems, and you need to take care of yourself too. Set healthy boundaries and avoid martyrdom.

Also, be mindful not to become overly focused on others at the expense of your own needs. The nurturing nature of 6 can sometimes lead to self-neglect. Remember that you deserve love and care too.

The Personal Day 6 energy is especially beneficial for Life Path 6 individuals, amplifying their natural nurturing abilities. For others, this day offers an opportunity to develop their caring and responsible side.

Use today to nurture relationships, create beauty, and show love to those around you. The harmony and love you cultivate today will bring lasting joy and fulfillment.""",
            
            7: """Today is a Personal Day 7, a contemplative day of spirituality, analysis, and inner wisdom. The introspective energy of number 7 encourages you to seek truth, deepen your understanding, and connect with your spiritual nature. This is a day for reflection, study, and inner exploration.

The number 7 energy is associated with spirituality, analysis, and wisdom. You'll feel more introspective, analytical, and drawn to deeper understanding today. This is an excellent time for meditation, study, research, or any activity that requires deep thinking.

Your intuition and inner wisdom will be particularly strong today. Pay attention to your inner voice, as it's likely to provide valuable insights. This is a great day for spiritual practices, philosophical contemplation, or seeking answers to life's deeper questions.

Solitude will be more appealing and beneficial today. While social activities are fine, you'll find that time alone will be particularly productive and rejuvenating. Use this time for reflection, journaling, or spiritual practices.

The analytical nature of 7 makes this an excellent day for research, problem-solving, or studying complex topics. Your ability to see beneath the surface and understand deeper patterns will be enhanced.

This is also a good day for connecting with nature, as the number 7 is associated with natural wisdom and the cycles of life. Spending time outdoors, especially in quiet, natural settings, will be particularly beneficial.

However, be careful not to become too isolated or withdrawn. While solitude is valuable, remember to maintain connections with others. The introspective nature of 7 can sometimes lead to excessive isolation.

Also, be mindful not to overthink or over-analyze situations. While analysis is valuable, sometimes you need to trust your intuition and take action. The perfectionist tendencies of 7 can sometimes lead to paralysis by analysis.

The Personal Day 7 energy is especially powerful for Life Path 7 individuals, amplifying their natural spiritual and analytical abilities. For others, this day offers an opportunity to develop their introspective and spiritual side.

Use today to deepen your understanding, connect with your inner wisdom, and seek truth. The insights you gain today will guide you on your spiritual journey.""",
            
            8: """Today is a Personal Day 8, a powerful day of material success, achievement, and authority. The ambitious energy of number 8 encourages you to focus on your career, finances, and long-term goals. This is a day for taking charge, making important decisions, and building your material success.

The number 8 energy is associated with power, authority, and material achievement. You'll feel more ambitious, determined, and focused on success today. This is an excellent time for career advancement, financial planning, and taking on leadership roles.

Your business acumen and organizational skills will be at their peak today. This is an ideal day for making important business decisions, negotiating deals, or taking steps toward your career goals. Your ability to see the big picture and plan strategically will be enhanced.

Financial matters are particularly favored today. This is a good day for making investments, reviewing your financial situation, or taking steps to increase your income. The energy of 8 supports material abundance and financial success.

Your leadership abilities will be strong today. Others will naturally look to you for guidance, and you'll have the confidence and authority to provide it. This is an excellent day for taking charge of projects or situations.

The number 8 also relates to karma and cause-and-effect. The actions you take today will have significant consequences, so choose wisely. This is a day to be ethical and responsible in your use of power and authority.

However, be careful not to become too focused on material success at the expense of other important areas of life. While achievement is valuable, remember that relationships, health, and spiritual growth are also important. Balance is key.

Also, be mindful not to become too controlling or power-hungry. While authority is encouraged, remember that true power comes from serving others and using your influence wisely. Avoid being ruthless or manipulative.

The Personal Day 8 energy is especially beneficial for Life Path 8 individuals, amplifying their natural business and leadership abilities. For others, this day offers an opportunity to develop their ambitious and achievement-oriented side.

Use today to focus on your goals, make important decisions, and take steps toward success. The power and authority you wield today can create lasting positive change in your life.""",
            
            9: """Today is a Personal Day 9, a day of completion, wisdom, and universal love. The compassionate energy of number 9 encourages you to let go of what no longer serves you, serve others, and embrace your role as a humanitarian. This is a day for completion, forgiveness, and expressing unconditional love.

The number 9 energy is associated with completion, wisdom, and humanitarianism. You'll feel more compassionate, wise, and drawn to service today. This is an excellent time for completing projects, letting go of the past, and helping others.

Your ability to see the bigger picture and understand universal truths will be enhanced today. You'll feel more connected to humanity as a whole and more aware of your role in the larger scheme of things. This is a great day for philosophical contemplation and spiritual growth.

Compassion and forgiveness are particularly important today. If you've been holding onto grudges or resentments, this is an excellent time to release them. The energy of 9 supports letting go of what no longer serves you and making peace with the past.

Service to others is highly favored today. Whether it's volunteering, helping someone in need, or simply being more compassionate in your daily interactions, the energy of 9 supports acts of kindness and service.

This is also a day for completion. If you have unfinished projects or unresolved situations, today's energy supports bringing them to a close. The number 9 represents the end of a cycle, making it an ideal time for closure.

Your wisdom and life experience will be particularly valuable today. Others may seek your advice, and you'll have insights to share. Don't hesitate to offer your guidance and support to those who need it.

However, be careful not to become too idealistic or to give more than you can afford. While service is positive, remember to set healthy boundaries and take care of yourself. The compassionate nature of 9 can sometimes lead to emotional burnout or being taken advantage of.

Also, be mindful not to neglect practical matters. While focusing on the bigger picture and serving others is important, don't forget to attend to your own practical needs and responsibilities.

The Personal Day 9 energy is especially powerful for Life Path 9 individuals, amplifying their natural humanitarian and compassionate abilities. For others, this day offers an opportunity to develop their compassionate and service-oriented side.

Use today to complete what needs finishing, let go of what no longer serves you, and express love and compassion to all beings. The wisdom and service you offer today will create positive ripples in the world."""
        }
        
        return interpretations.get(personal_day_number, f"Personal Day {personal_day_number} brings unique energy and opportunities for growth and expression.")
    
    @classmethod
    def generate_personalized_reading(
        cls,
        personal_day_number: int,
        user_profile: Dict,
        user=None,
        include_raj_yog: bool = True
    ) -> Dict[str, Any]:
        """
        Generate personalized daily reading content based on user's numerology profile.
        
        Args:
            personal_day_number: Personal day number (1-9)
            user_profile: Dictionary containing user's numerology numbers
            user: User instance (optional, for Raj Yog detection)
            include_raj_yog: Whether to include Raj Yog insights
        
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
        
        # Add Raj Yog insights if requested and user is provided
        if include_raj_yog and user:
            try:
                detection = RajYogDetection.objects.filter(user=user, person=None).first()
                if detection and detection.is_detected:
                    personalized_elements['raj_yog_status'] = 'detected'
                    personalized_elements['raj_yog_insight'] = (
                        f"Your {detection.yog_name} (strength: {detection.strength_score}/100) "
                        f"brings auspicious energy today. This is an excellent day to focus on "
                        f"activities aligned with your Raj Yog strengths."
                    )
                else:
                    personalized_elements['raj_yog_status'] = 'not_detected'
            except Exception as e:
                import logging
                logging.warning(f"Failed to get Raj Yog detection: {str(e)}")
                personalized_elements['raj_yog_status'] = 'unknown'
        
        # Combine base reading with personalized elements
        return {**base_reading, **personalized_elements}
