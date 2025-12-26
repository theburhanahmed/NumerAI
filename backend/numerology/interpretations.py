"""
Numerology number interpretations database.
"""
from typing import Dict, List


class NumberInterpretation:
    """Interpretation data for a numerology number."""
    
    def __init__(self, number: int, title: str, description: str, 
                 strengths: List[str], challenges: List[str],
                 career: List[str], relationships: str, life_purpose: str):
        self.number = number
        self.title = title
        self.description = description
        self.strengths = strengths
        self.challenges = challenges
        self.career = career
        self.relationships = relationships
        self.life_purpose = life_purpose
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'number': self.number,
            'title': self.title,
            'description': self.description,
            'strengths': self.strengths,
            'challenges': self.challenges,
            'career': self.career,
            'relationships': self.relationships,
            'life_purpose': self.life_purpose
        }


# Comprehensive interpretations for all numbers
INTERPRETATIONS = {
    1: NumberInterpretation(
        number=1,
        title="The Leader",
        description="Number 1 represents new beginnings, independence, and leadership. You are a natural pioneer with strong willpower and determination. Your innovative spirit and courage to stand alone make you a trailblazer.",
        strengths=["Leadership", "Independence", "Innovation", "Courage", "Determination", "Self-reliance"],
        challenges=["Stubbornness", "Impatience", "Domineering tendencies", "Difficulty accepting help", "Ego conflicts"],
        career=["Entrepreneur", "CEO", "Manager", "Inventor", "Architect", "Designer", "Military leader"],
        relationships="You need a partner who respects your independence and supports your ambitions. You may struggle with compromise but are fiercely loyal once committed.",
        life_purpose="To lead by example, pioneer new paths, and inspire others through your courage and innovation."
    ),
    
    2: NumberInterpretation(
        number=2,
        title="The Peacemaker",
        description="Number 2 embodies harmony, cooperation, and diplomacy. You are naturally intuitive and sensitive to others' needs. Your gift for bringing people together and creating balance makes you invaluable in any team.",
        strengths=["Diplomacy", "Cooperation", "Intuition", "Patience", "Mediation", "Supportiveness"],
        challenges=["Over-sensitivity", "Indecisiveness", "Dependency", "Avoiding conflict", "Self-doubt"],
        career=["Counselor", "Mediator", "Diplomat", "Teacher", "Therapist", "HR professional", "Social worker"],
        relationships="You thrive in partnerships and seek deep emotional connections. You're naturally supportive but must avoid losing yourself in relationships.",
        life_purpose="To create harmony, facilitate cooperation, and help others find common ground through your diplomatic nature."
    ),
    
    3: NumberInterpretation(
        number=3,
        title="The Creative Communicator",
        description="Number 3 represents creativity, self-expression, and joy. You have a natural gift for communication and artistic expression. Your optimism and enthusiasm are contagious, bringing light wherever you go.",
        strengths=["Creativity", "Communication", "Optimism", "Charm", "Artistic talent", "Social skills"],
        challenges=["Scattered energy", "Superficiality", "Difficulty focusing", "Over-indulgence", "Mood swings"],
        career=["Artist", "Writer", "Performer", "Designer", "Marketing", "Public relations", "Entertainment"],
        relationships="You bring joy and excitement to relationships but may struggle with emotional depth. You need a partner who appreciates your creative spirit.",
        life_purpose="To inspire and uplift others through creative expression, bringing beauty and joy into the world."
    ),
    
    4: NumberInterpretation(
        number=4,
        title="The Builder",
        description="Number 4 represents stability, structure, and hard work. You are practical, reliable, and methodical. Your dedication to building solid foundations makes you the cornerstone of any project or relationship.",
        strengths=["Reliability", "Organization", "Practicality", "Discipline", "Loyalty", "Hard work"],
        challenges=["Rigidity", "Resistance to change", "Workaholism", "Lack of spontaneity", "Stubbornness"],
        career=["Engineer", "Accountant", "Project manager", "Builder", "Analyst", "Administrator", "Planner"],
        relationships="You seek stability and commitment in relationships. You show love through actions and dedication rather than words.",
        life_purpose="To create lasting structures and systems that provide security and stability for yourself and others."
    ),
    
    5: NumberInterpretation(
        number=5,
        title="The Freedom Seeker",
        description="Number 5 embodies freedom, adventure, and change. You are naturally curious and adaptable, thriving on variety and new experiences. Your versatility and quick thinking make you excel in dynamic environments.",
        strengths=["Adaptability", "Versatility", "Curiosity", "Freedom-loving", "Quick thinking", "Resourcefulness"],
        challenges=["Restlessness", "Impulsiveness", "Lack of commitment", "Irresponsibility", "Addiction tendencies"],
        career=["Travel industry", "Sales", "Marketing", "Journalism", "Photography", "Event planning", "Consulting"],
        relationships="You need freedom and variety in relationships. You're exciting and adventurous but may struggle with long-term commitment.",
        life_purpose="To experience life fully, embrace change, and help others break free from limitations."
    ),
    
    6: NumberInterpretation(
        number=6,
        title="The Nurturer",
        description="Number 6 represents love, responsibility, and service. You have a natural gift for caring and nurturing others. Your sense of duty and desire to create harmony make you the heart of your community.",
        strengths=["Compassion", "Responsibility", "Nurturing", "Idealism", "Artistic sense", "Domestic skills"],
        challenges=["Over-responsibility", "Martyrdom", "Perfectionism", "Interference", "Self-righteousness"],
        career=["Healthcare", "Teaching", "Counseling", "Interior design", "Hospitality", "Social services", "Arts"],
        relationships="You're devoted and loving, often putting others' needs first. You must learn to balance giving with receiving.",
        life_purpose="To serve and nurture others, creating beauty and harmony in your environment and relationships."
    ),
    
    7: NumberInterpretation(
        number=7,
        title="The Seeker",
        description="Number 7 represents wisdom, spirituality, and analysis. You are naturally introspective and philosophical, seeking deeper truths. Your analytical mind and spiritual awareness make you a natural researcher and teacher.",
        strengths=["Analytical thinking", "Intuition", "Wisdom", "Spirituality", "Research skills", "Perfectionism"],
        challenges=["Isolation", "Over-analysis", "Skepticism", "Difficulty trusting", "Aloofness"],
        career=["Researcher", "Scientist", "Philosopher", "Analyst", "Spiritual teacher", "Investigator", "Professor"],
        relationships="You need intellectual and spiritual connection. You may appear distant but are deeply loyal to those you trust.",
        life_purpose="To seek truth and wisdom, sharing your insights to help others understand life's deeper mysteries."
    ),
    
    8: NumberInterpretation(
        number=8,
        title="The Powerhouse",
        description="Number 8 represents power, success, and material abundance. You have natural business acumen and leadership abilities. Your ambition and organizational skills make you destined for positions of authority.",
        strengths=["Ambition", "Business acumen", "Authority", "Efficiency", "Confidence", "Management skills"],
        challenges=["Materialism", "Workaholism", "Controlling behavior", "Impatience", "Ruthlessness"],
        career=["Executive", "Business owner", "Finance", "Real estate", "Politics", "Law", "Banking"],
        relationships="You seek a partner who matches your ambition and success. You must balance work with personal relationships.",
        life_purpose="To achieve material success and use your power and resources to create positive change in the world."
    ),
    
    9: NumberInterpretation(
        number=9,
        title="The Humanitarian",
        description="Number 9 represents completion, compassion, and universal love. You are naturally idealistic and humanitarian, concerned with the welfare of all. Your wisdom and generosity make you a natural healer and teacher.",
        strengths=["Compassion", "Idealism", "Generosity", "Wisdom", "Artistic talent", "Universal love"],
        challenges=["Martyrdom", "Emotional volatility", "Impracticality", "Difficulty letting go", "Self-neglect"],
        career=["Humanitarian work", "Arts", "Healing professions", "Teaching", "Non-profit", "Counseling", "Ministry"],
        relationships="You love deeply and unconditionally but may attract those who need saving. You must learn healthy boundaries.",
        life_purpose="To serve humanity through compassion and wisdom, helping others reach their highest potential."
    ),
    
    11: NumberInterpretation(
        number=11,
        title="The Illuminator",
        description="Master Number 11 represents spiritual insight and enlightenment. You are highly intuitive and inspirational, with the ability to see beyond the physical realm. Your sensitivity and vision make you a natural spiritual teacher.",
        strengths=["Intuition", "Inspiration", "Spiritual awareness", "Idealism", "Sensitivity", "Visionary thinking"],
        challenges=["Nervous tension", "Impracticality", "Over-sensitivity", "Self-doubt", "Anxiety"],
        career=["Spiritual teacher", "Counselor", "Artist", "Inventor", "Motivational speaker", "Healer", "Psychologist"],
        relationships="You seek deep spiritual and emotional connections. Your intensity can be overwhelming but also deeply transformative.",
        life_purpose="To illuminate the path for others through your spiritual insights and inspire humanity to reach higher consciousness."
    ),
    
    22: NumberInterpretation(
        number=22,
        title="The Master Builder",
        description="Master Number 22 represents the ability to turn dreams into reality on a grand scale. You combine practical skills with visionary thinking, capable of creating lasting legacies that benefit humanity.",
        strengths=["Vision", "Practicality", "Leadership", "Organization", "Ambition", "Building skills"],
        challenges=["Overwhelming pressure", "Difficulty delegating", "Perfectionism", "Stress", "Burnout"],
        career=["Architect", "Engineer", "Entrepreneur", "Politician", "Urban planner", "Philanthropist", "CEO"],
        relationships="You need a partner who understands your grand vision and supports your ambitious goals. Balance is crucial.",
        life_purpose="To manifest grand visions into physical reality, creating structures and systems that serve humanity for generations."
    ),
    
    33: NumberInterpretation(
        number=33,
        title="The Master Teacher",
        description="Master Number 33 represents unconditional love and spiritual teaching at the highest level. You are the epitome of compassion and selfless service, with the ability to uplift and heal on a massive scale.",
        strengths=["Unconditional love", "Healing ability", "Teaching", "Compassion", "Selflessness", "Inspiration"],
        challenges=["Martyrdom", "Emotional burden", "Difficulty saying no", "Self-sacrifice", "Overwhelm"],
        career=["Spiritual teacher", "Healer", "Humanitarian leader", "Counselor", "Minister", "Philanthropist", "Social reformer"],
        relationships="You love unconditionally and may attract those in need. You must maintain boundaries while serving others.",
        life_purpose="To embody and teach unconditional love, serving as a beacon of compassion and healing for all humanity."
    ),
}


