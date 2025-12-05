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
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
      <AmbientParticles />
      <FloatingOrbs />
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-white/50 dark:bg-gray-800/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <GlassButton 
              variant="ghost" 
              onClick={() => router.push('/people')}
              icon={<ChevronLeft className="w-5 h-5" />}
            >
              Back
            </GlassButton>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Person
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update the details for this person
            </p>
          </div>

          <GlassCard variant="default" className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Enter the person&apos;s full name as it appears on official documents
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Birth Date Field */}
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Date
                </label>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Enter the person&apos;s date of birth (required for numerology calculations)
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Relationship Field */}
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship
                </label>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Select your relationship to this person for personalized compatibility analysis
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Add any additional information that might be helpful for future reference
                </p>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full px-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add any additional notes about this person..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <GlassButton 
                  variant="secondary" 
                  onClick={() => router.push('/people')}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </GlassButton>
                <GlassButton 
                  variant="primary" 
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                  icon={saving ? undefined : <Save className="w-5 h-5" />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}