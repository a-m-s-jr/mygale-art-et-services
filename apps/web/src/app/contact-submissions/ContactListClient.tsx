/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useState, useEffect } from 'react'
import StatusFilter from '@/components/StatusFilter'
import SearchBar from '@/components/SearchBar'
import StatusChip from '@/components/StatusChip'
import Pagination from '@/components/Pagination'

export type Submission = {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

export default function ContactListClient({ token }: { token: string }) {
  const [data, setData] = useState<Submission[]>([])
  const [filtered, setFiltered] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  // pagination
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/contact-submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const list = await res.json()
      setData(list)
      setLoading(false)
    }
    load()
  }, [token])

  useEffect(() => {
    let items = data

    if (status !== 'all') {
      items = items.filter((s) => s.status === status)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.message.toLowerCase().includes(q),
      )
    }

    setFiltered(items)
    setPage(1)
  }, [status, search, data])

  if (loading) return <div>Loading…</div>

  const start = (page - 1) * pageSize
  const slice = filtered.slice(start, start + pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  return (
    <div className="space-y-6">
      <StatusFilter active={status} onChange={setStatus} />
      <SearchBar value={search} onChange={setSearch} />

      <div className="space-y-2">
        {slice.map((s) => (
          <a
            key={s.id}
            href={`/contact-submissions/${s.id}`}
            className="block p-3 border rounded hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-500">{s.email}</div>
              </div>
              <StatusChip status={s.status} />
            </div>

            <div className="text-sm mt-1 line-clamp-1">{s.message}</div>
            <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</div>
          </a>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  )
}
