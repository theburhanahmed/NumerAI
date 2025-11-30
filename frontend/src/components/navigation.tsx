'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { 
  Home, 
  User, 
  Calendar, 
  Sparkles, 
  LogOut, 
  MessageCircle,
  Heart,
  TrendingUp,
  Users,
  FileText,
  MoonIcon,
  SunIcon,
  BookOpen,
  Bot,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { NotificationBadge } from '@/components/notifications/notification-badge';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { LanguageSelector } from '@/components/language-selector';
import { useState, useRef, useEffect } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  if (!user) return null;

  // Group navigation items by category
  const navGroups = [
    {
      title: "Core Features",
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/birth-chart', label: 'Birth Chart', icon: Sparkles },
        { href: '/daily-reading', label: 'Daily Reading', icon: Calendar },
        { href: '/life-path', label: 'Life Path', icon: User },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { href: '/ai-chat', label: 'AI Chat', icon: Bot },
        { href: '/decisions', label: 'Decisions', icon: TrendingUp },
      ]
    },
    {
      title: "Relationships",
      items: [
        { href: '/compatibility', label: 'Compatibility', icon: Heart },
        { href: '/people', label: 'People', icon: Users },
      ]
    },
    {
      title: "Resources",
      items: [
        { href: '/remedies', label: 'Remedies', icon: TrendingUp },
        { href: '/numerology-report', label: 'Reports', icon: FileText },
        { href: '/templates', label: 'Templates', icon: BookOpen },
      ]
    },
    {
      title: "Services",
      items: [
        { href: '/consultations', label: 'Consultations', icon: Users },
      ]
    }
  ];

  // Flatten nav items for mobile view
  const allNavItems = navGroups.flatMap(group => group.items);

  return (
    <nav className="fixed top-0 w-full backdrop-blur-2xl bg-white/30 dark:bg-gray-900/30 z-40 border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NumerAI
            </Link>
            
            {/* Desktop Navigation - Grouped */}
            <div className="hidden md:flex items-center gap-1">
              {navGroups.map((group, groupIndex) => (
                <div key={group.title} className="flex items-center">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium transition-all mx-1',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Separator between groups (except last group) */}
                  {groupIndex < navGroups.length - 1 && (
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            
            <NotificationBadge onClick={() => setShowNotifications(true)} />
            
            <motion.button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-md"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? 
                <MoonIcon className="w-5 h-5 text-gray-700" /> : 
                <SunIcon className="w-5 h-5 text-yellow-400" />
              }
            </motion.button>
            
            {/* User Menu with Profile Link */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-md transition-all",
                  pathname === '/profile' 
                    ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                aria-label="User Menu"
                title="Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {(user.full_name && user.full_name.charAt(0)) || 
                   (user.email && user.email.charAt(0)) || 
                   (user.phone && user.phone.charAt(0)) || 
                   'U'}
                </div>
                <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                  {user.full_name || user.email || user.phone || 'User'}
                </span>
                <Settings className="w-4 h-4 hidden md:inline" />
              </motion.button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user.email || user.phone || 'No contact info'}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        pathname === '/profile'
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      href="/subscription"
                      onClick={() => setShowUserMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        pathname === '/subscription'
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span>Subscription</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-4 h-4" />}
              className="gap-2"
            >
              <span className="hidden sm:inline">Logout</span>
            </GlassButton>
          </div>
        </div>

        {/* Mobile Navigation - Flattened */}
        <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all',
              pathname === '/profile'
                ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
}