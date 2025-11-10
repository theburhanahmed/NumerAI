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