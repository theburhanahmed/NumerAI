'use client';

import React, { useState, useEffect } from 'react';
import { predictiveNumerologyAPI } from '@/lib/numerology-api';
import { SpaceCard } from '@/components/space/space-card';
import { Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function YearlyForecastReport() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchForecast();
  }, [selectedYear]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictiveNumerologyAPI.getYearlyForecast(selectedYear);
      if (data.success && data.forecast) {
        setForecast(data.forecast);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load yearly forecast');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <SpaceCard variant="elevated" className="p-6">
        <p className="text-red-400">{error}</p>
      </SpaceCard>
    );
  }

  if (!forecast) {
    return (
      <SpaceCard variant="elevated" className="p-6 text-center">
        <p className="text-white/70">No forecast data available.</p>
      </SpaceCard>
    );
  }

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-white/70';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Yearly Forecast</h2>
          <p className="text-white/70">Comprehensive forecast for a specific year</p>
        </div>
        <div>
          <label className="text-white/70 text-sm mr-2">Year:</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 50}
            className="px-3 py-1 bg-gray-800 border border-white/10 rounded text-white text-sm w-32"
          />
        </div>
      </div>

      <SpaceCard variant="premium" className="p-6" glow>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-2xl font-bold text-white">{forecast.year}</h3>
            <p className="text-white/70">Personal Year {forecast.personal_year}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Year Theme</h4>
            <p className="text-lg font-semibold text-cyan-400">{forecast.year_theme}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Energy Level</h4>
            <p className={`text-lg font-semibold capitalize ${getEnergyColor(forecast.energy_level)}`}>
              {forecast.energy_level}
            </p>
          </div>
        </div>

        {forecast.key_focus && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-2">Key Focus</h4>
            <p className="text-white/80">{forecast.key_focus}</p>
          </div>
        )}

        {forecast.advice && (
          <div className="mb-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Yearly Advice</h4>
            <p className="text-white/90">{forecast.advice}</p>
          </div>
        )}

        {forecast.key_events && forecast.key_events.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Key Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {forecast.key_events.map((event: string, i: number) => (
                <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-white/80 text-sm">{event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {forecast.monthly_forecasts && forecast.monthly_forecasts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Monthly Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecast.monthly_forecasts.map((month: any, i: number) => (
                <div key={i} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">
                      {new Date(2000, month.month - 1).toLocaleString('default', { month: 'long' })}
                    </span>
                    <span className="text-cyan-400 font-bold">{month.personal_month}</span>
                  </div>
                  <p className="text-white/70 text-sm">{month.theme}</p>
                  <p className="text-white/60 text-xs mt-1">{month.focus}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SpaceCard>
    </div>
  );
}

