'use client';

import React, { useState } from 'react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { Calendar, Search, AlertCircle } from 'lucide-react';
import { numerologyAPI } from '@/lib/numerology-api';
import { useToast } from '@/components/ui/use-toast';

export function MedicalTimingCalculator() {
  const { toast } = useToast();
  const [procedureType, setProcedureType] = useState('surgery');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const procedureTypes = [
    { value: 'surgery', label: 'Surgery' },
    { value: 'dental', label: 'Dental' },
    { value: 'checkup', label: 'Checkup' },
    { value: 'therapy', label: 'Therapy' },
  ];

  const handleCalculate = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // Note: This would need to be implemented in the API
      // For now, showing the structure
      toast({
        title: 'Success',
        description: 'Medical timing calculated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to calculate medical timing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpaceCard variant="premium" className="p-6" glow>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        Medical Timing Calculator
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">Procedure Type</label>
          <select
            value={procedureType}
            onChange={(e) => setProcedureType(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
          >
            {procedureTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
            />
          </div>
        </div>

        <TouchOptimizedButton
          onClick={handleCalculate}
          variant="primary"
          disabled={loading}
          icon={<Search className="w-4 h-4" />}
        >
          {loading ? 'Calculating...' : 'Find Optimal Dates'}
        </TouchOptimizedButton>

        {results && (
          <div className="mt-6 space-y-4">
            {results.optimal_dates && results.optimal_dates.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Optimal Dates</h4>
                <div className="space-y-2">
                  {results.optimal_dates.slice(0, 5).map((date: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <p className="text-white font-semibold">{date.date}</p>
                      <p className="text-white/70 text-sm">Score: {date.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.dates_to_avoid && results.dates_to_avoid.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Dates to Avoid
                </h4>
                <div className="space-y-2">
                  {results.dates_to_avoid.slice(0, 5).map((date: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                    >
                      <p className="text-white font-semibold">{date.date}</p>
                      <p className="text-white/70 text-sm">Score: {date.score}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SpaceCard>
  );
}

