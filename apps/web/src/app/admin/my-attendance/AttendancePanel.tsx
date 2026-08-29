'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { checkInAttendance } from './actions'
import { formatClockTime } from '@/lib/timezone'

type Recorded = { arrivalAt: string; status: 'ON_TIME' | 'LATE' }

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

/**
 * Owns the transition from "not checked in" to "recorded" entirely on the
 * client. The check-in server action still does the real work (and still
 * can't be trusted to run twice), but display state lives here instead of
 * depending on the parent Server Component re-rendering — a revalidatePath
 * driven parent re-render can otherwise swap this component out before its
 * own "recorded successfully" confirmation ever paints.
 */
export default function AttendancePanel({ initialRecord }: { initialRecord: Recorded | null }) {
  const [record, setRecord] = useState<Recorded | null>(initialRecord)
  const [justRecorded, setJustRecorded] = useState(false)
  const [state, formAction] = useActionState(checkInAttendance, initialState)

  if (state.result && (!record || state.result.arrivalAt !== record.arrivalAt)) {
    setRecord({ arrivalAt: state.result.arrivalAt, status: state.result.status })
    setJustRecorded(!state.result.alreadyRecorded)
  }

  if (record) {
    return (
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          record.status === 'ON_TIME'
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
            : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
        }`}
      >
        <p className="font-semibold">
          {justRecorded ? 'Attendance recorded successfully.' : "Today's attendance is recorded."}
        </p>
        <p className="mt-1">Arrival: {formatClockTime(new Date(record.arrivalAt))}</p>
        <p>Status: {record.status === 'ON_TIME' ? 'ON TIME' : 'LATE'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">
        You haven&apos;t checked in today. Scan the attendance QR code at the entrance, or tap the
        button below if you followed a link from it.
      </p>
      <form action={formAction}>
        <SubmitButton />
      </form>
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}
    </div>
  )
}
