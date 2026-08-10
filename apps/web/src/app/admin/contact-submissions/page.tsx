import Link from 'next/link'
import prisma from '@/lib/prisma'
import StatusChip from '@/components/StatusChip'
import { StatusSelect, AssigneeSelect } from './SubmissionRowControls'

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'in_review', label: 'In Review' },
  { id: 'responded', label: 'Responded' },
  { id: 'closed', label: 'Closed' },
]

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    value,
  )
}

export default async function AdminContactSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = status && status !== 'all' ? status : 'all'

  const [submissions, staff] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: activeStatus !== 'all' ? { status: activeStatus as never } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] } },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact Submissions</h1>
        <p className="text-sm text-neutral-400">Messages sent through the website contact form.</p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === 'all' ? '/admin/contact-submissions' : `/admin/contact-submissions?status=${tab.id}`}
            className={`rounded px-3 py-1 ${
              activeStatus === tab.id ? 'bg-neutral-800' : 'border border-neutral-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {submissions.map((s) => (
              <tr key={s.id} className="bg-neutral-950 align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/contact-submissions/${s.id}`} className="font-semibold hover:underline">
                    {s.name}
                  </Link>
                  <div className="text-xs text-neutral-400">{s.email}</div>
                  {s.phone ? <div className="text-xs text-neutral-400">{s.phone}</div> : null}
                </td>
                <td className="px-4 py-3 text-neutral-300 max-w-md">
                  <p className="line-clamp-3 whitespace-pre-wrap">{s.message}</p>
                </td>
                <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </td>
                <td className="px-4 py-3 space-y-2">
                  <StatusChip status={s.status} />
                  <StatusSelect submissionId={s.id} status={s.status} />
                </td>
                <td className="px-4 py-3">
                  <AssigneeSelect
                    submissionId={s.id}
                    assignedToId={s.assignedToId}
                    staff={staff}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No submissions yet.</div>
        ) : null}
      </div>
    </div>
  )
}
