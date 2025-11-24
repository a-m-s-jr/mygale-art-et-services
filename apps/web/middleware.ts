import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect routes under /contact-submissions (redirect to /login)
export function middleware(req: NextRequest) {
  const protectedPrefix = '/contact-submissions'
  if (req.nextUrl.pathname.startsWith(protectedPrefix)) {
    // we can't access session here; rely on client to re-direct if needed,
    // but we can allow navigation — we choose *not* to redirect at middleware
    // to keep server components fetching session with getServerSession.
    return NextResponse.next()
  }
  return NextResponse.next()
}
