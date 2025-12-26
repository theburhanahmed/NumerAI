'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar,
  Users,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI } from '@/lib/numerology-api';

export default function AddPersonPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    relationship: 'other',
    notes: ''
  });

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
      await peopleAPI.createPerson(formData);
      
      // Redirect to people page
      router.push('/people');
    } catch (err) {
      console.error('Failed to add person:', err);
      setError('Failed to add person');
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
              Add Person
            </h1>
            <p className="text-white/70 mt-2">
              Add someone to generate numerology reports for them
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
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add Person
                </TouchOptimizedButton>
              </div>
            </form>
          </SpaceCard>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}