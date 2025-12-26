'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setIsOpen(false);
    
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Navigate to new locale path
    if (newLocale === 'en') {
      // Default locale doesn't need prefix
      router.push(pathWithoutLocale);
    } else {
      router.push(`/${newLocale}${pathWithoutLocale}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-md hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {localeNames[locale].split(' ')[0]}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {locales.map((localeItem) => (
            <button
              key={localeItem}
              onClick={() => handleLocaleChange(localeItem)}
              className={cn(
                'w-full px-4 py-3 text-left text-sm transition-colors',
                locale === localeItem
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {localeNames[localeItem]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
