'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar,
  Users,
  ChevronLeft,
  Save
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI } from '@/lib/numerology-api';
import { Person } from '@/types';

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    relationship: 'other',
    notes: ''
  });

  const fetchPerson = useCallback(async () => {
    try {
      const data = await peopleAPI.getPerson(params.id as string);
      setPerson(data);
      setFormData({
        name: data.name,
        birth_date: data.birth_date,
        relationship: data.relationship,
        notes: data.notes || ''
      });
    } catch (err) {
      console.error('Failed to fetch person:', err);
      setError('Failed to load person data');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPerson();
  }, [fetchPerson]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      await peopleAPI.updatePerson(params.id as string, formData);
      
      // Redirect to people page
      router.push('/people');
    } catch (err) {
      console.error('Failed to update person:', err);
      setError('Failed to update person');
    } finally {
      setSaving(false);
    }
  };

  const relationshipOptions = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'partner', label: 'Business Partner' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <CosmicPageLayout>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-[#1a2942]/40 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-[#1a2942]/40 rounded-2xl"></div>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!person) {
    return (
      <CosmicPageLayout>
        <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <TouchOptimizedButton 
              variant="secondary" 
              onClick={() => router.push('/people')}
              className="mb-4"
              icon={<ChevronLeft className="w-5 h-5" />}
            >
              Back
            </TouchOptimizedButton>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Edit Person
            </h1>
            <p className="text-white/70 mt-2">
              Update the details for this person
            </p>
          </div>

          <SpaceCard variant="premium" className="p-6 sm:p-8" glow>
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-900/30 border border-red-500/30">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  Full Name
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Enter the person&apos;s full name as it appears on official documents
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-white/50"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Birth Date Field */}
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-white/90 mb-2">
                  Birth Date
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Enter the person&apos;s date of birth (required for numerology calculations)
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                    required
                  />
                </div>
              </div>

              {/* Relationship Field */}
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-white/90 mb-2">
                  Relationship
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Select your relationship to this person for personalized compatibility analysis
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-cyan-400/70" />
                  </div>
                  <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none text-white"
                  >
                    {relationshipOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-white/90 mb-2">
                  Notes (Optional)
                </label>
                <p className="text-white/70 text-sm mb-2">
                  Add any additional information that might be helpful for future reference
                </p>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full px-3 py-3 bg-[#1a2942]/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-white/50"
                  placeholder="Add any additional notes about this person..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <TouchOptimizedButton 
                  variant="secondary" 
                  onClick={() => router.push('/people')}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </TouchOptimizedButton>
                <TouchOptimizedButton 
                  variant="primary" 
                  type="submit"
                  disabled={saving}
                  loading={saving}
                  className="flex-1"
                  icon={<Save className="w-5 h-5" />}
                >
                  Save Changes
                </TouchOptimizedButton>
              </div>
            </form>
          </SpaceCard>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}