import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    value,
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeMeta(meta: any) {
  if (!meta || typeof meta !== 'object') return null
  const entityType = meta.entityType
  const entityId = meta.entityId
  if (!entityType) return null
  return `${entityType}${entityId ? ` · ${String(entityId).slice(0, 12)}` : ''}`
}

export default async function AdminAuditLogPage() {
  await requireRole('ADMIN')
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      actor: { select: { name: true, email: true } },
      contactSubmission: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-neutral-400">
          Every create, edit, publish, delete, restore, and login across the admin panel. Showing
          the most recent 200 entries.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {entries.map((entry) => (
              <tr key={entry.id} className="bg-neutral-950">
                <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-200">{entry.action}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {describeMeta(entry.meta) ||
                    (entry.contactSubmission
                      ? `Submission from ${entry.contactSubmission.name}`
                      : '—')}
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  {entry.actor?.name || entry.actor?.email || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No activity recorded yet.</div>
        ) : null}
      </div>
    </div>
  )
}
