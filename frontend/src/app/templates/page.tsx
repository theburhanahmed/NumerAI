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
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
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
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (templateId: string) => {
    router.push(`/reports/generate?template=${templateId}`);
  };

  // Ensure templates is an array before filtering
  const filteredTemplates = Array.isArray(templates) 
    ? templates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === '' || template.report_type === filterType)
      )
    : [];

  // Ensure templates is an array before mapping for report types
  const reportTypes = Array.isArray(templates) 
    ? [...new Set(templates.map(t => t.report_type))]
    : [];

  return (
    <CosmicPageLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <TouchOptimizedButton 
                variant="secondary" 
                onClick={() => router.push('/reports')}
                className="mb-4"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Reports
              </TouchOptimizedButton>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Report Templates
              </h1>
              <p className="text-white/70 mt-2">
                Browse available report templates and generate personalized numerology reports
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-5 h-5 text-white/60" />
              </div>
            </div>
          </div>

          {/* Templates List */}
          <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <SpaceCard key={i} variant="elevated" className="p-6 h-64 animate-pulse">
                    <div className="h-6 bg-white/10 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-4/5 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-6"></div>
                    <div className="h-10 bg-white/10 rounded-2xl"></div>
                  </SpaceCard>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <SpaceCard variant="elevated" className="p-12 text-center">
                <FileText className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Templates Found
                </h3>
                <p className="text-white/70 mb-6">
                  {searchTerm || filterType 
                    ? 'No templates match your search or filters.' 
                    : 'There are currently no report templates available.'}
                </p>
              </SpaceCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <SpaceCard variant="elevated" className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {template.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {template.report_type}
                            </span>
                            {template.is_premium && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-white/70 flex-1 mb-6">
                        {template.description}
                      </p>
                      
                      <TouchOptimizedButton 
                        variant="primary" 
                        onClick={() => handleGenerateReport(template.id)}
                        className="w-full"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Generate Report
                      </TouchOptimizedButton>
                    </SpaceCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}