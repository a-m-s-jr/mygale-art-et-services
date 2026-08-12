import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasPageAccess } from '@/lib/adminPages'
import { getUnreadContactCount } from '@/lib/queries/contactSubmissions'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  if (!hasPageAccess(user, 'contact-submissions')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const count = await getUnreadContactCount()
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
}
