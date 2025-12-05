'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar,
  User,
  Download,
  Share2,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { useAuth } from '@/contexts/auth-context';
import { reportAPI } from '@/lib/numerology-api';
import { GeneratedReport } from '@/types';

interface Report {
  id: string;
  title: string;
  person_name: string;
  template_name: string;
  generated_at: string;
  report_type: string;
  content: any;
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getGeneratedReport(params.id);
      setReport(data);
    } catch (error: any) {
      console.error('Failed to fetch report:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownload = async () => {
    try {
      // Create a link to the PDF endpoint
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${params.id}/pdf/`, {
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
      a.download = `${report?.title || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert("Failed to download report. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      if (!report) return;
      
      // Create share text
      const shareText = `Check out this numerology report!

` +
        `Title: ${report.title}
` +
        `Generated on: ${new Date(report.generated_at).toLocaleDateString()}`;
      
      if (navigator.share) {
        await navigator.share({
          title: report.title,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
        <AmbientParticles />
        <FloatingOrbs />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-12 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white/50 dark:bg-gray-800/50 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-white/50 dark:bg-gray-800/50 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="default" className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Report Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested report could not be found.
            </p>
            <GlassButton 
              variant="primary" 
              onClick={() => router.push('/reports')}
            >
              Back to Reports
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <GlassButton 
                variant="ghost" 
                onClick={() => router.push('/reports')}
                className="mb-4"
                icon={<ChevronLeft className="w-5 h-5" />}
              >
                Back to Reports
              </GlassButton>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {report.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>Person ID: {report.person}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Template ID: {report.template}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <GlassButton 
                variant="secondary" 
                onClick={handlePrint}
                icon={<Printer className="w-5 h-5" />}
              >
                Print
              </GlassButton>
              <GlassButton 
                variant="secondary" 
                onClick={handleDownload}
                icon={<Download className="w-5 h-5" />}
              >
                Download
              </GlassButton>
              <GlassButton 
                variant="secondary" 
                onClick={handleShare}
                icon={<Share2 className="w-5 h-5" />}
              >
                Share
              </GlassButton>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-8">
            {/* Life Path Number */}
            {report.content.life_path && (
              <GlassCard variant="default" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Life Path Number: {report.content.life_path.number} - {report.content.life_path.title}
                </h2>
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {report.content.life_path.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {report.content.life_path.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Challenges
                      </h3>
                      <ul className="space-y-2">
                        {report.content.life_path.challenges.map((challenge: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Career Paths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.content.life_path.career.map((career: string, index: number) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Relationships
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {report.content.life_path.relationships}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Destiny Number */}
            {report.content.destiny && (
              <GlassCard variant="default" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Destiny Number: {report.content.destiny.number} - {report.content.destiny.title}
                </h2>
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {report.content.destiny.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {report.content.destiny.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Challenges
                      </h3>
                      <ul className="space-y-2">
                        {report.content.destiny.challenges.map((challenge: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Career Paths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.content.destiny.career.map((career: string, index: number) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Relationships
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {report.content.destiny.relationships}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}