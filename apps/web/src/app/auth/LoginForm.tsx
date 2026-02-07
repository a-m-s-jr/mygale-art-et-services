'use client'

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
        <input
          name="password"
          type="password"
          required
          className="w-full mt-1 px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
