'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { decisionAPI, DecisionAnalysis } from '@/lib/numerology-api';

export default function DecisionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [decisionText, setDecisionText] = useState('');
  const [category, setCategory] = useState('personal');
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!decisionText.trim()) return;

    try {
      setAnalyzing(true);
      const result = await decisionAPI.analyzeDecision({
        decision_text: decisionText,
        decision_category: category
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze decision:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8"
        >
          Decision Engine
        </motion.h1>

        <GlassCard variant="default" className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Analyze Your Decision
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What decision are you considering?
              </label>
              <textarea
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder="I'm deciding to..."
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="relationship">Relationship</option>
                <option value="financial">Financial</option>
                <option value="health">Health</option>
                <option value="business">Business</option>
              </select>
            </div>
            <GlassButton
              onClick={handleAnalyze}
              disabled={analyzing || !decisionText.trim()}
              className="w-full"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Decision'}
            </GlassButton>
          </div>
        </GlassCard>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard variant="default" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Numerology Analysis
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personal Day</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analysis.personal_day_number}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personal Year</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analysis.personal_year_number}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Timing Score</p>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {analysis.timing_score}/10
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Recommendation
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{analysis.recommendation}</p>
                </div>

                {analysis.timing_reasoning.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Timing Analysis
                    </h3>
                    <ul className="space-y-2">
                      {analysis.timing_reasoning.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggested_actions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Suggested Actions
                    </h3>
                    <ul className="space-y-2">
                      {analysis.suggested_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <TrendingUp className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
        </div>      </div>
    </div>
  );
}

