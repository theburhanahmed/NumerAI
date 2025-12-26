'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  LogOutIcon,
  SaveIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicTooltip } from '@/components/cosmic/cosmic-tooltip';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function Settings() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
  });

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/settings')}`);
    }
  }, [user, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        const data = response.data?.user || response.data;

        if (data) {
          const formattedDate = data.date_of_birth
            ? new Date(data.date_of_birth).toISOString().split('T')[0]
            : '';

          setProfileData({
            name: data.full_name || user.full_name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            birthDate: formattedDate,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfileData({
          name: user?.full_name || '',
          email: user?.email || '',
          phone: '',
          birthDate: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <BellIcon className="w-5 h-5" />,
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <ShieldIcon className="w-5 h-5" />,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement actual save API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const [notificationSettings, setNotificationSettings] = useState({
    dailyReadings: true,
    weeklyForecasts: true,
    specialEvents: true,
    productUpdates: true,
  });

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  return (
    <CosmicPageLayout>
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-white/70">Manage your account and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.1,
          }}
        >
          <SpaceCard variant="default" className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30'
                      : 'text-white/70 hover:bg-cyan-500/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOutIcon className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </SpaceCard>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="lg:col-span-3"
        >
          <SpaceCard variant="premium" className="p-6 md:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
                    Profile Information
                  </h2>
                </div>

                {/* Profile Form */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      Birth Date
                      <CosmicTooltip
                        content="Used for accurate numerology calculations"
                        icon
                      />
                    </label>
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <TouchOptimizedButton
                      variant="primary"
                      icon={<SaveIcon className="w-5 h-5" />}
                      onClick={handleSaveProfile}
                      ariaLabel="Save changes"
                    >
                      Save Changes
                    </TouchOptimizedButton>
                    <TouchOptimizedButton
                      variant="secondary"
                      onClick={() => router.back()}
                      ariaLabel="Cancel"
                    >
                      Cancel
                    </TouchOptimizedButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      label: 'Daily Readings',
                      description: 'Receive your daily numerology insights',
                      key: 'dailyReadings' as const,
                    },
                    {
                      label: 'Weekly Forecasts',
                      description: 'Get weekly cosmic predictions',
                      key: 'weeklyForecasts' as const,
                    },
                    {
                      label: 'Special Events',
                      description: 'Notifications about cosmic events',
                      key: 'specialEvents' as const,
                    },
                    {
                      label: 'Product Updates',
                      description: 'News about new features',
                      key: 'productUpdates' as const,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-[#0a1628]/40 rounded-xl border border-cyan-500/10"
                    >
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-white/60">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings[item.key]}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <TouchOptimizedButton
                    variant="primary"
                    icon={<SaveIcon className="w-5 h-5" />}
                    onClick={handleSaveNotifications}
                    ariaLabel="Save notification preferences"
                  >
                    Save Preferences
                  </TouchOptimizedButton>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
                  Privacy & Security
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-[#0a1628]/40 rounded-xl border border-cyan-500/10">
                    <h3 className="font-semibold text-white mb-2">
                      Change Password
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Update your password to keep your account secure
                    </p>
                    <TouchOptimizedButton variant="secondary" size="sm">
                      Update Password
                    </TouchOptimizedButton>
                  </div>

                  <div className="p-4 bg-[#0a1628]/40 rounded-xl border border-cyan-500/10">
                    <h3 className="font-semibold text-white mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <TouchOptimizedButton variant="secondary" size="sm">
                      Enable 2FA
                    </TouchOptimizedButton>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <h3 className="font-semibold text-red-400 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <TouchOptimizedButton variant="secondary" size="sm">
                      Delete Account
                    </TouchOptimizedButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
                  Billing & Subscription
                </h2>

                <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Premium Plan
                      </h3>
                      <p className="text-white/70">$9.99/month</p>
                    </div>
                    <div className="px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                      <span className="text-sm font-semibold text-cyan-400">
                        Active
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mb-4">
                    Next billing date: January 15, 2024
                  </p>
                  <div className="flex gap-3">
                    <TouchOptimizedButton variant="secondary" size="sm">
                      Manage Subscription
                    </TouchOptimizedButton>
                    <TouchOptimizedButton variant="ghost" size="sm">
                      View Invoices
                    </TouchOptimizedButton>
                  </div>
                </div>
              </div>
            )}
          </SpaceCard>
        </motion.div>
      </div>
    </CosmicPageLayout>
  );
}
