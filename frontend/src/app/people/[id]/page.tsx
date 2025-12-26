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
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
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
      <CosmicPageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-[#1a2942]/40 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-[#1a2942]/40 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-[#1a2942]/40 rounded-2xl"></div>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!person) {
    return (
      <CosmicPageLayout>
        <div className="max-w-4xl mx-auto">
          <SpaceCard variant="premium" className="p-12 text-center" glow>
            <User className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Person Not Found
            </h3>
            <p className="text-white/70 mb-6">
              The requested person could not be found.
            </p>
            <TouchOptimizedButton 
              variant="primary" 
              onClick={() => router.push('/people')}
            >
              Back to People
            </TouchOptimizedButton>
          </SpaceCard>
        </div>
      </CosmicPageLayout>
    );
  }

  return (
    <CosmicPageLayout>
      <div className="max-w-4xl mx-auto">
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
                onClick={() => router.push('/people')}
                className="mb-4"
                icon={<ChevronLeft className="w-5 h-5" />}
              >
                Back to People
              </TouchOptimizedButton>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {person.name}
              </h1>
              <p className="text-white/70 mt-2">
                View and manage numerology information for this person
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(person.birth_date).toLocaleDateString()}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {person.relationship}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <TouchOptimizedButton 
                variant="secondary" 
                onClick={handleEditPerson}
                icon={<Edit className="w-5 h-5" />}
              >
                Edit
              </TouchOptimizedButton>
              <TouchOptimizedButton 
                variant="primary" 
                onClick={handleGenerateReport}
                icon={<FileText className="w-5 h-5" />}
                disabled={!profile}
              >
                Generate Report
              </TouchOptimizedButton>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-900/30 border border-red-500/30">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Person Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Person Info Card */}
            <div className="lg:col-span-1">
              <SpaceCard variant="premium" className="p-6" glow>
                <h2 className="text-xl font-bold text-white mb-4">
                  Person Details
                </h2>
                <p className="text-white/70 text-sm mb-4">
                  Basic information about this person in your numerology system
                </p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60">Name</p>
                    <p className="text-white font-medium">{person.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60">Birth Date</p>
                    <p className="text-white font-medium">
                      {new Date(person.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60">Relationship</p>
                    <p className="text-white font-medium capitalize">
                      {person.relationship}
                    </p>
                  </div>
                  
                  {person.notes && (
                    <div>
                      <p className="text-sm text-white/60">Notes</p>
                      <p className="text-white font-medium">{person.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-white/60">Added On</p>
                    <p className="text-white font-medium">
                      {new Date(person.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </SpaceCard>
            </div>

            {/* Numerology Profile */}
            <div className="lg:col-span-2">
              <SpaceCard variant="premium" className="p-6" glow>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Numerology Profile
                    </h2>
                    <p className="text-white/70 text-sm">
                      {profile 
                        ? "View this person&#39;s numerology numbers and interpretations" 
                        : "Calculate numerology profile to view detailed insights"}
                    </p>
                  </div>
                  
                  {!profile && (
                    <TouchOptimizedButton 
                      variant="primary" 
                      onClick={handleCalculateNumerology}
                      disabled={calculating}
                      loading={calculating}
                      icon={<Calculator className="w-5 h-5" />}
                    >
                      Calculate Profile
                    </TouchOptimizedButton>
                  )}
                </div>
                
                {profile ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Life Path</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.life_path_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Destiny</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.destiny_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Soul Urge</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.soul_urge_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Personality</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.personality_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Personal Year</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.personal_year_number}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-[#1a2942]/40 rounded-2xl">
                      <p className="text-sm text-white/70">Attitude</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {profile.attitude_number}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      No Numerology Profile Yet
                    </h3>
                    <p className="text-white/70 mb-6">
                      Calculate this person&#39;s numerology profile to unlock detailed insights and generate reports.
                    </p>
                    <TouchOptimizedButton 
                      variant="primary" 
                      onClick={handleCalculateNumerology}
                      disabled={calculating}
                      loading={calculating}
                      icon={<Calculator className="w-5 h-5" />}
                    >
                      Calculate Profile
                    </TouchOptimizedButton>
                  </div>
                )}
              </SpaceCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <TouchOptimizedButton 
              variant="secondary" 
              onClick={() => router.push('/people')}
            >
              Back to People
            </TouchOptimizedButton>
            <TouchOptimizedButton 
              variant="primary" 
              onClick={handleGenerateReport}
              icon={<FileText className="w-5 h-5" />}
            >
              Generate Report for {person.name}
            </TouchOptimizedButton>
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}