# Birthday Number Interpretations (DivineAPI-style)
BIRTHDAY_NUMBER_INTERPRETATIONS = {
    1: {
        'number': 1,
        'title': 'The Innovator',
        'description': 'Born on the 1st, 10th, 19th, or 28th, you possess natural leadership abilities and a pioneering spirit. You are independent, ambitious, and determined to succeed on your own terms.',
        'talents': ['Leadership', 'Innovation', 'Self-motivation', 'Originality'],
        'best_days': ['Sunday', 'Monday'],
        'lucky_colors': ['Gold', 'Orange', 'Yellow'],
        'advice': 'Trust your instincts and take initiative. Your originality is your greatest asset.'
    },
    2: {
        'number': 2,
        'title': 'The Diplomat',
        'description': 'Born on the 2nd, 11th, 20th, or 29th, you have natural diplomatic abilities and emotional sensitivity. You excel in partnerships and creating harmony.',
        'talents': ['Diplomacy', 'Cooperation', 'Intuition', 'Patience'],
        'best_days': ['Monday', 'Friday'],
        'lucky_colors': ['White', 'Cream', 'Green'],
        'advice': 'Use your sensitivity as a strength. Your ability to understand others is a gift.'
    },
    3: {
        'number': 3,
        'title': 'The Communicator',
        'description': 'Born on the 3rd, 12th, 21st, or 30th, you have natural creative and communication talents. You bring joy and inspiration to others through self-expression.',
        'talents': ['Creativity', 'Communication', 'Optimism', 'Artistic expression'],
        'best_days': ['Thursday', 'Friday'],
        'lucky_colors': ['Yellow', 'Purple', 'Pink'],
        'advice': 'Express yourself freely. Your creativity and words have the power to inspire.'
    },
    4: {
        'number': 4,
        'title': 'The Organizer',
        'description': 'Born on the 4th, 13th, 22nd, or 31st, you have natural organizational abilities and a practical mindset. You build solid foundations for success.',
        'talents': ['Organization', 'Discipline', 'Reliability', 'Practical thinking'],
        'best_days': ['Saturday', 'Sunday'],
        'lucky_colors': ['Blue', 'Gray', 'Green'],
        'advice': 'Your methodical approach leads to lasting success. Trust the process.'
    },
    5: {
        'number': 5,
        'title': 'The Adventurer',
        'description': 'Born on the 5th, 14th, or 23rd, you have natural versatility and love for freedom. You thrive on change and new experiences.',
        'talents': ['Adaptability', 'Communication', 'Versatility', 'Quick thinking'],
        'best_days': ['Wednesday', 'Friday'],
        'lucky_colors': ['Green', 'Turquoise', 'Light Gray'],
        'advice': 'Embrace change as your ally. Your adaptability opens doors others cannot see.'
    },
    6: {
        'number': 6,
        'title': 'The Caregiver',
        'description': 'Born on the 6th, 15th, or 24th, you have natural nurturing abilities and a strong sense of responsibility. You create harmony and beauty.',
        'talents': ['Nurturing', 'Responsibility', 'Artistic sense', 'Healing'],
        'best_days': ['Friday', 'Thursday'],
        'lucky_colors': ['Pink', 'Blue', 'Green'],
        'advice': 'Your caring nature is your strength. Remember to nurture yourself too.'
    },
    7: {
        'number': 7,
        'title': 'The Analyst',
        'description': 'Born on the 7th, 16th, or 25th, you have natural analytical abilities and spiritual depth. You seek truth and wisdom.',
        'talents': ['Analysis', 'Intuition', 'Research', 'Spiritual insight'],
        'best_days': ['Monday', 'Sunday'],
        'lucky_colors': ['Violet', 'Purple', 'White'],
        'advice': 'Trust your inner wisdom. Your analytical mind combined with intuition is powerful.'
    },
    8: {
        'number': 8,
        'title': 'The Executive',
        'description': 'Born on the 8th, 17th, or 26th, you have natural business acumen and leadership abilities. You are destined for material success.',
        'talents': ['Business sense', 'Authority', 'Organization', 'Determination'],
        'best_days': ['Saturday', 'Thursday'],
        'lucky_colors': ['Black', 'Dark Blue', 'Purple'],
        'advice': 'Your ambition is your fuel. Balance material success with spiritual growth.'
    },
    9: {
        'number': 9,
        'title': 'The Humanitarian',
        'description': 'Born on the 9th, 18th, or 27th, you have natural compassion and universal awareness. You are here to serve humanity.',
        'talents': ['Compassion', 'Artistic ability', 'Wisdom', 'Generosity'],
        'best_days': ['Tuesday', 'Thursday'],
        'lucky_colors': ['Red', 'Pink', 'Crimson'],
        'advice': 'Your generosity inspires others. Remember that giving to yourself is also giving.'
    }
}

