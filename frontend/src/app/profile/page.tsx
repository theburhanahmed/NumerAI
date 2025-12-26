'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Globe, 
  Edit,
  Save,
  X
} from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { useAuth } from '@/contexts/auth-context';
import { userAPI, accountAPI } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Download, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/profile')}`);
    }
  }, [user, authLoading, router]);
  const [initialFormData, setInitialFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    timezone: '',
    location: '',
    bio: ''
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    timezone: '',
    location: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || authLoading) return;
      
      setProfileLoading(true);
      try {
        const response = await userAPI.getProfile();
        // Handle DRF response structure - could be response.data directly or nested
        const profileData = response.data.user || response.data;
        
        // Format date_of_birth for date input (YYYY-MM-DD)
        const formattedDate = profileData.date_of_birth 
          ? new Date(profileData.date_of_birth).toISOString().split('T')[0]
          : '';
        
        const profileFormData = {
          full_name: profileData.full_name || user.full_name || '',
          date_of_birth: formattedDate,
          gender: profileData.gender || '',
          timezone: profileData.timezone || 'Asia/Kolkata',
          location: profileData.location || '',
          bio: profileData.bio || ''
        };
        
        setFormData(profileFormData);
        setInitialFormData(profileFormData);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        // Fallback to user data from auth context
        setFormData({
          full_name: user.full_name || '',
          date_of_birth: '',
          gender: '',
          timezone: 'Asia/Kolkata',
          location: '',
          bio: ''
        });
        toast({
          title: 'Warning',
          description: 'Could not load full profile data. Some fields may be empty.',
          variant: 'destructive',
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, toast]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    
    try {
      // Prepare payload - only send non-empty values or values that have changed
      const payload: Record<string, any> = {};
      
      if (formData.full_name.trim()) {
        payload.full_name = formData.full_name.trim();
      }
      if (formData.date_of_birth) {
        payload.date_of_birth = formData.date_of_birth;
      }
      if (formData.gender) {
        payload.gender = formData.gender;
      }
      if (formData.timezone) {
        payload.timezone = formData.timezone;
      }
      if (formData.location !== undefined) {
        payload.location = formData.location.trim() || null;
      }
      if (formData.bio !== undefined) {
        payload.bio = formData.bio.trim() || null;
      }
      
      const response = await userAPI.updateProfile(payload);
      
      // Refresh user data
      await refreshUser();
      
      // Update initial form data to reflect saved state
      setInitialFormData({ ...formData });
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
      
      // Handle field-level errors
      if (err.response?.data?.field_errors) {
        setFieldErrors(err.response.data.field_errors);
        const errorMessages = Object.values(err.response.data.field_errors).flat();
        setError(errorMessages.join(', ') || 'Validation failed. Please check the fields.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to initial values
    setFormData({ ...initialFormData });
    setFieldErrors({});
    setError(null);
    setIsEditing(false);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await accountAPI.exportData();
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `numerai_data_export_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Your data has been exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await accountAPI.deleteAccount();
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully.',
      });
      // Logout and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <CosmicPageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-[#1a2942]/40 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-[#1a2942]/40 rounded-2xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-[#1a2942]/40 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </CosmicPageLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CosmicPageLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-white/70 mt-2">
                Manage your account information and preferences
              </p>
              <p className="text-white/70 mt-4 max-w-3xl">
                Update your personal information to ensure accurate numerology calculations 
                and personalized insights. Your profile information helps us provide more 
                relevant and meaningful numerology guidance.
              </p>
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <TouchOptimizedButton 
                    variant="secondary" 
                    onClick={handleCancel}
                    icon={<X className="w-5 h-5" />}
                  >
                    Cancel
                  </TouchOptimizedButton>
                  <TouchOptimizedButton 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={saving}
                    loading={saving}
                    icon={<Save className="w-5 h-5" />}
                  >
                    Save
                  </TouchOptimizedButton>
                </>
              ) : (
                <TouchOptimizedButton 
                  variant="primary" 
                  onClick={() => setIsEditing(true)}
                  icon={<Edit className="w-5 h-5" />}
                >
                  Edit Profile
                </TouchOptimizedButton>
              )}
            </div>
          </div>

          {(error || Object.keys(fieldErrors).length > 0) && (
            <div className="mb-6 p-4 rounded-2xl bg-red-900/30 border border-red-500/30">
              {error && (
                <p className="text-red-200 mb-2">{error}</p>
              )}
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="list-disc list-inside text-red-200 space-y-1">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {Array.isArray(message) ? message.join(', ') : message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <SpaceCard variant="premium" className="p-6 text-center" glow>
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user.full_name}
                </h2>
                <p className="text-white/70 text-sm mb-4">
                  {user.email || user.phone}
                </p>
                <p className="text-white/70 text-sm mb-6">
                  Your account information and subscription details
                </p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-cyan-400/70" />
                    <span className="text-white/70">
                      {user.email || 'Not provided'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-cyan-400/70" />
                    <span className="text-white/70">
                      {user.phone || 'Not provided'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user.subscription_plan ? user.subscription_plan.charAt(0).toUpperCase() : 'F'}
                      </span>
                    </div>
                    <span className="text-white/70 capitalize">
                      {user.subscription_plan || 'Free'} Plan
                    </span>
                  </div>
                </div>
              </SpaceCard>
            </div>
            
            {/* Profile Details */}
            <div className="lg:col-span-2">
              <SpaceCard variant="premium" className="p-6" glow>
                <h2 className="text-xl font-semibold text-white mb-6">
                  {isEditing ? 'Edit Profile' : 'Profile Information'}
                </h2>
                <p className="text-white/70 mb-6">
                  {isEditing 
                    ? 'Update your personal information to ensure accurate numerology calculations.' 
                    : 'Your personal information used for numerology calculations and personalized insights.'}
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Full Name
                    </label>
                    <p className="text-white/70 text-xs mb-2">
                      Your full name as it appears on official documents
                    </p>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          className={`w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all ${
                            fieldErrors.full_name || fieldErrors['user.full_name']
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-cyan-500/20 focus:ring-cyan-500 focus:border-transparent'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {(fieldErrors.full_name || fieldErrors['user.full_name']) && (
                          <p className="text-red-300 text-sm mt-1">
                            {(() => {
                              const nameError: string | string[] = fieldErrors.full_name || fieldErrors['user.full_name'];
                              return Array.isArray(nameError) ? nameError.join(', ') : nameError;
                            })()}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-white">
                        {formData.full_name || user.full_name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Date of Birth
                      </label>
                      <p className="text-white/70 text-xs mb-2">
                        Required for accurate numerology calculations
                      </p>
                      {isEditing ? (
                        <>
                          <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                            className={`w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all ${
                              fieldErrors.date_of_birth
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-cyan-500/20 focus:ring-cyan-500 focus:border-transparent'
                            }`}
                          />
                          {fieldErrors.date_of_birth && (
                            <p className="text-red-300 text-sm mt-1">
                              {Array.isArray(fieldErrors.date_of_birth)
                                ? fieldErrors.date_of_birth.join(', ')
                                : fieldErrors.date_of_birth}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-white">
                          {formData.date_of_birth 
                            ? new Date(formData.date_of_birth).toLocaleDateString()
                            : 'Not provided'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Gender
                      </label>
                      <p className="text-white/70 text-xs mb-2">
                        Used for personalized insights and recommendations
                      </p>
                      {isEditing ? (
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-white">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Timezone
                      </label>
                      <p className="text-white/70 text-xs mb-2">
                        Helps determine the most accurate daily readings for your location
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.timezone}
                          onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                          className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="e.g., America/New_York"
                        />
                      ) : (
                        <p className="text-white">
                          Not provided
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Location
                      </label>
                      <p className="text-white/70 text-xs mb-2">
                        Your general location for personalized cultural insights
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="text-white">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Bio
                    </label>
                    <p className="text-white/70 text-xs mb-2">
                      Share anything about yourself that might help provide more personalized insights
                    </p>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-white">
                        {formData.bio || 'No bio provided'}
                      </p>
                    )}
                  </div>
                </div>
              </SpaceCard>
              
              {/* Account Status */}
              <SpaceCard variant="premium" className="p-6 mt-6" glow>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Account Status
                </h2>
                <p className="text-white/70 mb-4">
                  View your account verification status and subscription details
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a2942]/40">
                    <div className={`w-3 h-3 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-white">Email Verification</p>
                      <p className="text-sm text-white/70">
                        {user.is_verified ? 'Verified' : 'Not verified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a2942]/40">
                    <div className={`w-3 h-3 rounded-full ${user.is_premium ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <div>
                      <p className="font-medium text-white">Premium Status</p>
                      <p className="text-sm text-white/70">
                        {user.is_premium ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Export & Account Deletion */}
                <div className="border-t border-cyan-500/20 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Account Management
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#1a2942]/40 border border-cyan-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">
                            Export Your Data
                          </h4>
                          <p className="text-sm text-white/70">
                            Download all your account data in JSON format (GDPR compliant)
                          </p>
                        </div>
                        <TouchOptimizedButton
                          variant="secondary"
                          size="sm"
                          onClick={handleExportData}
                          disabled={exporting}
                          loading={exporting}
                          icon={<Download className="w-4 h-4" />}
                        >
                          Export Data
                        </TouchOptimizedButton>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1a2942]/40 border border-red-500/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Delete Account
                          </h4>
                          <p className="text-sm text-white/70">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                        <TouchOptimizedButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={deleting}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Delete Account
                        </TouchOptimizedButton>
                      </div>
                    </div>
                  </div>
                </div>
              </SpaceCard>

              {/* Delete Confirmation Dialog */}
              {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <SpaceCard variant="premium" className="p-6 max-w-md w-full" glow>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Delete Account
                        </h3>
                        <p className="text-sm text-white/70">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-white/90 mb-6">
                      Are you sure you want to delete your account? This will permanently remove all your data, including:
                    </p>
                    
                    <ul className="list-disc list-inside text-sm text-white/70 mb-6 space-y-1">
                      <li>Your profile and personal information</li>
                      <li>All numerology readings and reports</li>
                      <li>Your subscription and payment history</li>
                      <li>All saved data and preferences</li>
                    </ul>
                    
                    <div className="flex gap-3">
                      <TouchOptimizedButton
                        variant="secondary"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={deleting}
                        className="flex-1"
                      >
                        Cancel
                      </TouchOptimizedButton>
                      <TouchOptimizedButton
                        variant="primary"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        loading={deleting}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Yes, Delete Account
                      </TouchOptimizedButton>
                    </div>
                  </SpaceCard>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}