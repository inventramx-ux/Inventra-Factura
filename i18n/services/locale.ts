'use server';

import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from '../config';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  
  // If cookie exists and is a valid locale, use it
  if (existing && (locales as readonly string[]).includes(existing)) {
    return existing;
  }

  // Auto-detect from browser Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get('accept-language') || '';
  
  // Parse Accept-Language: "en-US,en;q=0.9,es;q=0.8" → try to match supported locales
  const detected = acceptLanguage
    .split(',')
    .map(part => {
      const [lang] = part.trim().split(';');
      return lang.trim().toLowerCase();
    })
    .find(lang => {
      // Check exact match first (e.g., "es"), then prefix match (e.g., "en-US" → "en")
      const prefix = lang.split('-')[0];
      return (locales as readonly string[]).includes(lang) || (locales as readonly string[]).includes(prefix);
    });

  let locale: Locale = defaultLocale;
  if (detected) {
    const prefix = detected.split('-')[0];
    locale = ((locales as readonly string[]).includes(detected) ? detected : prefix) as Locale;
  }

  return locale;
}

export async function setUserLocale(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
