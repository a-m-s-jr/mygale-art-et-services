import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protect routes under /admin and /contact-submissions
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If not admin, redirect to unauthorized
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Protect routes under /contact-submissions (redirect to /login)
  if (pathname.startsWith('/contact-submissions')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/contact-submissions/:path*',
  ],
}
