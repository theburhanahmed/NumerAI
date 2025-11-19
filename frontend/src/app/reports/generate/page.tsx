'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User,
  Users,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI, reportAPI } from '@/lib/numerology-api';
import { Person, ReportTemplate } from '@/types';
import { Suspense } from 'react';

function GenerateReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [people, setPeople] = useState<(Person & { selected: boolean })[]>([]);
  const [templates, setTemplates] = useState<(ReportTemplate & { selected: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generationMessage, setGenerationMessage] = useState('');

  const fetchPeople = useCallback(async () => {
    try {
      const data = await peopleAPI.getPeople();
      const peopleWithSelection = data.map(person => ({
        ...person,
        selected: false
      }));
      setPeople(peopleWithSelection);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await reportAPI.getReportTemplates();
      const templatesWithSelection = data.map(template => ({
        ...template,
        selected: false
      }));
      setTemplates(templatesWithSelection);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchPeople(), fetchTemplates()]).finally(() => {
      setLoading(false);
    });
    
    // Check if there are pre-selected people or templates from URL params
    if (typeof window !== 'undefined' && searchParams) {
      const personId = searchParams.get('person');
      const templateId = searchParams.get('template');
      
      if (personId) {
        setPeople(prev => prev.map(p => 
          p.id === personId ? { ...p, selected: true } : p
        ));
      }
      
      if (templateId) {
        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, selected: true } : t
        ));
      }
    }
  }, [searchParams, fetchPeople, fetchTemplates]);

  const togglePersonSelection = (personId: string) => {
    setPeople(prev => prev.map(person => 
      person.id === personId 
        ? { ...person, selected: !person.selected } 
        : person
    ));
  };

  const toggleTemplateSelection = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, selected: !template.selected } 
        : template
    ));
  };

  const toggleAllPeople = () => {
    const allSelected = people.every(p => p.selected);
    setPeople(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const toggleAllTemplates = () => {
    const allSelected = templates.every(t => t.selected);
    setTemplates(prev => prev.map(t => ({ ...t, selected: !allSelected })));
  };

  const handleGenerateReports = async () => {
    const selectedPeople = people.filter(p => p.selected);
    const selectedTemplates = templates.filter(t => t.selected);
    
    if (selectedPeople.length === 0 || selectedTemplates.length === 0) {
      setGenerationStatus('error');
      setGenerationMessage('Please select at least one person and one template');
      return;
    }

    setGenerating(true);
    setGenerationStatus('idle');
    setGenerationMessage('');

    try {
      const personIds = selectedPeople.map(p => p.id);
      const templateIds = selectedTemplates.map(t => t.id);
      
      const result = await reportAPI.bulkGenerateReports({
        person_ids: personIds,
        template_ids: templateIds
      });
      
      if (result.errors && result.errors.length > 0) {
        setGenerationStatus('error');
        setGenerationMessage(`Generated ${result.reports.length} reports with ${result.errors.length} errors`);
      } else {
        setGenerationStatus('success');
        setGenerationMessage(`Successfully generated ${result.reports.length} reports`);
      }
      
      // Redirect to reports page after a delay
      setTimeout(() => {
        router.push('/reports');
      }, 2000);
    } catch (error) {
      console.error('Failed to generate reports:', error);
      setGenerationStatus('error');
      setGenerationMessage('Failed to generate reports');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddPerson = () => {
    router.push('/people/add');
  };

  const handleBrowseTemplates = () => {
    router.push('/templates');
  };

  const selectedPeopleCount = people.filter(p => p.selected).length;
  const selectedTemplatesCount = templates.filter(t => t.selected).length;
  const totalReportsToGenerate = selectedPeopleCount * selectedTemplatesCount;

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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Generate Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Select people and report templates to generate numerology reports
              </p>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* People Selection */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select People</h2>
                <GlassButton 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleAllPeople}
                >
                  {people.length > 0 && people.every(p => p.selected) ? 'Deselect All' : 'Select All'}
                </GlassButton>
              </div>

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
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add people to generate reports for them
                  </p>
                  <GlassButton 
                    variant="primary" 
                    onClick={handleAddPerson}
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Add Person
                  </GlassButton>
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
                      <GlassCard 
                        variant={person.selected ? "elevated" : "default"}
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          person.selected 
                            ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                            : ''
                        }`}
                        onClick={() => togglePersonSelection(person.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            person.selected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {person.selected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
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
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Templates Selection */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Templates</h2>
                <GlassButton 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleAllTemplates}
                >
                  {templates.length > 0 && templates.every(t => t.selected) ? 'Deselect All' : 'Select All'}
                </GlassButton>
              </div>

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
                      <GlassCard 
                        variant={template.selected ? "elevated" : "default"}
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          template.selected 
                            ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                            : ''
                        }`}
                        onClick={() => toggleTemplateSelection(template.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            template.selected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {template.selected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {template.name}
                              </h3>
                              {template.is_premium && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              {template.description}
                            </p>
                            <div className="mt-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {template.report_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-center">
                <GlassButton 
                  variant="ghost" 
                  onClick={handleBrowseTemplates}
                >
                  Browse All Templates
                </GlassButton>
              </div>
            </div>
          </div>

          {/* Summary and Action Buttons */}
          <div className="mt-12">
            {/* Selection Summary */}
            <GlassCard variant="default" className="p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Selection Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Selected People</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedPeopleCount} of {people.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Selected Templates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTemplatesCount} of {templates.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Reports to Generate</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalReportsToGenerate}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton 
                variant="secondary" 
                onClick={() => router.push('/reports')}
                disabled={generating}
              >
                Cancel
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={handleGenerateReports}
                disabled={generating || selectedPeopleCount === 0 || selectedTemplatesCount === 0}
                icon={generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              >
                {generating ? 'Generating...' : `Generate ${totalReportsToGenerate} Reports`}
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function GenerateReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateReportContent />
    </Suspense>
  );
}