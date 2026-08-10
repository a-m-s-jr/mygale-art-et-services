import { NextResponse } from 'next/server'
import { LOCALE_COOKIE } from '@/lib/getLocale'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const lang = body?.lang === 'en' ? 'en' : 'fr'

  const response = NextResponse.json({ ok: true, lang })
  response.cookies.set(LOCALE_COOKIE, lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}
