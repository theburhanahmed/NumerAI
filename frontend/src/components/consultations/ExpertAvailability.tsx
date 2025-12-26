'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { consultationsAPI } from '@/lib/consultations-api';
import { toast } from 'sonner';
import type { ExpertAvailability } from '@/types/consultations';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface ExpertAvailabilityProps {
  onSave?: () => void;
}

export function ExpertAvailabilityManager({ onSave }: ExpertAvailabilityProps) {
  const [availability, setAvailability] = useState<Partial<ExpertAvailability>[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    const existing = availability.find(a => a.day_of_week === dayIndex);
    if (existing) {
      setAvailability(availability.filter(a => a.day_of_week !== dayIndex));
    } else {
      setAvailability([
        ...availability,
        {
          day_of_week: dayIndex,
          start_time: '09:00',
          end_time: '17:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_available: true,
        },
      ]);
    }
  };

  const updateDayTime = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(
      availability.map(a =>
        a.day_of_week === dayIndex ? { ...a, [field]: value } : a
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await consultationsAPI.updateExpertAvailability(
        availability as ExpertAvailability[]
      );
      toast.success('Availability updated successfully');
      if (onSave) onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Availability</h2>
      
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayAvailability = availability.find(a => a.day_of_week === index);
          const isEnabled = !!dayAvailability;

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => handleDayToggle(index)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-medium mb-2">{day}</div>
                {isEnabled && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <input
                        type="time"
                        value={dayAvailability.start_time}
                        onChange={(e) => updateDayTime(index, 'start_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                    <span>to</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayAvailability.end_time}
                        onChange={(e) => updateDayTime(index, 'end_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <GlassButton onClick={handleSave} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Availability'}
        </GlassButton>
      </div>
    </GlassCard>
  );
}

