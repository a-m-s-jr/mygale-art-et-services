import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import StatusChip from '../../../components/StatusChip'
import Pagination from '../../../components/Pagination'

type Item = { id: string; name: string; email: string; status: string; createdAt: string }

export default function SubmissionsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)

  useEffect(() => {
    // load submissions (placeholder)
    fetch('/api/proxy/contact-submissions?page=' + page)
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .catch(() => {
        // demo placeholder
        setItems([
          {
            id: '1',
            name: 'WS Test',
            email: 'ws@example.com',
            status: 'new',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Maya',
            email: 'maya@example.com',
            status: 'responded',
            createdAt: new Date().toISOString(),
          },
        ])
      })
  }, [page])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Contact submissions</h1>
      </div>

      <div className="bg-neutral-850 rounded border border-neutral-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Received</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-neutral-800">
                <td className="p-3">{it.name}</td>
                <td className="p-3 text-gray-300">{it.email}</td>
                <td className="p-3">
                  <StatusChip status={it.status} />
                </td>
                <td className="p-3 text-xs text-gray-400">
                  {new Date(it.createdAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/contact-submissions/${it.id}`}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} onPage={(p) => setPage(p)} />
    </div>
  )
}
