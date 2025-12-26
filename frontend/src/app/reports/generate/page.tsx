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
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
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
      const peopleArray = Array.isArray(data) ? data : [];
      const peopleWithSelection = peopleArray.map(person => ({
        ...person,
        selected: false
      }));
      setPeople(peopleWithSelection);
    } catch (error) {
      console.error('Failed to fetch people:', error);
      setPeople([]);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await reportAPI.getReportTemplates();
      const templatesArray = Array.isArray(data) ? data : [];
      const templatesWithSelection = templatesArray.map(template => ({
        ...template,
        selected: false
      }));
      setTemplates(templatesWithSelection);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
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
        setPeople(prev => Array.isArray(prev) ? prev.map(p => 
          p.id === personId ? { ...p, selected: true } : p
        ) : []);
      }
      
      if (templateId) {
        setTemplates(prev => Array.isArray(prev) ? prev.map(t => 
          t.id === templateId ? { ...t, selected: true } : t
        ) : []);
      }
    }
  }, [searchParams, fetchPeople, fetchTemplates]);

  const togglePersonSelection = (personId: string) => {
    setPeople(prev => Array.isArray(prev) ? prev.map(person => 
      person.id === personId 
        ? { ...person, selected: !person.selected } 
        : person
    ) : []);
  };

  const toggleTemplateSelection = (templateId: string) => {
    setTemplates(prev => Array.isArray(prev) ? prev.map(template => 
      template.id === templateId 
        ? { ...template, selected: !template.selected } 
        : template
    ) : []);
  };

  const toggleAllPeople = () => {
    if (!Array.isArray(people)) {
      return;
    }
    const allSelected = people.every(p => p.selected);
    setPeople(prev => Array.isArray(prev) ? prev.map(p => ({ ...p, selected: !allSelected })) : []);
  };

  const toggleAllTemplates = () => {
    if (!Array.isArray(templates)) {
      return;
    }
    const allSelected = templates.every(t => t.selected);
    setTemplates(prev => Array.isArray(prev) ? prev.map(t => ({ ...t, selected: !allSelected })) : []);
  };

  const handleGenerateReports = async () => {
    const selectedPeople = Array.isArray(people) ? people.filter(p => p.selected) : [];
    const selectedTemplates = Array.isArray(templates) ? templates.filter(t => t.selected) : [];
    
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

  const selectedPeopleCount = Array.isArray(people) ? people.filter(p => p.selected).length : 0;
  const selectedTemplatesCount = Array.isArray(templates) ? templates.filter(t => t.selected).length : 0;
  const totalReportsToGenerate = selectedPeopleCount * selectedTemplatesCount;

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
                Generate Reports
              </h1>
              <p className="text-white/70 mt-2">
                Select people and report templates to generate numerology reports
              </p>
            </div>
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
                <h2 className="text-2xl font-bold text-white">Select People</h2>
                <TouchOptimizedButton 
                  variant="secondary" 
                  size="sm"
                  onClick={toggleAllPeople}
                >
                  {people.length > 0 && people.every(p => p.selected) ? 'Deselect All' : 'Select All'}
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
                  <p className="text-white/70 mb-6">
                    Add people to generate reports for them
                  </p>
                  <TouchOptimizedButton 
                    variant="primary" 
                    onClick={handleAddPerson}
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Add Person
                  </TouchOptimizedButton>
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
                          person.selected 
                            ? 'ring-2 ring-purple-500 bg-purple-500/20' 
                            : ''
                        }`}
                        glow={person.selected}
                        onClick={() => togglePersonSelection(person.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            person.selected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-cyan-500/30'
                          }`}>
                            {person.selected && (
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
                <h2 className="text-2xl font-bold text-white">Select Templates</h2>
                <TouchOptimizedButton 
                  variant="secondary" 
                  size="sm"
                  onClick={toggleAllTemplates}
                >
                  {Array.isArray(templates) && templates.length > 0 && templates.every(t => t.selected) ? 'Deselect All' : 'Select All'}
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
                          template.selected 
                            ? 'ring-2 ring-purple-500 bg-purple-500/20' 
                            : ''
                        }`}
                        glow={template.selected}
                        onClick={() => toggleTemplateSelection(template.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                            template.selected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-cyan-500/30'
                          }`}>
                            {template.selected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-white">
                                {template.name}
                              </h3>
                              {template.is_premium && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-white/70 mt-2">
                              {template.description}
                            </p>
                            <div className="mt-3">
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
              
              <div className="mt-4 text-center">
                <TouchOptimizedButton 
                  variant="secondary" 
                  onClick={handleBrowseTemplates}
                >
                  Browse All Templates
                </TouchOptimizedButton>
              </div>
            </div>
          </div>

          {/* Summary and Action Buttons */}
          <div className="mt-12">
            {/* Selection Summary */}
            <SpaceCard variant="premium" className="p-6 mb-8" glow>
              <h3 className="text-xl font-bold text-white mb-4">Selection Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-white/70 text-sm">Selected People</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedPeopleCount} of {Array.isArray(people) ? people.length : 0}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Selected Templates</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedTemplatesCount} of {Array.isArray(templates) ? templates.length : 0}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Reports to Generate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {totalReportsToGenerate}
                  </p>
                </div>
              </div>
            </SpaceCard>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                disabled={generating || selectedPeopleCount === 0 || selectedTemplatesCount === 0}
                loading={generating}
                icon={<FileText className="w-5 h-5" />}
              >
                Generate {totalReportsToGenerate} Reports
              </TouchOptimizedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}

export default function GenerateReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateReportContent />
    </Suspense>
  );
}