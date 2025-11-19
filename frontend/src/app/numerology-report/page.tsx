'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileTextIcon, 
  DownloadIcon, 
  ShareIcon,
  SparklesIcon,
  StarIcon,
  HeartIcon,
  TrendingUpIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarIcon
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useNumerologyReport } from '@/lib/hooks';

export default function NumerologyReportPage() {
  const router = useRouter();
  const { report, loading, error } = useNumerologyReport();

  const handleDownload = async () => {
    try {
      // Create a link to the PDF endpoint
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/numerology/full-report/pdf/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `numerology_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert("Report downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      alert("Failed to download report. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      // Get the current user's report data
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/numerology/full-report/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const reportData = await response.json();
      
      // Create share text
      const shareText = `Check out my numerology report!

` +
        `Name: ${reportData.full_name}
` +
        `Life Path: ${reportData.life_path_number} - ${reportData.life_path_title}
` +
        `Destiny: ${reportData.destiny_number} - ${reportData.destiny_title}
` +
        `Soul Urge: ${reportData.soul_urge_number} - ${reportData.soul_urge_title}

` +
        `Generated on: ${new Date().toLocaleDateString()}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Numerology Report',
          text: shareText,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert("Report details copied to clipboard!");
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert("Failed to share report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Numerology Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your complete numerology profile and insights
              </p>
            </div>
            
            <div className="flex gap-3">
              <GlassButton 
                variant="secondary" 
                onClick={handleShare}
                icon={<ShareIcon className="w-5 h-5" />}
              >
                Share
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={handleDownload}
                icon={<DownloadIcon className="w-5 h-5" />}
              >
                Download
              </GlassButton>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <GlassCard variant="default" className="p-8 h-48 animate-pulse">
                <div className="h-8 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-white/50 dark:bg-gray-800/50 rounded w-1/2"></div>
              </GlassCard>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <GlassCard key={item} variant="default" className="p-6 h-40 animate-pulse">
                    <div className="h-6 bg-white/50 dark:bg-gray-800/50 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-white/50 dark:bg-gray-800/50 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded"></div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ) : error ? (
            <GlassCard variant="default" className="p-12 text-center">
              <FileTextIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Report</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <GlassButton 
                variant="primary" 
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </GlassButton>
            </GlassCard>
          ) : report ? (
            <div className="space-y-8">
              {/* Report Header */}
              <GlassCard variant="elevated" className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {report.full_name}&apos;s Numerology Report
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Birth Date: {new Date(report.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-10 h-10 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Report ID</p>
                      <p className="font-mono text-gray-900 dark:text-white">#NR-2024-{report.life_path_number}{report.destiny_number}{Math.floor(Math.random() * 100)}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Core Numbers */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Core Numbers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CoreNumberCard 
                    icon={<StarIcon className="w-6 h-6" />}
                    title="Life Path"
                    number={report.life_path_number}
                    description={report.life_path_title}
                    color="from-blue-500 to-purple-600"
                  />
                  
                  <CoreNumberCard 
                    icon={<SparklesIcon className="w-6 h-6" />}
                    title="Destiny"
                    number={report.destiny_number}
                    description={report.destiny_title}
                    color="from-purple-500 to-pink-600"
                  />
                  
                  <CoreNumberCard 
                    icon={<HeartIcon className="w-6 h-6" />}
                    title="Soul Urge"
                    number={report.soul_urge_number}
                    description={report.soul_urge_title}
                    color="from-pink-500 to-red-600"
                  />
                  
                  <CoreNumberCard 
                    icon={<TrendingUpIcon className="w-6 h-6" />}
                    title="Personality"
                    number={report.personality_number}
                    description={report.personality_title}
                    color="from-green-500 to-teal-600"
                  />
                  
                  <CoreNumberCard 
                    icon={<CalendarIcon className="w-6 h-6" />}
                    title="Birthday"
                    number={report.birthday_number}
                    description={report.birthday_title}
                    color="from-amber-500 to-orange-600"
                  />
                  
                  <CoreNumberCard 
                    icon={<ShieldCheckIcon className="w-6 h-6" />}
                    title="Challenge"
                    number={report.challenge_number}
                    description={report.challenge_title}
                    color="from-indigo-500 to-purple-600"
                  />
                </div>
              </div>

              {/* Pinnacle Cycles */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pinnacle Cycles</h2>
                <GlassCard variant="default" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {report.pinnacle_cycle.map((cycle: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl text-center"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-white">{cycle.number}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Ages {cycle.age}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cycle.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Report Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Report Summary</h2>
                <GlassCard variant="default" className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {report.summary}
                  </p>
                </GlassCard>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center py-8">
                <GlassButton 
                  variant="primary" 
                  onClick={() => router.push('/ai-chat')}
                  icon={<SparklesIcon className="w-5 h-5" />}
                >
                  Discuss with AI Numerologist
                </GlassButton>
                <GlassButton 
                  variant="secondary" 
                  onClick={() => router.push('/remedies')}
                >
                  View Personalized Remedies
                </GlassButton>
                <GlassButton 
                  variant="ghost" 
                  onClick={() => router.push('/compatibility')}
                >
                  Check Compatibility
                </GlassButton>
              </div>
            </div>
          ) : (
            <GlassCard variant="default" className="p-12 text-center">
              <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Report Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn&apos;t find your numerology report. Please generate a birth chart first.
              </p>
              <GlassButton 
                variant="primary" 
                onClick={() => router.push('/birth-chart')}
              >
                Generate Birth Chart
              </GlassButton>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function CoreNumberCard({ icon, title, number, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  number: number; 
  description: string;
  color: string;
}) {
  return (
    <GlassCard variant="default" className="p-6">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {number}
            </span>
            <span className="text-gray-600 dark:text-gray-400">- {description}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}