'use client'
import React from 'react'
import Link from 'next/link'
import LinklegacyBehavior from 'next/link.js'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
            <LinklegacyBehavior className="font-bold" href={'/'}>
              MyGale
            </LinklegacyBehavior>
        </div>

        <div className="flex items-center gap-4">
            <LinklegacyBehavior className="text-sm" href={'/contact-submissions'}>
              Submissions
            </LinklegacyBehavior>

          {status === 'loading' ? (
            <span>Loading...</span>
          ) : session ? (
            <>
              <span className="text-sm">Hi {session.user?.name ?? session.user?.email}</span>
              <button className="px-3 py-1 border rounded" onClick={() => signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <button className="px-3 py-1 border rounded" onClick={() => signIn()}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
