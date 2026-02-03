'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            {session?.user 
              ? 'You do not have permission to access this page. Admin access is required.'
              : 'You must be logged in to access this page.'
            }
          </p>
          
          <div className="space-y-3">
            {!session?.user && (
              <Link
                href="/login"
                className="block w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Sign In
              </Link>
            )}
            
            <Link
              href="/"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
            >
              Go Home
            </Link>
            
            {session?.user && (
              <p className="text-sm text-gray-500 mt-4">
                Logged in as: <strong>{session.user.email}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
