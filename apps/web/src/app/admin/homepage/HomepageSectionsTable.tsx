'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SortableList from '@/components/admin/SortableList'
import { SortableRow, DragHandle } from '@/components/admin/SortableRow'
import { bulkReorderHomepageSections, toggleHomepageSectionVisibility } from './actions'

const TYPE_LABEL: Record<string, string> = {
  HERO: 'Hero',
  SERVICES_GRID: 'Services grid',
  ABOUT: 'About',
  MAP: 'Map / Location',
  STATS: 'Statistics',
  PARTNERS: 'Partners',
  TESTIMONIALS: 'Testimonials',
}

type SectionRow = { id: string; type: string; titleFr: string | null; visible: boolean }

export default function HomepageSectionsTable({ sections: initial }: { sections: SectionRow[] }) {
  const [sections, setSections] = useState(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // See ServicesTable for why this sync is required after same-route redirects.
  useEffect(() => {
    setSections(initial)
  }, [initial])

  function handleReorder(orderedIds: string[]) {
    const reordered = orderedIds
      .map((id) => sections.find((s) => s.id === id))
      .filter((s): s is SectionRow => Boolean(s))
    setSections(reordered)
    startTransition(async () => {
      await bulkReorderHomepageSections(orderedIds)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      <SortableList id="homepage-sections-table" items={sections} onReorder={handleReorder}>
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {sections.map((section) => (
              <SortableRow key={section.id} id={section.id} className="bg-neutral-950">
                {({ dragHandleProps }) => (
                  <>
                    <td className="px-4 py-3">
                      <DragHandle dragHandleProps={dragHandleProps} />
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {TYPE_LABEL[section.type] || section.type}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{section.titleFr || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          section.visible
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-neutral-700/40 text-neutral-300'
                        }`}
                      >
                        {section.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/homepage/${section.id}/edit`}
                          className="rounded border border-neutral-700 px-3 py-1 text-xs"
                        >
                          Edit
                        </Link>

                        <form action={toggleHomepageSectionVisibility}>
                          <input type="hidden" name="id" value={section.id} />
                          <input
                            type="hidden"
                            name="visible"
                            value={(!section.visible).toString()}
                          />
                          <button
                            type="submit"
                            className="rounded border border-neutral-700 px-3 py-1 text-xs"
                          >
                            {section.visible ? 'Hide' : 'Show'}
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
