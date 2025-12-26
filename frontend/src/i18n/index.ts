import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If locale is missing, use default locale
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: validLocale as string,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

