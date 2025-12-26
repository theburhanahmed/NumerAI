'use client';

import React, { useState, useEffect } from 'react';
import { MyNumerologyHub } from '@/components/navigation/hubs/my-numerology-hub';
import { numerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { CosmicSkeletonLoader } from '@/components/cosmic/cosmic-skeleton-loader';

export default function AllNumbersPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await numerologyAPI.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const numbers = [
    { key: 'life_path_number', label: 'Life Path Number', description: 'Your life purpose and direction' },
    { key: 'destiny_number', label: 'Destiny Number', description: 'Your natural talents and abilities' },
    { key: 'soul_urge_number', label: 'Soul Urge Number', description: 'Your inner desires and motivations' },
    { key: 'personality_number', label: 'Personality Number', description: 'How others perceive you' },
    { key: 'attitude_number', label: 'Attitude Number', description: 'Your day-to-day approach to life' },
    { key: 'maturity_number', label: 'Maturity Number', description: 'Your life path after age 35' },
    { key: 'balance_number', label: 'Balance Number', description: 'Areas needing balance' },
    { key: 'personal_year_number', label: 'Personal Year Number', description: 'Your yearly cycle energy' },
    { key: 'personal_month_number', label: 'Personal Month Number', description: 'Your monthly cycle energy' },
  ];

  return (
    <MyNumerologyHub>
      {loading ? (
        <CosmicSkeletonLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {numbers.map((num) => (
            <SpaceCard key={num.key} variant="premium" className="p-6" glow>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {profile?.[num.key] || '—'}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{num.label}</h3>
                <p className="text-white/70 text-sm">{num.description}</p>
              </div>
            </SpaceCard>
          ))}
        </div>
      )}
    </MyNumerologyHub>
  );
}

