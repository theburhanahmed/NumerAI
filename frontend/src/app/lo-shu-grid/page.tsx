'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { LoShuGrid } from '@/components/numerology/lo-shu-grid';
import { numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { FeatureGate } from '@/components/FeatureGate';
import { toast } from 'sonner';
import { peopleAPI } from '@/lib/numerology-api';

export default function LoShuGridPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [gridData, setGridData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enhanced, setEnhanced] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [person1Id, setPerson1Id] = useState<string>('self');
  const [person2Id, setPerson2Id] = useState<string>('');
  const [people, setPeople] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/lo-shu-grid')}`);
    }
  }, [user, authLoading, router]);

  // Fetch people list
  useEffect(() => {
    const fetchPeople = async () => {
      if (!user) return;
      try {
        const peopleList = await peopleAPI.getPeople();
        setPeople(peopleList);
      } catch (error) {
        console.error('Failed to fetch people:', error);
      }
    };
    fetchPeople();
  }, [user]);

  // Fetch grid data
  useEffect(() => {
    const fetchGrid = async () => {
      if (!user || comparisonMode) return;
      
      setLoading(true);
      try {
        const data = await numerologyAPI.getLoShuGrid(enhanced);
        setGridData(data);
      } catch (error: any) {
        console.error('Failed to fetch Lo Shu Grid:', error);
        if (error.response?.status === 403) {
          toast.error('Enhanced visualization requires Premium plan');
          setEnhanced(false);
          // Try again with basic grid
          try {
            const data = await numerologyAPI.getLoShuGrid(false);
            setGridData(data);
          } catch (e) {
            toast.error('Failed to load Lo Shu Grid');
          }
        } else {
          toast.error('Failed to load Lo Shu Grid');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGrid();
  }, [user, enhanced, comparisonMode]);

  const handleCompare = async () => {
    if (!person1Id || !person2Id) {
      toast.error('Please select both people to compare');
      return;
    }

    setComparing(true);
    try {
      const comparison = await numerologyAPI.compareLoShuGrids(person1Id, person2Id);
      setComparisonData(comparison);
      setComparisonMode(true);
    } catch (error: any) {
      console.error('Failed to compare grids:', error);
      toast.error(error.response?.data?.error || 'Failed to compare grids');
    } finally {
      setComparing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white">
              <Grid3x3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Lo Shu Grid
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Chinese Numerology Magic Square
              </p>
            </div>
          </div>
        </motion.div>

        <FeatureGate featureName="lo_shu_grid">
          {!comparisonMode ? (
            <>
              {gridData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <LoShuGrid gridData={gridData} showArrows={enhanced} />
                </motion.div>
              )}

              <FeatureGate featureName="numerology_lo_shu_visualization">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <GlassCard variant="default" className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Grid Comparison
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Person 1
                          </label>
                          <select
                            value={person1Id}
                            onChange={(e) => setPerson1Id(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="self">Myself</option>
                            {people.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Person 2
                          </label>
                          <select
                            value={person2Id}
                            onChange={(e) => setPerson2Id(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">Select person...</option>
                            <option value="self">Myself</option>
                            {people.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleCompare}
                        disabled={comparing || !person1Id || !person2Id}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {comparing ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Comparing...
                          </span>
                        ) : (
                          'Compare Grids'
                        )}
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              </FeatureGate>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard variant="default" className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Grid Comparison Results
                  </h2>
                  <button
                    onClick={() => {
                      setComparisonMode(false);
                      setComparisonData(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to Grid
                  </button>
                </div>

                {comparisonData && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {comparisonData.person1_name} vs {comparisonData.person2_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {comparisonData.compatibility_score}%
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Compatibility
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {comparisonData.matching_positions}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Matching
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {comparisonData.complementary_positions}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Complementary
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {comparisonData.conflicting_positions}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Conflicting
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Insights
                      </h3>
                      <ul className="space-y-2">
                        {comparisonData.insights.map((insight: string, idx: number) => (
                          <li
                            key={idx}
                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                          >
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {comparisonData.recommendations && comparisonData.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {comparisonData.recommendations.map((rec: string, idx: number) => (
                            <li
                              key={idx}
                              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </FeatureGate>
      </div>
    </div>
  );
}

