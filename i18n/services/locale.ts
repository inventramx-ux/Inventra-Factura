'use server';

import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from '../config';

const COOKIE_NAME = 'NEXT_LOCALE';

// Spanish speaking countries: ISO 3166-1 alpha-2 codes
const SPANISH_COUNTRIES = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 
  'GQ', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'ES', 
  'UY', 'VE', 'PR'
]);

export async function getUserLocale(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;

  // If cookie exists and is a valid locale, use it
  if (existing && (locales as readonly string[]).includes(existing)) {
    return existing;
  }

  const headerStore = await headers();
  
  // 1. Geolocation detection via provider headers (e.g., Vercel / Cloudflare)
  let country = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');

  // For Local Development Testing: Fetch the router's public IP country if headers are missing
  if (!country && process.env.NODE_ENV === 'development') {
    try {
      // Use ip-api to simulate the x-vercel-ip-country header locally
      const geoRes = await fetch('http://ip-api.com/json/', { next: { revalidate: 3600 } });
      if (geoRes.ok) {     
        const geoData = await geoRes.json();
        if (geoData && geoData.countryCode) {
          country = geoData.countryCode;
        }
      }
    } catch (e) {
      // Silently fail if offline or rate limited
    }
  }

  if (country) {
    return SPANISH_COUNTRIES.has(country.toUpperCase()) ? 'es' : 'en';
  }

  // 2. Fallback to browser Accept-Language header if geolocation is unvailable (e.g., local dev)
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
