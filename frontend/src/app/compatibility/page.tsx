'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UsersIcon, 
  SparklesIcon,
  UserIcon,
  CalendarIcon
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { numerologyAPI } from '@/lib/numerology-api';

export default function CompatibilityCheckerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    relationshipType: 'romantic'
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await numerologyAPI.checkCompatibility({
        partner_name: formData.name,
        partner_birth_date: formData.birthDate,
        relationship_type: formData.relationshipType as 'romantic' | 'business' | 'friendship' | 'family'
      });
      setResult(data);
    } catch (err) {
      setError('Failed to check compatibility. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Compatibility Checker
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analyze relationships and business partnerships
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
                Our compatibility checker uses numerology to analyze the energetic connections between you 
                and another person. By comparing your Life Path Numbers and other key numerology factors, 
                we can reveal the dynamics, strengths, and challenges in your relationship.
              </p>
            </div>
            
            <GlassButton 
              variant="secondary" 
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-1">
              <GlassCard variant="elevated" className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Check Compatibility</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter the details of the person you&apos;d like to analyze compatibility with. 
                  We&apos;ll compare your numerology profiles to reveal relationship dynamics.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Partner&apos;s Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Birth Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Relationship Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.relationshipType}
                        onChange={(e) => setFormData({...formData, relationshipType: e.target.value})}
                        className="w-full px-3 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="romantic">Romantic</option>
                        <option value="business">Business</option>
                        <option value="friendship">Friendship</option>
                        <option value="family">Family</option>
                      </select>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  <GlassButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Analyzing...
                      </div>
                    ) : (
                      "Check Compatibility"
                    )}
                  </GlassButton>
                </form>
              </GlassCard>
              
              {/* Info Card */}
              <GlassCard variant="default" className="p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How It Works</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Our compatibility checker analyzes numerological profiles to determine relationship dynamics, 
                  strengths, and areas for growth based on ancient numerology principles.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Compares Life Path Numbers for core compatibility</p>
                  <p>• Analyzes Destiny Numbers for shared talents and goals</p>
                  <p>• Examines Soul Urge Numbers for emotional connection</p>
                  <p>• Considers Personality Numbers for communication styles</p>
                </div>
              </GlassCard>
            </div>
            
            {/* Results */}
            <div className="lg:col-span-2">
              {result ? (
                <GlassCard variant="elevated" className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compatibility Results</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your compatibility score is based on the alignment of key numerology numbers 
                    between you and your partner. Higher scores indicate stronger natural connections.
                  </p>
                  
                  {/* Score */}
                  <div className="text-center mb-8">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="8" 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="url(#gradient)" 
                          strokeWidth="8" 
                          strokeDasharray={`${result.compatibility_score * 2.83} 283`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {result.compatibility_score}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Match</span>
                      </div>
                    </div>
                    <p className="text-lg text-gray-900 dark:text-white mt-4">{result.advice}</p>
                  </div>
                  
                  {/* Strengths and Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <HeartIcon className="w-5 h-5" />
                        Strengths
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        These are the areas where you and your partner naturally connect and support each other.
                      </p>
                      <ul className="space-y-2">
                        {Array.isArray(result.strengths) && result.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        Challenges
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        These are areas where you and your partner may experience friction or need to work on communication.
                      </p>
                      <ul className="space-y-2">
                        {Array.isArray(result.challenges) && result.challenges.map((challenge: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Advice */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      Advice
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Personalized guidance to help you navigate this relationship successfully.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl">
                      {result.advice}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <GlassButton 
                      variant="primary" 
                      onClick={() => {
                        setResult(null);
                        setFormData({
                          name: '',
                          birthDate: '',
                          relationshipType: 'romantic'
                        });
                      }}
                    >
                      Check Another
                    </GlassButton>
                    <GlassButton 
                      variant="secondary" 
                      onClick={() => router.push('/ai-chat')}
                    >
                      Discuss with AI
                    </GlassButton>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard variant="default" className="p-12 text-center h-full flex flex-col items-center justify-center">
                  <HeartIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check Compatibility</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Enter your partner&apos;s details to analyze your relationship compatibility based on numerology.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}