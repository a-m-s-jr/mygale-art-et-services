import { cookies } from 'next/headers'
import type { Lang } from '@/lib/locale'

export const LOCALE_COOKIE = 'NEXT_LOCALE'

export async function getLocale(): Promise<Lang> {
  const jar = await cookies()
  const value = jar.get(LOCALE_COOKIE)?.value
  return value === 'en' ? 'en' : 'fr'
}