# Driver Number Interpretations (Chaldean - Psychic Number)
DRIVER_NUMBER_INTERPRETATIONS = {
    1: {
        'number': 1,
        'title': 'The Independent Driver',
        'description': 'Your inner self is driven by independence and originality. You see yourself as a leader and pioneer.',
        'inner_nature': 'Self-reliant, ambitious, innovative',
        'motivation': 'To be first, to lead, to create something new',
        'inner_strength': 'Unwavering determination and self-belief',
        'shadow_aspect': 'May appear egotistical or stubborn to others'
    },
    2: {
        'number': 2,
        'title': 'The Sensitive Driver',
        'description': 'Your inner self is driven by harmony and connection. You see yourself as a peacemaker and partner.',
        'inner_nature': 'Intuitive, diplomatic, nurturing',
        'motivation': 'To create harmony, to connect, to support others',
        'inner_strength': 'Deep empathy and emotional intelligence',
        'shadow_aspect': 'May appear indecisive or overly dependent'
    },
    3: {
        'number': 3,
        'title': 'The Creative Driver',
        'description': 'Your inner self is driven by expression and joy. You see yourself as an artist and communicator.',
        'inner_nature': 'Expressive, optimistic, imaginative',
        'motivation': 'To create, to express, to bring joy',
        'inner_strength': 'Natural charisma and creative vision',
        'shadow_aspect': 'May appear scattered or superficial'
    },
    4: {
        'number': 4,
        'title': 'The Practical Driver',
        'description': 'Your inner self is driven by stability and order. You see yourself as a builder and organizer.',
        'inner_nature': 'Methodical, reliable, hardworking',
        'motivation': 'To build, to organize, to create stability',
        'inner_strength': 'Unwavering dedication and practical wisdom',
        'shadow_aspect': 'May appear rigid or overly cautious'
    },
    5: {
        'number': 5,
        'title': 'The Freedom Driver',
        'description': 'Your inner self is driven by freedom and experience. You see yourself as an adventurer and explorer.',
        'inner_nature': 'Curious, adaptable, freedom-loving',
        'motivation': 'To experience, to explore, to be free',
        'inner_strength': 'Remarkable adaptability and quick thinking',
        'shadow_aspect': 'May appear restless or irresponsible'
    },
    6: {
        'number': 6,
        'title': 'The Nurturing Driver',
        'description': 'Your inner self is driven by love and responsibility. You see yourself as a caretaker and healer.',
        'inner_nature': 'Caring, responsible, harmonious',
        'motivation': 'To nurture, to heal, to create beauty',
        'inner_strength': 'Deep capacity for love and service',
        'shadow_aspect': 'May appear overprotective or controlling'
    },
    7: {
        'number': 7,
        'title': 'The Seeker Driver',
        'description': 'Your inner self is driven by wisdom and truth. You see yourself as a philosopher and mystic.',
        'inner_nature': 'Analytical, intuitive, spiritual',
        'motivation': 'To understand, to seek truth, to find meaning',
        'inner_strength': 'Profound inner wisdom and spiritual insight',
        'shadow_aspect': 'May appear aloof or overly critical'
    },
    8: {
        'number': 8,
        'title': 'The Powerful Driver',
        'description': 'Your inner self is driven by achievement and power. You see yourself as an authority and leader.',
        'inner_nature': 'Ambitious, authoritative, efficient',
        'motivation': 'To achieve, to lead, to create abundance',
        'inner_strength': 'Natural executive ability and determination',
        'shadow_aspect': 'May appear materialistic or domineering'
    },
    9: {
        'number': 9,
        'title': 'The Universal Driver',
        'description': 'Your inner self is driven by compassion and service. You see yourself as a humanitarian and healer.',
        'inner_nature': 'Compassionate, wise, idealistic',
        'motivation': 'To serve, to heal, to inspire',
        'inner_strength': 'Profound empathy and universal love',
        'shadow_aspect': 'May appear impractical or emotionally volatile'
    }
}

