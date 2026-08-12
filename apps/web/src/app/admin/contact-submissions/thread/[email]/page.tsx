import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import StatusChip from '@/components/StatusChip'
import { StatusSelect, AssigneeSelect } from '../../SubmissionRowControls'
import ReplyForm from '../../[id]/ReplyForm'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    value,
  )
}

const CHANNEL_LABEL: Record<string, string> = {
  email: 'Email',
  phone: 'Phone call',
  whatsapp: 'WhatsApp',
  note: 'Internal note',
}

type TimelineItem =
  | { kind: 'submission'; id: string; at: Date; message: string; source: string | null }
  | { kind: 'reply'; id: string; at: Date; body: string; channel: string }

export default async function ContactThreadPage({
  params,
}: {
  params: Promise<{ email: string }>
}) {
  const { email: rawEmail } = await params
  // Route params come through percent-encoded here (confirmed empirically —
  // Next 16 does not auto-decode this segment), so decode explicitly.
  const email = decodeURIComponent(rawEmail)

  const [submissions, staff] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: { email: { equals: email, mode: 'insensitive' } },
      orderBy: { createdAt: 'asc' },
      include: {
        replies: { orderBy: { sentAt: 'asc' } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] } },
      select: { id: true, name: true },
    }),
  ])

  if (submissions.length === 0) {
    notFound()
  }

  const latest = submissions[submissions.length - 1]
  const returnTo = `/admin/contact-submissions/thread/${encodeURIComponent(email)}`

  const timeline: TimelineItem[] = []
  for (const s of submissions) {
    timeline.push({ kind: 'submission', id: s.id, at: s.createdAt, message: s.message, source: s.source })
    for (const r of s.replies) {
      timeline.push({ kind: 'reply', id: r.id, at: r.sentAt, body: r.body, channel: r.channel })
    }
  }
  timeline.sort((a, b) => a.at.getTime() - b.at.getTime())

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contact-submissions" className="text-sm text-neutral-400 hover:underline">
          {'<- Back to Inbox'}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{latest.name}</h1>
        <p className="text-sm text-neutral-400">
          {latest.email}
          {latest.phone ? ` · ${latest.phone}` : ''}
          {submissions.length > 1 ? ` · ${submissions.length} messages` : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          <div className="space-y-3">
            {timeline.map((item) =>
              item.kind === 'submission' ? (
                <div key={`s-${item.id}`} className="rounded-xl border border-neutral-800 p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Message from {latest.name}</span>
                    <span>{formatDate(item.at)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{item.message}</p>
                </div>
              ) : (
                <div
                  key={`r-${item.id}`}
                  className="ml-6 rounded-xl border border-[#003366]/40 bg-[#003366]/10 p-4"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Reply · {CHANNEL_LABEL[item.channel] || item.channel}</span>
                    <span>{formatDate(item.at)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-200">{item.body}</p>
                </div>
              ),
            )}
          </div>

          <ReplyForm submissionId={latest.id} returnTo={returnTo} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 p-4 space-y-3">
            <div>
              <div className="text-xs text-neutral-500">Status</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusChip status={latest.status} />
              </div>
              <div className="mt-2">
                <StatusSelect submissionId={latest.id} status={latest.status} />
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Assignee</div>
              <div className="mt-1">
                <AssigneeSelect
                  submissionId={latest.id}
                  assignedToId={latest.assignedToId}
                  staff={staff}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
