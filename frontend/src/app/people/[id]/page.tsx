'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar,
  Users,
  ChevronLeft,
  Edit,
  FileText,
  Calculator
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI } from '@/lib/numerology-api';
import { Person, PersonNumerologyProfile } from '@/types';

export default function PersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [profile, setProfile] = useState<PersonNumerologyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  const fetchNumerologyProfile = useCallback(async () => {
    try {
      const data = await peopleAPI.getPersonNumerologyProfile(params.id as string);
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to fetch numerology profile:', err);
      // It's okay if profile doesn't exist yet
    }
  }, [params.id]);

  const fetchPerson = useCallback(async () => {
    try {
      const data = await peopleAPI.getPerson(params.id as string);
      setPerson(data);
      
      // Fetch numerology profile
      fetchNumerologyProfile();
    } catch (err) {
      console.error('Failed to fetch person:', err);
      setError('Failed to load person data');
    } finally {
      setLoading(false);
    }
  }, [params.id, fetchNumerologyProfile]);

  useEffect(() => {
    fetchPerson();
  }, [fetchPerson]);

  const handleCalculateNumerology = async () => {
    if (!person) return;
    
    setCalculating(true);
    setError('');

    try {
      const data = await peopleAPI.calculatePersonNumerology(params.id as string);
      setProfile(data.profile);
    } catch (err: any) {
      console.error('Failed to calculate numerology:', err);
      setError(err.response?.data?.error || 'Failed to calculate numerology');
    } finally {
      setCalculating(false);
    }
  };

  const handleGenerateReport = () => {
    if (!person) return;
    
    // Check if profile exists before generating report
    if (!profile) {
      setError('Please calculate the numerology profile first before generating a report.');
      return;
    }
    
    router.push(`/reports/generate?person=${person.id}`);
  };

  const handleEditPerson = () => {
    if (!person) return;
    router.push(`/people/${person.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
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
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard variant="default" className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Person Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested person could not be found.
            </p>
            <GlassButton 
              variant="primary" 
              onClick={() => router.push('/people')}
            >
              Back to People
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
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
                onClick={() => router.push('/people')}
                className="mb-4"
                icon={<ChevronLeft className="w-5 h-5" />}
              >
                Back to People
              </GlassButton>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {person.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage numerology information for this person
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(person.birth_date).toLocaleDateString()}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {person.relationship}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <GlassButton 
                variant="secondary" 
                onClick={handleEditPerson}
                icon={<Edit className="w-5 h-5" />}
              >
                Edit
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={handleGenerateReport}
                icon={<FileText className="w-5 h-5" />}
                disabled={!profile}
              >
                Generate Report
              </GlassButton>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Person Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Person Info Card */}
            <div className="lg:col-span-1">
              <GlassCard variant="default" className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Person Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Basic information about this person in your numerology system
                </p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{person.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(person.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                      {person.relationship}
                    </p>
                  </div>
                  
                  {person.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-gray-900 dark:text-white font-medium">{person.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Added On</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(person.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Numerology Profile */}
            <div className="lg:col-span-2">
              <GlassCard variant="default" className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Numerology Profile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {profile 
                        ? "View this person&#39;s numerology numbers and interpretations" 
                        : "Calculate numerology profile to view detailed insights"}
                    </p>
                  </div>
                  
                  {!profile && (
                    <GlassButton 
                      variant="primary" 
                      onClick={handleCalculateNumerology}
                      disabled={calculating}
                      icon={<Calculator className="w-5 h-5" />}
                    >
                      {calculating ? 'Calculating...' : 'Calculate Profile'}
                    </GlassButton>
                  )}
                </div>
                
                {profile ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Life Path</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.life_path_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destiny</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.destiny_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Soul Urge</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.soul_urge_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Personality</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.personality_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Personal Year</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.personal_year_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Attitude</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.attitude_number}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Numerology Profile Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Calculate this person&#39;s numerology profile to unlock detailed insights and generate reports.
                    </p>
                    <GlassButton 
                      variant="primary" 
                      onClick={handleCalculateNumerology}
                      disabled={calculating}
                      icon={<Calculator className="w-5 h-5" />}
                    >
                      {calculating ? 'Calculating...' : 'Calculate Profile'}
                    </GlassButton>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <GlassButton 
              variant="secondary" 
              onClick={() => router.push('/people')}
            >
              Back to People
            </GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={handleGenerateReport}
              icon={<FileText className="w-5 h-5" />}
            >
              Generate Report for {person.name}
            </GlassButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}