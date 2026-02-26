'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signInWithPassword } from './actions'

const initialState = { error: '' as string | undefined }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-[#003366] px-4 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signInWithPassword, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="text-sm text-gray-300">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
        />
      </div>

      <div>
        <label className="text-sm text-gray-300">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            className="w-full mt-1 px-3 py-2 pr-10 rounded bg-neutral-800 border border-neutral-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z M6.75 6.75l10.5 10.5"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
