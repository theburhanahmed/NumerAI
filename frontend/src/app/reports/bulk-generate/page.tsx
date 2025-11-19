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
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
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
    if (selectedPeople.length === people.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(people.map(p => p.id));
    }
  };

  const handleSelectAllTemplates = () => {
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
              Bulk Generate Reports
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* People Selection */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Select People ({selectedPeople.length})
                </h2>
                <GlassButton 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSelectAllPeople}
                >
                  {selectedPeople.length === people.length ? 'Deselect All' : 'Select All'}
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
                      <GlassCard 
                        variant={selectedPeople.includes(person.id) ? "elevated" : "default"}
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          selectedPeople.includes(person.id) 
                            ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                            : ''
                        }`}
                        onClick={() => handleSelectPerson(person.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPeople.includes(person.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedPeople.includes(person.id) && (
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileStack className="w-6 h-6" />
                  Select Templates ({selectedTemplates.length})
                </h2>
                <GlassButton 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSelectAllTemplates}
                >
                  {selectedTemplates.length === templates.length ? 'Deselect All' : 'Select All'}
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
                        variant={selectedTemplates.includes(template.id) ? "elevated" : "default"}
                        className={`p-6 cursor-pointer transition-all duration-200 ${
                          selectedTemplates.includes(template.id) 
                            ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                            : ''
                        }`}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedTemplates.includes(template.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedTemplates.includes(template.id) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
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
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary and Action Buttons */}
          <div className="mt-12">
            <GlassCard variant="default" className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Generate Multiple Reports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You have selected {selectedPeople.length} people and {selectedTemplates.length} templates.
                    This will generate {selectedPeople.length * selectedTemplates.length} reports.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
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
                    disabled={generating || selectedPeople.length === 0 || selectedTemplates.length === 0}
                    icon={generating ? undefined : <FileText className="w-5 h-5" />}
                  >
                    {generating ? 'Generating...' : `Generate ${selectedPeople.length * selectedTemplates.length} Reports`}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}