'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createRedirect, updateRedirect } from './actions'

const initialState = { error: '' as string | undefined }

type RedirectFormData = {
  id?: string
  fromPath: string
  toPath: string
  statusCode: number
  active: boolean
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving...' : label}
    </button>
  )
}

export default function RedirectForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit'
  initial?: RedirectFormData
}) {
  const [fromPath, setFromPath] = useState(initial?.fromPath ?? '')
  const [toPath, setToPath] = useState(initial?.toPath ?? '')
  const [statusCode, setStatusCode] = useState(initial?.statusCode ?? 308)
  const [active, setActive] = useState(initial?.active ?? true)

  const action = mode === 'create' ? createRedirect : updateRedirect
  const [state, formAction] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      {mode === 'edit' && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-neutral-300">From path *</label>
          <input
            name="fromPath"
            placeholder="/old-page"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-neutral-300">To path *</label>
          <input
            name="toPath"
            placeholder="/new-page or https://..."
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-neutral-300">Status code</label>
          <select
            name="statusCode"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
          >
            <option value={308}>308 — Permanent (preserves method)</option>
            <option value={301}>301 — Permanent</option>
            <option value={302}>302 — Temporary</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-300 mt-6">
          <input
            type="checkbox"
            name="active"
            className="h-4 w-4"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>
      </div>

      <SubmitButton label={mode === 'create' ? 'Create Redirect' : 'Save Changes'} />
    </form>
  )
}
