import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import StatusChip from '@/components/StatusChip'
import { StatusSelect, AssigneeSelect } from '../SubmissionRowControls'
import ReplyForm from './ReplyForm'

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

export default async function ContactSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [submission, staff] = await Promise.all([
    prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        replies: { orderBy: { sentAt: 'desc' } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF'] } },
      select: { id: true, name: true },
    }),
  ])

  if (!submission) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contact-submissions" className="text-sm text-neutral-400 hover:underline">
          {'<- Back to Contact Submissions'}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{submission.name}</h1>
        <p className="text-sm text-neutral-400">
          {submission.email}
          {submission.phone ? ` · ${submission.phone}` : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 p-4">
            <h2 className="mb-2 text-sm font-semibold text-neutral-200">Message</h2>
            <p className="whitespace-pre-wrap text-neutral-300">{submission.message}</p>
            <p className="mt-3 text-xs text-neutral-500">
              Received {formatDate(submission.createdAt)}
              {submission.source ? ` · ${submission.source}` : ''}
            </p>
          </div>

          <ReplyForm submissionId={submission.id} />

          <div className="rounded-xl border border-neutral-800 p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-200">Reply history</h2>
            {submission.replies.length === 0 ? (
              <p className="text-sm text-neutral-500">No replies yet.</p>
            ) : (
              <ul className="space-y-3">
                {submission.replies.map((reply) => (
                  <li key={reply.id} className="rounded-lg border border-neutral-800 p-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{CHANNEL_LABEL[reply.channel] || reply.channel}</span>
                      <span>{formatDate(reply.sentAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{reply.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 p-4 space-y-3">
            <div>
              <div className="text-xs text-neutral-500">Status</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusChip status={submission.status} />
              </div>
              <div className="mt-2">
                <StatusSelect submissionId={submission.id} status={submission.status} />
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Assignee</div>
              <div className="mt-1">
                <AssigneeSelect
                  submissionId={submission.id}
                  assignedToId={submission.assignedToId}
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