# Conductor Number Interpretations (Chaldean - Destiny/Name Number)
CONDUCTOR_NUMBER_INTERPRETATIONS = {
    1: {
        'number': 1,
        'title': 'Leadership Destiny',
        'description': 'Your destiny leads you toward leadership and pioneering roles. Others perceive you as independent and original.',
        'life_direction': 'To lead, innovate, and inspire independence in others',
        'public_image': 'Seen as confident, capable, and self-assured',
        'destiny_lessons': 'Learning to lead without dominating, to be independent while connected'
    },
    2: {
        'number': 2,
        'title': 'Partnership Destiny',
        'description': 'Your destiny leads you toward cooperation and diplomacy. Others perceive you as supportive and understanding.',
        'life_direction': 'To create harmony, build partnerships, and facilitate peace',
        'public_image': 'Seen as diplomatic, caring, and cooperative',
        'destiny_lessons': 'Learning to assert yourself while maintaining harmony'
    },
    3: {
        'number': 3,
        'title': 'Expression Destiny',
        'description': 'Your destiny leads you toward creative expression. Others perceive you as joyful and inspiring.',
        'life_direction': 'To create, communicate, and bring joy to the world',
        'public_image': 'Seen as creative, optimistic, and entertaining',
        'destiny_lessons': 'Learning to focus your creative energy productively'
    },
    4: {
        'number': 4,
        'title': 'Builder Destiny',
        'description': 'Your destiny leads you toward creating lasting structures. Others perceive you as reliable and practical.',
        'life_direction': 'To build, organize, and create stability for others',
        'public_image': 'Seen as dependable, hardworking, and trustworthy',
        'destiny_lessons': 'Learning flexibility while maintaining your foundations'
    },
    5: {
        'number': 5,
        'title': 'Freedom Destiny',
        'description': 'Your destiny leads you toward change and adventure. Others perceive you as dynamic and versatile.',
        'life_direction': 'To embrace change, explore, and help others find freedom',
        'public_image': 'Seen as exciting, adaptable, and progressive',
        'destiny_lessons': 'Learning commitment while honoring your need for freedom'
    },
    6: {
        'number': 6,
        'title': 'Service Destiny',
        'description': 'Your destiny leads you toward nurturing and service. Others perceive you as caring and responsible.',
        'life_direction': 'To nurture, heal, and create beauty in the world',
        'public_image': 'Seen as loving, responsible, and artistic',
        'destiny_lessons': 'Learning to receive as well as give'
    },
    7: {
        'number': 7,
        'title': 'Wisdom Destiny',
        'description': 'Your destiny leads you toward spiritual understanding. Others perceive you as wise and insightful.',
        'life_direction': 'To seek truth, develop wisdom, and guide others spiritually',
        'public_image': 'Seen as intellectual, mysterious, and spiritually aware',
        'destiny_lessons': 'Learning to share your wisdom while staying grounded'
    },
    8: {
        'number': 8,
        'title': 'Achievement Destiny',
        'description': 'Your destiny leads you toward material success and power. Others perceive you as authoritative and capable.',
        'life_direction': 'To achieve, lead, and use resources for positive change',
        'public_image': 'Seen as powerful, successful, and commanding',
        'destiny_lessons': 'Learning to balance material and spiritual success'
    },
    9: {
        'number': 9,
        'title': 'Humanitarian Destiny',
        'description': 'Your destiny leads you toward universal service. Others perceive you as compassionate and wise.',
        'life_direction': 'To serve humanity, heal, and inspire global consciousness',
        'public_image': 'Seen as generous, wise, and universally loving',
        'destiny_lessons': 'Learning to let go and trust the universal flow'
    },
    11: {
        'number': 11,
        'title': 'Illumination Destiny',
        'description': 'Your destiny is to illuminate and inspire. Others perceive you as visionary and spiritually gifted.',
        'life_direction': 'To inspire, enlighten, and raise consciousness',
        'public_image': 'Seen as inspired, intuitive, and spiritually powerful',
        'destiny_lessons': 'Learning to ground your visions in practical reality'
    },
    22: {
        'number': 22,
        'title': 'Master Builder Destiny',
        'description': 'Your destiny is to build on a grand scale. Others perceive you as capable of manifesting great visions.',
        'life_direction': 'To create lasting structures that benefit humanity',
        'public_image': 'Seen as visionary, practical, and powerfully capable',
        'destiny_lessons': 'Learning to balance your grand visions with self-care'
    },
    33: {
        'number': 33,
        'title': 'Master Teacher Destiny',
        'description': 'Your destiny is to teach and heal at the highest level. Others perceive you as a beacon of love.',
        'life_direction': 'To embody and teach unconditional love',
        'public_image': 'Seen as compassionate, wise, and spiritually evolved',
        'destiny_lessons': 'Learning to maintain boundaries while serving others'
    }
}

