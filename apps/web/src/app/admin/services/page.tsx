import Link from 'next/link'
import prisma from '@/lib/prisma'
import { restoreService } from './actions'
import ServicesTable from './ServicesTable'

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const showTrash = tab === 'trash'

  const services = await prisma.service.findMany({
    where: showTrash ? { deletedAt: { not: null } } : { deletedAt: null },
    orderBy: showTrash ? { updatedAt: 'desc' } : { order: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-sm text-neutral-400">
            Manage service pages, sections, and ordering. Drag the handle to reorder.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold"
        >
          New Service
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href="/admin/services"
          className={`rounded px-3 py-1 ${!showTrash ? 'bg-neutral-800' : 'border border-neutral-800'}`}
        >
          Active
        </Link>
        <Link
          href="/admin/services?tab=trash"
          className={`rounded px-3 py-1 ${showTrash ? 'bg-neutral-800' : 'border border-neutral-800'}`}
        >
          Trash
        </Link>
      </div>

      {!showTrash ? (
        <ServicesTable services={services} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-300">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {services.map((service) => (
                <tr key={service.id} className="bg-neutral-950">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{service.titleFr}</div>
                    <div className="text-xs text-neutral-400">{service.titleEn}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{service.slug}</td>
                  <td className="px-4 py-3">
                    <form action={restoreService}>
                      <input type="hidden" name="id" value={service.id} />
                      <button
                        type="submit"
                        className="rounded border border-neutral-700 px-3 py-1 text-xs"
                      >
                        Restore
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-400">Trash is empty.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
