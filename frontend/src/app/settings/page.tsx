'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserIcon, BellIcon, ShieldIcon, CreditCardIcon, PaletteIcon, GlobeIcon, MailIcon, PhoneIcon, CalendarIcon, SaveIcon, MoonIcon, SunIcon, SparklesIcon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { AppNavbar } from '@/components/navigation/app-navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/settings')}`);
    }
  }, [user, authLoading, router]);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        const profileData = response.data?.user || response.data;
        
        if (profileData) {
          // Format date_of_birth for date input (YYYY-MM-DD)
          const formattedDate = profileData.date_of_birth 
            ? new Date(profileData.date_of_birth).toISOString().split('T')[0]
            : '';
          
          setProfileData({
            name: profileData.full_name || user.full_name || '',
            email: profileData.email || user.email || '',
            phone: profileData.phone || '',
            birthDate: formattedDate
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Set from user object as fallback
        setProfileData({
          name: user?.full_name || '',
          email: user?.email || '',
          phone: '',
          birthDate: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReadings: true,
    weeklyInsights: true,
    monthlyReports: false,
    consultationReminders: true,
    emailNotifications: true,
    pushNotifications: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    shareReadings: false,
    dataCollection: true,
    marketingEmails: false
  });
  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };
  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };
  const handleSavePrivacy = () => {
    toast.success('Privacy settings updated!');
  };
  const tabs = [{
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon className="w-4 h-4" />
  }, {
    id: 'notifications',
    label: 'Notifications',
    icon: <BellIcon className="w-4 h-4" />
  }, {
    id: 'privacy',
    label: 'Privacy',
    icon: <ShieldIcon className="w-4 h-4" />
  }, {
    id: 'subscription',
    label: 'Subscription',
    icon: <CreditCardIcon className="w-4 h-4" />
  }, {
    id: 'appearance',
    label: 'Appearance',
    icon: <PaletteIcon className="w-4 h-4" />
  }];
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <AppNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg" animate={{
            rotate: [0, 5, -5, 0]
          }} transition={{
            duration: 3,
            repeat: Infinity
          }}>
              <SparklesIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account preferences and settings
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <GlassCard variant="liquid-premium" className="p-4">
              <div className="liquid-glass-content space-y-2">
                {tabs.map((tab, index) => <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.05
              }} whileHover={{
                scale: 1.02,
                x: 4
              }} whileTap={{
                scale: 0.98
              }}>
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>)}
              </div>
            </GlassCard>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <GlassCard variant="liquid-premium" className="p-6 md:p-8">
              <div className="liquid-glass-content">
                {/* Profile Settings */}
                {activeTab === 'profile' && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                      Profile Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <input type="text" value={profileData.name} onChange={e => setProfileData({
                        ...profileData,
                        name: e.target.value
                      })} className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <input type="email" value={profileData.email} onChange={e => setProfileData({
                        ...profileData,
                        email: e.target.value
                      })} className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <input type="tel" value={profileData.phone} onChange={e => setProfileData({
                        ...profileData,
                        phone: e.target.value
                      })} className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Birth Date
                        </label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <input type="date" value={profileData.birthDate} onChange={e => setProfileData({
                        ...profileData,
                        birthDate: e.target.value
                      })} className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Changing your birth date will recalculate your
                          numerology profile
                        </p>
                      </div>
                      <GlassButton variant="liquid" icon={<SaveIcon className="w-4 h-4" />} onClick={handleSaveProfile} className="glass-glow">
                        Save Changes
                      </GlassButton>
                    </div>
                  </motion.div>}

                {/* Notification Settings */}
                {activeTab === 'notifications' && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <SettingToggle label="Daily Readings" description="Receive your daily numerology reading each morning" checked={notificationSettings.dailyReadings} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    dailyReadings: checked
                  })} />
                      <SettingToggle label="Weekly Insights" description="Get weekly summaries and insights" checked={notificationSettings.weeklyInsights} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    weeklyInsights: checked
                  })} />
                      <SettingToggle label="Monthly Reports" description="Comprehensive monthly numerology reports" checked={notificationSettings.monthlyReports} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    monthlyReports: checked
                  })} />
                      <SettingToggle label="Consultation Reminders" description="Reminders for upcoming consultations" checked={notificationSettings.consultationReminders} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    consultationReminders: checked
                  })} />
                      <SettingToggle label="Email Notifications" description="Receive notifications via email" checked={notificationSettings.emailNotifications} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: checked
                  })} />
                      <SettingToggle label="Push Notifications" description="Receive push notifications on your device" checked={notificationSettings.pushNotifications} onChange={checked => setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: checked
                  })} />
                    </div>
                    <div className="mt-6">
                      <GlassButton variant="liquid" icon={<SaveIcon className="w-4 h-4" />} onClick={handleSaveNotifications} className="glass-glow">
                        Save Preferences
                      </GlassButton>
                    </div>
                  </motion.div>}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                      Privacy & Security
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Profile Visibility
                        </label>
                        <select value={privacySettings.profileVisibility} onChange={e => setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: e.target.value
                    })} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white">
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      <SettingToggle label="Share Readings" description="Allow sharing your readings with consultants" checked={privacySettings.shareReadings} onChange={checked => setPrivacySettings({
                    ...privacySettings,
                    shareReadings: checked
                  })} />
                      <SettingToggle label="Data Collection" description="Help improve our service by sharing usage data" checked={privacySettings.dataCollection} onChange={checked => setPrivacySettings({
                    ...privacySettings,
                    dataCollection: checked
                  })} />
                      <SettingToggle label="Marketing Emails" description="Receive promotional emails and special offers" checked={privacySettings.marketingEmails} onChange={checked => setPrivacySettings({
                    ...privacySettings,
                    marketingEmails: checked
                  })} />
                    </div>
                    <div className="mt-6">
                      <GlassButton variant="liquid" icon={<SaveIcon className="w-4 h-4" />} onClick={handleSavePrivacy} className="glass-glow">
                        Save Settings
                      </GlassButton>
                    </div>
                  </motion.div>}

                {/* Subscription */}
                {activeTab === 'subscription' && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                      Subscription & Billing
                    </h2>
                    <MagneticCard variant="liquid" className="p-6 mb-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                      <div className="liquid-glass-content">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Free Plan
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Basic numerology features
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              $0
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              per month
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p>✓ Basic numerology readings</p>
                          <p>✓ Daily insights</p>
                          <p>✓ Limited AI chat</p>
                        </div>
                      </div>
                    </MagneticCard>

                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Upgrade Plans
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MagneticCard variant="liquid" className="p-6">
                        <div className="liquid-glass-content">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Pro
                          </h4>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            $19<span className="text-sm">/mo</span>
                          </p>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                            <li>✓ Unlimited AI consultations</li>
                            <li>✓ Advanced compatibility analysis</li>
                            <li>✓ Personalized remedies</li>
                            <li>✓ Priority support</li>
                          </ul>
                          <GlassButton variant="liquid" className="w-full glass-glow">
                            Upgrade to Pro
                          </GlassButton>
                        </div>
                      </MagneticCard>

                      <MagneticCard variant="liquid-premium" className="p-6 border-2 border-purple-500">
                        <div className="liquid-glass-content">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              Premium
                            </h4>
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                              Popular
                            </span>
                          </div>
                          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            $49<span className="text-sm">/mo</span>
                          </p>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                            <li>✓ Everything in Pro</li>
                            <li>✓ Live consultant sessions</li>
                            <li>✓ Custom birth chart analysis</li>
                            <li>✓ Exclusive content</li>
                          </ul>
                          <GlassButton variant="liquid" className="w-full glass-glow">
                            Upgrade to Premium
                          </GlassButton>
                        </div>
                      </MagneticCard>
                    </div>
                  </motion.div>}

                {/* Appearance */}
                {activeTab === 'appearance' && <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                      Appearance Settings
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          Theme
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <MagneticCard variant={theme === 'light' ? 'liquid-premium' : 'liquid'} className={`p-6 cursor-pointer ${theme === 'light' ? 'border-2 border-purple-500' : ''}`} onClick={() => theme === 'dark' && toggleTheme()}>
                            <div className="liquid-glass-content text-center">
                              <SunIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Light
                              </p>
                            </div>
                          </MagneticCard>

                          <MagneticCard variant={theme === 'dark' ? 'liquid-premium' : 'liquid'} className={`p-6 cursor-pointer ${theme === 'dark' ? 'border-2 border-purple-500' : ''}`} onClick={() => theme === 'light' && toggleTheme()}>
                            <div className="liquid-glass-content text-center">
                              <MoonIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Dark
                              </p>
                            </div>
                          </MagneticCard>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <div className="relative">
                          <GlobeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <select className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Hindi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>;
}
function SettingToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-2xl backdrop-blur-xl">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <motion.button onClick={() => onChange(!checked)} className={`relative w-14 h-7 rounded-full transition-colors ${checked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`} whileTap={{
      scale: 0.95
    }}>
        <motion.div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md" animate={{
        x: checked ? 28 : 0
      }} transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30
      }} />
      </motion.button>
    </div>;
}