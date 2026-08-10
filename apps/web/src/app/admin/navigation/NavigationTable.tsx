'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SortableList from '@/components/admin/SortableList'
import { SortableRow, DragHandle } from '@/components/admin/SortableRow'
import { bulkReorderNavigationItems, toggleNavigationItemVisibility } from './actions'

type NavRow = { id: string; labelFr: string; labelEn: string; href: string | null; visible: boolean }

export default function NavigationTable({ items: initial }: { items: NavRow[] }) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // See ServicesTable for why this sync is required after same-route redirects.
  useEffect(() => {
    setItems(initial)
  }, [initial])

  function handleReorder(orderedIds: string[]) {
    const reordered = orderedIds
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is NavRow => Boolean(i))
    setItems(reordered)
    startTransition(async () => {
      await bulkReorderNavigationItems(orderedIds)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      <SortableList id="navigation-table" items={items} onReorder={handleReorder}>
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Link</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id} className="bg-neutral-950">
                {({ dragHandleProps }) => (
                  <>
                    <td className="px-4 py-3">
                      <DragHandle dragHandleProps={dragHandleProps} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{item.labelFr}</div>
                      <div className="text-xs text-neutral-400">{item.labelEn}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{item.href || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.visible
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-neutral-700/40 text-neutral-300'
                        }`}
                      >
                        {item.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/navigation/${item.id}/edit`}
                          className="rounded border border-neutral-700 px-3 py-1 text-xs"
                        >
                          Edit
                        </Link>

                        <form action={toggleNavigationItemVisibility}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="visible" value={(!item.visible).toString()} />
                          <button
                            type="submit"
                            className="rounded border border-neutral-700 px-3 py-1 text-xs"
                          >
                            {item.visible ? 'Hide' : 'Show'}
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
    </div>
  )
}
