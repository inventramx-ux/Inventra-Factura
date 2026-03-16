'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'NEXT_LOCALE';
const DEFAULT_LOCALE = 'es';

export async function getUserLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || DEFAULT_LOCALE;
}

export async function setUserLocale(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
