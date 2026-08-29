'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { correctAttendance } from './actions'

const initialState = { error: '' as string | undefined }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-sm font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving...' : 'Save Correction'}
    </button>
  )
}

export default function CorrectForm({ id, arrivalTime }: { id: string; arrivalTime: string }) {
  const [state, formAction] = useActionState(correctAttendance, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="text-sm text-neutral-300">Arrival time *</label>
        <input
          type="time"
          name="arrivalTime"
          defaultValue={arrivalTime}
          required
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-neutral-300">Reason for correction *</label>
        <textarea
          name="note"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          placeholder="e.g. Employee scanned the QR but the phone lost signal; confirmed arrival with supervisor."
        />
      </div>

      <SubmitButton />
    </form>
  )
}
