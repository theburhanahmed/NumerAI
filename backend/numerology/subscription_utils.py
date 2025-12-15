"""
Subscription utility functions for numerology application.
"""
from accounts.models import User


def get_user_subscription_tier(user: User) -> str:
    """
    Get user's subscription tier.
    
    Args:
        user: User instance
        
    Returns:
        Subscription tier: 'free', 'basic', 'premium', or 'elite'
    """
    # First check if user has an active subscription
    if hasattr(user, 'subscription') and user.subscription:
        subscription = user.subscription
        # Check if subscription is active
        if subscription.status == 'active':
            return subscription.plan
    
    # Fall back to user's subscription_plan field
    subscription_plan = getattr(user, 'subscription_plan', 'free')
    if subscription_plan in ['free', 'basic', 'premium', 'elite']:
        return subscription_plan
    
    return 'free'


def can_access_feature(user: User, feature_name: str) -> bool:
    """
    Check if user's subscription allows access to a specific feature.
    
    Args:
        user: User instance
        feature_name: Name of the feature to check
        
    Returns:
        True if user can access the feature, False otherwise
    """
    from .constants import SUBSCRIPTION_FEATURES
    
    tier = get_user_subscription_tier(user)
    features = SUBSCRIPTION_FEATURES.get(tier, SUBSCRIPTION_FEATURES['free'])
    
    return features.get(feature_name, False)


def get_available_features(user: User) -> dict:
    """
    Get all available features for a user based on their subscription tier.
    
    Args:
        user: User instance
        
    Returns:
        Dictionary of feature names and their access status
    """
    from .constants import SUBSCRIPTION_FEATURES
    
    tier = get_user_subscription_tier(user)
    return SUBSCRIPTION_FEATURES.get(tier, SUBSCRIPTION_FEATURES['free'])












