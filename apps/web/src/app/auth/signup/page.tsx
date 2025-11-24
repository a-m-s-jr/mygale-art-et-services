'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // server-side magic link or API call.
      await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })
      alert('Check your email for a login link (placeholder)')
    } catch {
      alert('Signin failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="text-sm text-gray-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
          />
        </div>

        <div>
          <button disabled={loading} className="px-4 py-2 bg-indigo-600 rounded">
            {loading ? 'Sending…' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-gray-400">
        Need an account?{' '}
        <Link href="/auth/signup" className="text-indigo-400">
          Sign up
        </Link>
      </div>
    </div>
  )
}
