'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users,
  FileStack,
  CheckCircle,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI, reportAPI } from '@/lib/numerology-api';
import { Person, ReportTemplate } from '@/types';

export default function BulkGenerateReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generationMessage, setGenerationMessage] = useState('');

  useEffect(() => {
    fetchPeople();
    fetchTemplates();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const data = await peopleAPI.getPeople();
      setPeople(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
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

  const handleSelectPerson = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId) 
        : [...prev, personId]
    );
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId) 
        : [...prev, templateId]
    );
  };

  const handleSelectAllPeople = () => {
    if (!Array.isArray(people)) {
      return;
    }
    if (selectedPeople.length === people.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(people.map(p => p.id));
    }
  };

  const handleSelectAllTemplates = () => {
    if (!Array.isArray(templates)) {
      return;
    }
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map(t => t.id));
    }
  };

  const handleGenerateReports = async () => {
    if (selectedPeople.length === 0 || selectedTemplates.length === 0) {
      setGenerationStatus('error');
      setGenerationMessage('Please select at least one person and one template');
      return;
    }

    setGenerating(true);
    setGenerationStatus('idle');
    setGenerationMessage('');

    try {
      const result = await reportAPI.bulkGenerateReports({
        person_ids: selectedPeople,
        template_ids: selectedTemplates
      });
      
      if (result.errors && result.errors.length > 0) {
        setGenerationStatus('error');
        setGenerationMessage(`Generated ${result.reports.length} reports with ${result.errors.length} errors`);
      } else {
        setGenerationStatus('success');
        setGenerationMessage(`Successfully generated ${result.reports.length} reports`);
        // Redirect to reports page after a delay
        setTimeout(() => {
          router.push('/reports');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to generate reports:', error);
      setGenerationStatus('error');
      setGenerationMessage('Failed to generate reports: ' + (error.response?.data?.error || error.message));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <CosmicPageLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <TouchOptimizedButton 
              variant="secondary" 
              onClick={() => router.push('/reports')}
              icon={<ChevronLeft className="w-5 h-5" />}
            >
              Back to Reports
            </TouchOptimizedButton>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Bulk Generate Reports
            </h1>
          </div>

          {/* Generation Status */}
          {generationStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-2xl ${
              generationStatus === 'success' 
                ? 'bg-green-900/30 border border-green-500/30' 
                : 'bg-red-900/30 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {generationStatus === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    generationStatus === 'success' 
                      ? 'text-green-200' 
                      : 'text-red-200'
                  }`}>
                    {generationMessage}
                  </p>
                  {generationStatus === 'success' && (
                    <p className="text-green-300 text-sm mt-1">
                      Redirecting to reports page...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* People Selection */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Select People ({selectedPeople.length})
                </h2>
                <TouchOptimizedButton 
                  variant="secondary" 
                  size="sm"
                  onClick={handleSelectAllPeople}
                >
                  {Array.isArray(people) && selectedPeople.length === people.length ? 'Deselect All' : 'Select All'}
                </TouchOptimizedButton>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <SpaceCard key={i} variant="premium" className="p-6 h-24 animate-pulse" glow>
                      <div className="h-6 bg-[#1a2942]/40 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-[#1a2942]/40 rounded w-1/2"></div>
                    </SpaceCard>
                  ))}
                </div>
              ) : people.length === 0 ? (
                <SpaceCard variant="premium" className="p-12 text-center" glow>
                  <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No People Found
                  </h3>
                  <p className="text-white/70">
                    Add people to generate reports for them
                  </p>
                </SpaceCard>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(people) && people.map((person) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <SpaceCard 
                        variant="premium"
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          selectedPeople.includes(person.id) 
                            ? 'ring-2 ring-purple-500 bg-purple-500/20' 
                            : ''
                        }`}
                        glow={selectedPeople.includes(person.id)}
                        onClick={() => handleSelectPerson(person.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPeople.includes(person.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-cyan-500/30'
                          }`}>
                            {selectedPeople.includes(person.id) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              {person.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-white/70 text-sm">
                                {new Date(person.birth_date).toLocaleDateString()}
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {person.relationship}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SpaceCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Templates Selection */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileStack className="w-6 h-6" />
                  Select Templates ({selectedTemplates.length})
                </h2>
                <TouchOptimizedButton 
                  variant="secondary" 
                  size="sm"
                  onClick={handleSelectAllTemplates}
                >
                  {Array.isArray(templates) && selectedTemplates.length === templates.length ? 'Deselect All' : 'Select All'}
                </TouchOptimizedButton>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <SpaceCard key={i} variant="premium" className="p-6 h-24 animate-pulse" glow>
                      <div className="h-6 bg-[#1a2942]/40 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-[#1a2942]/40 rounded w-1/2"></div>
                    </SpaceCard>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(templates) && templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <SpaceCard 
                        variant="premium"
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          selectedTemplates.includes(template.id) 
                            ? 'ring-2 ring-purple-500 bg-purple-500/20' 
                            : ''
                        }`}
                        glow={selectedTemplates.includes(template.id)}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedTemplates.includes(template.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-cyan-500/30'
                          }`}>
                            {selectedTemplates.includes(template.id) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              {template.name}
                            </h3>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {template.report_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SpaceCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary and Action Buttons */}
          <div className="mt-12">
            <SpaceCard variant="premium" className="p-6" glow>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Generate Multiple Reports
                  </h3>
                  <p className="text-white/70">
                    You have selected {selectedPeople.length} people and {selectedTemplates.length} templates.
                    This will generate {selectedPeople.length * selectedTemplates.length} reports.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <TouchOptimizedButton 
                    variant="secondary" 
                    onClick={() => router.push('/reports')}
                    disabled={generating}
                  >
                    Cancel
                  </TouchOptimizedButton>
                  <TouchOptimizedButton 
                    variant="primary" 
                    onClick={handleGenerateReports}
                    disabled={generating || selectedPeople.length === 0 || selectedTemplates.length === 0}
                    loading={generating}
                    icon={<FileText className="w-5 h-5" />}
                  >
                    Generate {selectedPeople.length * selectedTemplates.length} Reports
                  </TouchOptimizedButton>
                </div>
              </div>
            </SpaceCard>
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}