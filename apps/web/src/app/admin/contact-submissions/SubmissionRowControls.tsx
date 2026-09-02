'use client'

import { updateSubmissionStatus, assignSubmission } from './actions'
import { useAdminT } from '@/lib/locale'

const STATUSES = ['new', 'in_review', 'responded', 'closed'] as const

export function StatusSelect({
  submissionId,
  status,
}: {
  submissionId: string
  status: string
}) {
  const t = useAdminT().contactSubmissions
  return (
    <form action={updateSubmissionStatus}>
      <input type="hidden" name="id" value={submissionId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t.statusTabs[s]}
          </option>
        ))}
      </select>
    </form>
  )
}

export function AssigneeSelect({
  submissionId,
  assignedToId,
  staff,
}: {
  submissionId: string
  assignedToId: string | null
  staff: { id: string; name: string }[]
}) {
  const t = useAdminT().contactSubmissions
  return (
    <form action={assignSubmission}>
      <input type="hidden" name="id" value={submissionId} />
      <select
        name="assignedToId"
        defaultValue={assignedToId || ''}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
      >
        <option value="">{t.unassigned}</option>
        {staff.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </form>
  )
}
