'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SortableList from '@/components/admin/SortableList'
import { SortableRow, DragHandle } from '@/components/admin/SortableRow'
import { bulkReorderServices, softDeleteService, toggleServicePublish } from './actions'
import { useAdminT } from '@/lib/locale'

type ServiceRow = {
  id: string
  titleFr: string
  titleEn: string
  slug: string
  featured: boolean
  published: boolean
}

export default function ServicesTable({ services: initial }: { services: ServiceRow[] }) {
  const [services, setServices] = useState(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const adminT = useAdminT()
  const t = adminT.services
  const common = adminT.common

  // Server actions redirect back to this same route after mutating (publish
  // toggle, soft-delete, etc.); Next.js refreshes the RSC payload but this
  // component's own useState never re-derives from a changed prop on its
  // own, so without this the table can keep showing pre-mutation data.
  useEffect(() => {
    setServices(initial)
  }, [initial])

  function handleReorder(orderedIds: string[]) {
    const reordered = orderedIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is ServiceRow => Boolean(s))
    setServices(reordered)
    startTransition(async () => {
      await bulkReorderServices(orderedIds)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      <SortableList id="services-table" items={services} onReorder={handleReorder}>
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">{t.tableTitle}</th>
              <th className="px-4 py-3">{t.tableSlug}</th>
              <th className="px-4 py-3">{t.tableFeatured}</th>
              <th className="px-4 py-3">{t.tableStatus}</th>
              <th className="px-4 py-3">{t.tableActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {services.map((service) => (
              <SortableRow key={service.id} id={service.id} className="bg-neutral-950">
                {({ dragHandleProps }) => (
                  <>
                    <td className="px-4 py-3">
                      <DragHandle dragHandleProps={dragHandleProps} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{service.titleFr}</div>
                      <div className="text-xs text-neutral-400">{service.titleEn}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{service.slug}</td>
                    <td className="px-4 py-3 text-neutral-300">{service.featured ? t.yes : t.no}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          service.published
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {service.published ? common.published : common.draft}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/services/${service.id}/edit`}
                          className="rounded border border-neutral-700 px-3 py-1 text-xs"
                        >
                          {t.edit}
                        </Link>
                        <Link
                          href={`/services/${service.slug}?preview=1`}
                          target="_blank"
                          className="rounded border border-neutral-700 px-3 py-1 text-xs"
                        >
                          {t.preview}
                        </Link>
                        <Link
                          href={`/admin/services/${service.id}/revisions`}
                          className="rounded border border-neutral-700 px-3 py-1 text-xs"
                        >
                          {t.history}
                        </Link>

                        <form action={toggleServicePublish}>
                          <input type="hidden" name="id" value={service.id} />
                          <input
                            type="hidden"
                            name="published"
                            value={(!service.published).toString()}
                          />
                          <button
                            type="submit"
                            className="rounded border border-neutral-700 px-3 py-1 text-xs"
                          >
                            {service.published ? t.unpublish : t.publish}
                          </button>
                        </form>

                        <form action={softDeleteService}>
                          <input type="hidden" name="id" value={service.id} />
                          <button
                            type="submit"
                            className="rounded border border-red-500/60 px-3 py-1 text-xs text-red-200"
                          >
                            {t.delete}
                          </button>
                        </form>
                      </div>
                    </td>
                  </>
                )}
              </SortableRow>
            ))}
          </tbody>
        </table>
      </SortableList>
      {services.length === 0 ? (
        <div className="px-4 py-6 text-sm text-neutral-400">{t.noServices}</div>
      ) : null}
    </div>
  )
}
