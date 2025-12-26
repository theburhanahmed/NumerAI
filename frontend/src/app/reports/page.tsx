'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { PageDescription } from '@/components/ui/page-description';
import { useAuth } from '@/contexts/auth-context';
import { reportAPI, peopleAPI } from '@/lib/numerology-api';
import { GeneratedReport, Person, ReportTemplate } from '@/types';

// Types imported from '@/types'

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('');

  useEffect(() => {
    fetchReports();
    fetchPeople();
    fetchTemplates();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getGeneratedReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const data = await peopleAPI.getPeople();
      setPeople(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch people:', error);
      setPeople([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await reportAPI.getReportTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    }
  };

  const handleGenerateReport = () => {
    router.push('/reports/generate');
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      // Create a link to the PDF endpoint
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/pdf/`, {
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
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert("Failed to download report. Please try again.");
    }
  };

  const filteredReports = Array.isArray(reports) 
    ? reports.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterPerson === '' || (Array.isArray(people) && people.find(p => p.id === report.person)?.name === filterPerson)) &&
        (filterTemplate === '' || (Array.isArray(templates) && templates.find(t => t.id === report.template)?.name === filterTemplate))
      )
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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Reports
              </h1>
              <p className="text-white/70 mt-2">
                View and manage your generated numerology reports
              </p>
            </div>
            
            <TouchOptimizedButton 
              variant="primary" 
              onClick={handleGenerateReport}
              icon={<Plus className="w-5 h-5" />}
            >
              Generate Report
            </TouchOptimizedButton>
          </div>

          {/* Page Description */}
          <PageDescription
            title="Numerology Reports"
            description="Generate comprehensive numerology reports for yourself or people in your life. These detailed reports combine all aspects of numerology including life path, destiny, soul urge, personality, cycles, and more. Reports can be generated in various formats and templates, and downloaded as PDFs for offline reference."
            features={[
              "Multiple report templates (Basic, Detailed, Yearly Forecast)",
              "Generate reports for yourself or any person in your list",
              "PDF export for offline access and sharing",
              "Bulk report generation for multiple people",
              "Report history and search functionality",
              "Detailed interpretations and insights",
              "Visual charts and number breakdowns"
            ]}
            usage="Click 'Generate Report' to create a new report. Select a template, choose the person (yourself or someone from your people list), and generate. Reports are saved automatically and can be viewed, downloaded, or shared. Use the search and filters to find specific reports quickly."
            examples={[
              "Generate a detailed report for yourself to understand your complete numerology profile",
              "Create reports for family members to understand family dynamics",
              "Generate yearly forecast reports to plan ahead",
              "Export reports as PDFs to share with others or keep for reference"
            ]}
          />

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-white"
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
              >
                <option value="">All People</option>
                {Array.isArray(people) && people.map(person => (
                  <option key={person.id} value={person.name}>{person.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-5 h-5 text-cyan-400/70" />
              </div>
            </div>
            
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-white"
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
              >
                <option value="">All Templates</option>
                {Array.isArray(templates) && templates.map(template => (
                  <option key={template.id} value={template.name}>{template.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="w-5 h-5 text-cyan-400/70" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold text-white">
                    {reports.length}
                  </p>
                </div>
              </div>
            </SpaceCard>
            
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">People</p>
                  <p className="text-2xl font-bold text-white">{Array.isArray(people) ? people.length : 0}</p>
                </div>
              </div>
            </SpaceCard>
            
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Last Report</p>
                  <p className="text-2xl font-bold text-white">
                    {reports.length > 0 ? new Date(reports[0].generated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </SpaceCard>
          </div>

          {/* Reports List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Generated Reports</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SpaceCard key={i} variant="premium" className="p-6 h-24 animate-pulse" glow>
                    <div className="h-6 bg-[#1a2942]/40 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-[#1a2942]/40 rounded w-1/2"></div>
                  </SpaceCard>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <SpaceCard variant="premium" className="p-12 text-center" glow>
                <FileText className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Reports Found
                </h3>
                <p className="text-white/70 mb-6">
                  {searchTerm || filterPerson || filterTemplate 
                    ? 'No reports match your search or filters.' 
                    : 'Generate your first report to get started.'}
                </p>
                <TouchOptimizedButton 
                  variant="primary" 
                  onClick={handleGenerateReport}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Generate Report
                </TouchOptimizedButton>
              </SpaceCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <SpaceCard variant="premium" className="p-6" glow>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {report.title}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {new Date(report.generated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {(Array.isArray(templates) && templates.find(t => t.id === report.template)?.name) || 'Unknown Template'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <TouchOptimizedButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </TouchOptimizedButton>
                        <TouchOptimizedButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          icon={<Download className="w-4 h-4" />}
                        >
                          Download
                        </TouchOptimizedButton>
                      </div>
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