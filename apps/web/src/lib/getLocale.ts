import { cookies } from 'next/headers'
import type { Lang } from '@/lib/locale'
import { getAdminTranslations } from '@/lib/adminTranslations'

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export async function getLocale(): Promise<Lang> {
  const jar = await cookies()
  const value = jar.get(LOCALE_COOKIE)?.value
  return value === 'en' ? 'en' : 'fr'
}

/** Admin panel translations for the current request's locale (Server Components). */
export async function getAdminT() {
  return getAdminTranslations(await getLocale())
}
