'use client'
import React from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      <div className="space-y-3">
        <button onClick={() => signIn('google')} className="w-full px-4 py-2 border rounded">
          Continue with Google
        </button>

        <div className="text-center text-sm text-gray-500">Or sign in with email (magic link)</div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const email = (form.elements.namedItem('email') as HTMLInputElement).value
            signIn('email', { email, callbackUrl: '/' })
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border px-3 py-2 rounded"
          />
          <button className="mt-3 w-full px-4 py-2 bg-black text-white rounded">
            Send magic link
          </button>
        </form>
      </div>
    </div>
  )
}
