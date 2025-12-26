'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { expertAPI } from '@/lib/expert-api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function ApplyAsExpertPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    specialty: 'general',
    experience_years: 0,
    bio: '',
    application_notes: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit application
      const application = await expertAPI.applyAsExpert(formData);

      // Upload documents
      for (const doc of documents) {
        await expertAPI.uploadVerificationDocument(
          doc,
          'other',
          doc.name,
          'Verification document'
        );
      }

      toast.success('Application submitted successfully!');
      router.push('/experts/verification-status');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-8">
      <div className="max-w-3xl mx-auto">
        <GlassCard className="p-8">
          <h1 className="text-3xl font-bold mb-6">Apply as Expert</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Specialty</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="general">General Numerology</option>
                <option value="relationship">Relationship & Compatibility</option>
                <option value="career">Career & Business</option>
                <option value="spiritual">Spiritual Growth</option>
                <option value="health">Health & Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Tell us about your background and expertise..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Why do you want to be an expert?</label>
              <textarea
                value={formData.application_notes}
                onChange={(e) => setFormData({ ...formData, application_notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Share your motivation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Documents</label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
              {documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4" />
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <GlassButton type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Application'}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