# Attitude Number Interpretations (Enhanced)
ATTITUDE_NUMBER_INTERPRETATIONS = {
    1: {
        'number': 1,
        'title': 'The Confident Approach',
        'description': 'You approach life with confidence and independence. First impressions show you as a natural leader.',
        'first_impression': 'Confident, capable, self-assured',
        'default_behavior': 'Taking charge, being independent, leading by example',
        'social_style': 'Direct, assertive, pioneering',
        'advice': 'Your natural confidence inspires others. Balance leadership with listening.'
    },
    2: {
        'number': 2,
        'title': 'The Diplomatic Approach',
        'description': 'You approach life with sensitivity and cooperation. First impressions show you as understanding and supportive.',
        'first_impression': 'Gentle, understanding, cooperative',
        'default_behavior': 'Seeking harmony, supporting others, mediating',
        'social_style': 'Diplomatic, patient, receptive',
        'advice': 'Your sensitivity is a gift. Trust your intuition in social situations.'
    },
    3: {
        'number': 3,
        'title': 'The Expressive Approach',
        'description': 'You approach life with optimism and creativity. First impressions show you as charming and entertaining.',
        'first_impression': 'Cheerful, creative, engaging',
        'default_behavior': 'Expressing yourself, entertaining, inspiring joy',
        'social_style': 'Charismatic, expressive, sociable',
        'advice': 'Your natural charm opens doors. Use your words to inspire and uplift.'
    },
    4: {
        'number': 4,
        'title': 'The Practical Approach',
        'description': 'You approach life with practicality and reliability. First impressions show you as dependable and grounded.',
        'first_impression': 'Reliable, practical, organized',
        'default_behavior': 'Being methodical, following through, building stability',
        'social_style': 'Steady, dependable, straightforward',
        'advice': 'Your reliability builds trust. Allow some flexibility in your approach.'
    },
    5: {
        'number': 5,
        'title': 'The Dynamic Approach',
        'description': 'You approach life with curiosity and adaptability. First impressions show you as exciting and versatile.',
        'first_impression': 'Dynamic, curious, adventurous',
        'default_behavior': 'Seeking variety, adapting quickly, exploring options',
        'social_style': 'Engaging, flexible, spontaneous',
        'advice': 'Your energy is contagious. Channel your versatility toward meaningful goals.'
    },
    6: {
        'number': 6,
        'title': 'The Caring Approach',
        'description': 'You approach life with responsibility and care. First impressions show you as nurturing and helpful.',
        'first_impression': 'Warm, responsible, caring',
        'default_behavior': 'Helping others, creating harmony, taking responsibility',
        'social_style': 'Supportive, responsible, harmonious',
        'advice': 'Your caring nature draws others to you. Remember to care for yourself too.'
    },
    7: {
        'number': 7,
        'title': 'The Thoughtful Approach',
        'description': 'You approach life with depth and analysis. First impressions show you as intelligent and mysterious.',
        'first_impression': 'Thoughtful, intelligent, reserved',
        'default_behavior': 'Analyzing, observing, seeking understanding',
        'social_style': 'Introspective, selective, quality-focused',
        'advice': 'Your depth attracts those seeking wisdom. Share your insights more openly.'
    },
    8: {
        'number': 8,
        'title': 'The Authoritative Approach',
        'description': 'You approach life with ambition and authority. First impressions show you as capable and powerful.',
        'first_impression': 'Confident, capable, authoritative',
        'default_behavior': 'Taking charge, achieving goals, demonstrating competence',
        'social_style': 'Professional, commanding, goal-oriented',
        'advice': 'Your natural authority commands respect. Balance power with compassion.'
    },
    9: {
        'number': 9,
        'title': 'The Compassionate Approach',
        'description': 'You approach life with compassion and idealism. First impressions show you as wise and understanding.',
        'first_impression': 'Compassionate, wise, understanding',
        'default_behavior': 'Helping others, seeing the big picture, inspiring',
        'social_style': 'Generous, inclusive, idealistic',
        'advice': 'Your compassion touches many. Set healthy boundaries while serving.'
    },
    11: {
        'number': 11,
        'title': 'The Inspirational Approach',
        'description': 'You approach life with inspiration and vision. First impressions show you as intuitive and inspiring.',
        'first_impression': 'Inspired, intuitive, visionary',
        'default_behavior': 'Inspiring others, following intuition, seeking higher meaning',
        'social_style': 'Charismatic, sensitive, spiritually aware',
        'advice': 'Your inspiration lifts others. Ground your visions in practical action.'
    }
}

