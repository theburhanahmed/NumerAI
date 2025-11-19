'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search,
  Filter,
  Star,
  ChevronLeft
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useAuth } from '@/contexts/auth-context';
import { reportAPI } from '@/lib/numerology-api';
import { ReportTemplate } from '@/types';

// Type imported from '@/types'

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getReportTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (templateId: string) => {
    router.push(`/reports/generate?template=${templateId}`);
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || template.report_type === filterType)
  );

  const reportTypes = [...new Set(templates.map(t => t.report_type))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
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
                Report Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Browse available report templates and generate personalized numerology reports
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Templates List */}
          <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} variant="default" className="p-6 h-64 animate-pulse">
                    <div className="h-6 bg-white/50 dark:bg-gray-800/50 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-4/5 mb-2"></div>
                    <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-3/4 mb-6"></div>
                    <div className="h-10 bg-white/50 dark:bg-gray-800/50 rounded-2xl"></div>
                  </GlassCard>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <GlassCard variant="default" className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Templates Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || filterType 
                    ? 'No templates match your search or filters.' 
                    : 'There are currently no report templates available.'}
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <GlassCard variant="default" className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {template.report_type}
                            </span>
                            {template.is_premium && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 flex-1 mb-6">
                        {template.description}
                      </p>
                      
                      <GlassButton 
                        variant="primary" 
                        onClick={() => handleGenerateReport(template.id)}
                        icon={<FileText className="w-5 h-5" />}
                      >
                        Generate Report
                      </GlassButton>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}