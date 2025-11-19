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
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
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
              Add Person
            </h1>
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
                  icon={saving ? undefined : <Plus className="w-5 h-5" />}
                >
                  {saving ? 'Adding...' : 'Add Person'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}