# Zodiac-Planet Number Meanings
ZODIAC_PLANET_MEANINGS = {
    'Sun': {
        'number': 1,
        'symbol': '☉',
        'meaning': 'Vitality, leadership, ego, self-expression',
        'influence': 'Brings confidence, creativity, and the drive to shine',
        'day': 'Sunday',
        'gemstone': 'Ruby',
        'color': 'Gold'
    },
    'Moon': {
        'number': 2,
        'symbol': '☽',
        'meaning': 'Emotions, intuition, nurturing, subconscious',
        'influence': 'Brings sensitivity, intuition, and emotional depth',
        'day': 'Monday',
        'gemstone': 'Pearl',
        'color': 'Silver'
    },
    'Jupiter': {
        'number': 3,
        'symbol': '♃',
        'meaning': 'Expansion, wisdom, luck, philosophy',
        'influence': 'Brings optimism, growth, and opportunities',
        'day': 'Thursday',
        'gemstone': 'Yellow Sapphire',
        'color': 'Yellow'
    },
    'Uranus': {
        'number': 4,
        'symbol': '♅',
        'meaning': 'Innovation, rebellion, sudden change, originality',
        'influence': 'Brings unexpected changes and breakthrough thinking',
        'day': 'Sunday',
        'gemstone': 'Hessonite',
        'color': 'Electric Blue'
    },
    'Mercury': {
        'number': 5,
        'symbol': '☿',
        'meaning': 'Communication, intellect, travel, commerce',
        'influence': 'Brings mental agility, adaptability, and communication skills',
        'day': 'Wednesday',
        'gemstone': 'Emerald',
        'color': 'Green'
    },
    'Venus': {
        'number': 6,
        'symbol': '♀',
        'meaning': 'Love, beauty, harmony, pleasure',
        'influence': 'Brings love, artistic ability, and appreciation of beauty',
        'day': 'Friday',
        'gemstone': 'Diamond',
        'color': 'Pink'
    },
    'Neptune': {
        'number': 7,
        'symbol': '♆',
        'meaning': 'Spirituality, dreams, intuition, mysticism',
        'influence': 'Brings spiritual insight, creativity, and psychic ability',
        'day': 'Monday',
        'gemstone': "Cat's Eye",
        'color': 'Violet'
    },
    'Saturn': {
        'number': 8,
        'symbol': '♄',
        'meaning': 'Discipline, karma, structure, responsibility',
        'influence': 'Brings lessons, structure, and eventual rewards through effort',
        'day': 'Saturday',
        'gemstone': 'Blue Sapphire',
        'color': 'Black'
    },
    'Mars': {
        'number': 9,
        'symbol': '♂',
        'meaning': 'Energy, action, courage, passion',
        'influence': 'Brings drive, courage, and the energy to act',
        'day': 'Tuesday',
        'gemstone': 'Red Coral',
        'color': 'Red'
    }
}


