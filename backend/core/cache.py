"""
Caching utilities for NumerAI.
"""
from django.core.cache import cache
from typing import Optional, Any
import hashlib
import json


class NumerologyCache:
    """Cache manager for numerology calculations."""
    
    # Cache TTL: 24 hours
    CACHE_TTL = 86400
    
    @staticmethod
    def _generate_key(user_id: str, calculation_type: str) -> str:
        """
        Generate cache key for numerology calculation.
        
        Args:
            user_id: User ID
            calculation_type: Type of calculation (e.g., 'profile', 'daily_reading')
        
        Returns:
            Cache key string
        """
        return f"numerology:{user_id}:{calculation_type}"
    
    @classmethod
    def get_profile(cls, user_id: str) -> Optional[dict]:
        """
        Get cached numerology profile.
        
        Args:
            user_id: User ID
        
        Returns:
            Cached profile data or None
        """
        key = cls._generate_key(user_id, 'profile')
        return cache.get(key)
    
    @classmethod
    def set_profile(cls, user_id: str, profile_data: dict) -> None:
        """
        Cache numerology profile.
        
        Args:
            user_id: User ID
            profile_data: Profile data to cache
        """
        key = cls._generate_key(user_id, 'profile')
        cache.set(key, profile_data, cls.CACHE_TTL)
    
    @classmethod
    def invalidate_profile(cls, user_id: str) -> None:
        """
        Invalidate cached profile.
        
        Args:
            user_id: User ID
        """
        key = cls._generate_key(user_id, 'profile')
        cache.delete(key)
    
    @classmethod
    def get_daily_reading(cls, user_id: str, date_str: str) -> Optional[dict]:
        """
        Get cached daily reading.
        
        Args:
            user_id: User ID
            date_str: Date string (YYYY-MM-DD)
        
        Returns:
            Cached reading data or None
        """
        key = cls._generate_key(user_id, f'daily_reading:{date_str}')
        return cache.get(key)
    
    @classmethod
    def set_daily_reading(cls, user_id: str, date_str: str, reading_data: dict) -> None:
        """
        Cache daily reading.
        
        Args:
            user_id: User ID
            date_str: Date string (YYYY-MM-DD)
            reading_data: Reading data to cache
        """
        key = cls._generate_key(user_id, f'daily_reading:{date_str}')
        cache.set(key, reading_data, cls.CACHE_TTL)
    
    @classmethod
    def invalidate_daily_reading(cls, user_id: str, date_str: str) -> None:
        """
        Invalidate cached daily reading.
        
        Args:
            user_id: User ID
            date_str: Date string (YYYY-MM-DD)
        """
        key = cls._generate_key(user_id, f'daily_reading:{date_str}')
        cache.delete(key)