'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { checkInAttendance } from './actions'
import { formatClockTime } from '@/lib/timezone'

const initialState: {
  error?: string
  result?: { arrivalAt: string; status: 'ON_TIME' | 'LATE'; alreadyRecorded: boolean }
} = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-[#003366] px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Recording...' : 'Scan Attendance QR'}
    </button>
  )
}

export default function CheckInPanel() {
  const [state, formAction] = useActionState(checkInAttendance, initialState)

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      {state.result ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.result.status === 'ON_TIME'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
          }`}
        >
          <p className="font-semibold">
            {state.result.alreadyRecorded
              ? "Today's attendance has already been recorded."
              : 'Attendance recorded successfully.'}
          </p>
          <p className="mt-1">Arrival: {formatClockTime(new Date(state.result.arrivalAt))}</p>
          <p>Status: {state.result.status === 'ON_TIME' ? 'ON TIME' : 'LATE'}</p>
        </div>
      ) : null}
    </div>
  )
}