def get_interpretation(number: int) -> Dict:
    """
    Get interpretation for a numerology number.
    
    Args:
        number: Numerology number (1-9, 11, 22, 33)
    
    Returns:
        Dictionary with interpretation data
    
    Raises:
        ValueError: If number is not valid
    """
    if number not in INTERPRETATIONS:
        raise ValueError(f"No interpretation available for number {number}")
    
    return INTERPRETATIONS[number].to_dict()


def get_all_interpretations() -> Dict[int, Dict]:
    """Get all interpretations as dictionary."""
    return {num: interp.to_dict() for num, interp in INTERPRETATIONS.items()}


def get_birthday_interpretation(number: int) -> Dict:
    """Get birthday number interpretation."""
    # Reduce to single digit if needed
    reduced = number
    while reduced > 9:
        reduced = sum(int(d) for d in str(reduced))
    
    return BIRTHDAY_NUMBER_INTERPRETATIONS.get(reduced, BIRTHDAY_NUMBER_INTERPRETATIONS[1])


def get_driver_interpretation(number: int) -> Dict:
    """Get driver number interpretation."""
    reduced = number
    while reduced > 9:
        reduced = sum(int(d) for d in str(reduced))
    
    return DRIVER_NUMBER_INTERPRETATIONS.get(reduced, DRIVER_NUMBER_INTERPRETATIONS[1])


