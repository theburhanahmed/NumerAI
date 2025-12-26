'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users,
  FileStack,
  Plus,
  Minus,
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

// Types imported from '@/types'

interface ReportCombination {
  id: string;
  person: Person;
  template: ReportTemplate;
}

export default function CombineReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [combinations, setCombinations] = useState<ReportCombination[]>([]);
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

  const addCombination = (personId: string, templateId: string) => {
    if (!Array.isArray(people) || !Array.isArray(templates)) {
      return;
    }
    const person = people.find(p => p.id === personId);
    const template = templates.find(t => t.id === templateId);
    
    if (person && template) {
      // Check if combination already exists
      const exists = combinations.some(c => 
        c.person.id === personId && c.template.id === templateId
      );
      
      if (!exists) {
        const newCombination: ReportCombination = {
          id: `${personId}-${templateId}-${Date.now()}`,
          person,
          template
        };
        setCombinations(prev => [...prev, newCombination]);
      }
    }
  };

  const removeCombination = (combinationId: string) => {
    setCombinations(prev => prev.filter(c => c.id !== combinationId));
  };

  const handleGenerateReports = async () => {
    if (combinations.length === 0) {
      setGenerationStatus('error');
      setGenerationMessage('Please add at least one report combination');
      return;
    }

    setGenerating(true);
    setGenerationStatus('idle');
    setGenerationMessage('');

    try {
      const result = await reportAPI.bulkGenerateReports({
        person_ids: combinations.map(c => c.person.id),
        template_ids: combinations.map(c => c.template.id)
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
              Combine Reports
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* People Selection */}
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Users className="w-6 h-6" />
                People
              </h2>

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
                      <SpaceCard variant="premium" className="p-6" glow>
                        <div className="flex items-center gap-4">
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
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Select Template
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-white"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addCombination(person.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Choose template...</option>
                              {Array.isArray(templates) && templates.map(template => (
                                <option key={template.id} value={template.id}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
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
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <FileStack className="w-6 h-6" />
                Templates
              </h2>

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
                      <SpaceCard variant="premium" className="p-6" glow>
                        <div className="flex items-center gap-4">
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
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Select Person
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-white"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addCombination(e.target.value, template.id);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Choose person...</option>
                              {Array.isArray(people) && people.map(person => (
                                <option key={person.id} value={person.id}>
                                  {person.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </SpaceCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Combinations Preview */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Selected Reports ({combinations.length})
                </h2>
              </div>

              {combinations.length === 0 ? (
                <SpaceCard variant="premium" className="p-12 text-center h-full flex flex-col items-center justify-center" glow>
                  <FileText className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Reports Selected
                  </h3>
                  <p className="text-white/70">
                    Select people and templates to generate reports
                  </p>
                </SpaceCard>
              ) : (
                <div className="space-y-4">
                  {combinations.map((combination) => (
                    <motion.div
                      key={combination.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <SpaceCard variant="premium" className="p-6" glow>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {combination.person.name}
                            </h3>
                            <p className="text-white/70">
                              {combination.template.name}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {combination.person.relationship}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {combination.template.report_type}
                              </span>
                            </div>
                          </div>
                          <TouchOptimizedButton 
                            variant="secondary" 
                            size="sm"
                            onClick={() => removeCombination(combination.id)}
                            icon={<Minus className="w-4 h-4" />}
                          >
                            Remove
                          </TouchOptimizedButton>
                        </div>
                      </SpaceCard>
                    </motion.div>
                  ))}
                  
                  {/* Generate Button */}
                  <div className="mt-6">
                    <TouchOptimizedButton 
                      variant="primary" 
                      onClick={handleGenerateReports}
                      disabled={generating || combinations.length === 0}
                      loading={generating}
                      className="w-full"
                      icon={<FileText className="w-5 h-5" />}
                    >
                      Generate {combinations.length} Reports
                    </TouchOptimizedButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}