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
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
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
      setPeople(data);
    } catch (error: any) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await reportAPI.getReportTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const addCombination = (personId: string, templateId: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <GlassButton 
              variant="ghost" 
              onClick={() => router.push('/reports')}
              icon={<ChevronLeft className="w-5 h-5" />}
            >
              Back to Reports
            </GlassButton>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Combine Reports
            </h1>
          </div>

          {/* Generation Status */}
          {generationStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-2xl ${
              generationStatus === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {generationStatus === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    generationStatus === 'success' 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {generationMessage}
                  </p>
                  {generationStatus === 'success' && (
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Users className="w-6 h-6" />
                People
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <GlassCard key={i} variant="default" className="p-6 h-24 animate-pulse">
                      <div className="h-6 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-1/2"></div>
                    </GlassCard>
                  ))}
                </div>
              ) : people.length === 0 ? (
                <GlassCard variant="default" className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No People Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add people to generate reports for them
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <GlassCard variant="default" className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {person.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {new Date(person.birth_date).toLocaleDateString()}
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {person.relationship}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Template
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addCombination(person.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Choose template...</option>
                              {templates.map(template => (
                                <option key={template.id} value={template.id}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Templates Selection */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <FileStack className="w-6 h-6" />
                Templates
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <GlassCard key={i} variant="default" className="p-6 h-24 animate-pulse">
                      <div className="h-6 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-white/50 dark:bg-gray-800/50 rounded w-1/2"></div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <GlassCard variant="default" className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {template.report_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Person
                          </label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addCombination(e.target.value, template.id);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Choose person...</option>
                              {people.map(person => (
                                <option key={person.id} value={person.id}>
                                  {person.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Combinations Preview */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Selected Reports ({combinations.length})
                </h2>
              </div>

              {combinations.length === 0 ? (
                <GlassCard variant="default" className="p-12 text-center h-full flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Reports Selected
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select people and templates to generate reports
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-4">
                  {combinations.map((combination) => (
                    <motion.div
                      key={combination.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <GlassCard variant="default" className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {combination.person.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {combination.template.name}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {combination.person.relationship}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {combination.template.report_type}
                              </span>
                            </div>
                          </div>
                          <GlassButton 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeCombination(combination.id)}
                            icon={<Minus className="w-4 h-4" />}
                          >
                            Remove
                          </GlassButton>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                  
                  {/* Generate Button */}
                  <div className="mt-6">
                    <GlassButton 
                      variant="primary" 
                      onClick={handleGenerateReports}
                      disabled={generating || combinations.length === 0}
                      className="w-full"
                      icon={generating ? undefined : <FileText className="w-5 h-5" />}
                    >
                      {generating ? 'Generating...' : `Generate ${combinations.length} Reports`}
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}