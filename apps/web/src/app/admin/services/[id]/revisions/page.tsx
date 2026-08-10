import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { restoreServiceRevision } from '../../actions'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    value,
  )
}

export default async function ServiceRevisionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) {
    notFound()
  }

  const revisions = await prisma.revision.findMany({
    where: { entityType: 'Service', entityId: id },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History — {service.titleFr}</h1>
        <p className="text-sm text-neutral-400">
          Every edit creates a snapshot. Restoring saves the current state first, so restores are
          themselves undoable.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {revisions.map((rev) => (
              <tr key={rev.id} className="bg-neutral-950">
                <td className="px-4 py-3 text-neutral-300">{formatDate(rev.createdAt)}</td>
                <td className="px-4 py-3 uppercase text-xs text-neutral-300">{rev.action}</td>
                <td className="px-4 py-3 text-neutral-300">
                  {rev.createdBy?.name || rev.createdBy?.email || '—'}
                </td>
                <td className="px-4 py-3">
                  <form action={restoreServiceRevision}>
                    <input type="hidden" name="revisionId" value={rev.id} />
                    <input type="hidden" name="serviceId" value={id} />
                    <button
                      type="submit"
                      className="rounded border border-neutral-700 px-3 py-1 text-xs"
                    >
                      Restore this version
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {revisions.length === 0 ? (
          <div className="px-4 py-6 text-sm text-neutral-400">No history yet.</div>
        ) : null}
      </div>
    </div>
  )
}