def get_conductor_interpretation(number: int) -> Dict:
    """Get conductor number interpretation."""
    # Conductor can be master number
    if number in [11, 22, 33]:
        return CONDUCTOR_NUMBER_INTERPRETATIONS.get(number, CONDUCTOR_NUMBER_INTERPRETATIONS[2])
    
    reduced = number
    while reduced > 9:
        reduced = sum(int(d) for d in str(reduced))
    
    return CONDUCTOR_NUMBER_INTERPRETATIONS.get(reduced, CONDUCTOR_NUMBER_INTERPRETATIONS[1])


def get_attitude_interpretation(number: int) -> Dict:
    """Get attitude number interpretation."""
    # Attitude can be master number 11
    if number == 11:
        return ATTITUDE_NUMBER_INTERPRETATIONS.get(11, ATTITUDE_NUMBER_INTERPRETATIONS[2])
    
    reduced = number
    while reduced > 9:
        reduced = sum(int(d) for d in str(reduced))
    
    return ATTITUDE_NUMBER_INTERPRETATIONS.get(reduced, ATTITUDE_NUMBER_INTERPRETATIONS[1])


def get_planet_meaning(planet_name: str) -> Dict:
    """Get zodiac planet meaning."""
    return ZODIAC_PLANET_MEANINGS.get(planet_name, ZODIAC_PLANET_MEANINGS['Sun'])