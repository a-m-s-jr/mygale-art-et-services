/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useCallback } from 'react'
import useSocket from '@/hooks/useSocket'
import { getSocket } from '@/lib/socket'

type Submission = {
  id: string
  name: string
  email: string
  message: string
  status?: string
  createdAt?: string
}

export default function ContactListClient({
  initialData,
  token,
}: {
  initialData: Submission[]
  token?: string
}) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialData ?? [])
  const [loading, setLoading] = useState(false)
  const [optimistic, setOptimistic] = useState<Record<string, string | null>>({})

  // subscribe to socket events
  useSocket(
    'contact:created',
    (payload) => {
      setSubmissions((prev) => [payload, ...prev])
    },
    token?.toString(),
  )

  useSocket(
    'contact:updated',
    (payload) => {
      setSubmissions((prev) => prev.map((p) => (p.id === payload.id ? payload : p)))
      setOptimistic((o) => {
        const copy = { ...o }
        delete copy[payload.id]
        return copy
      })
    },
    token?.toString(),
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/proxy/contact-submissions')
      if (!r.ok) throw new Error('Failed')
      const data = await r.json()
      setSubmissions(data)
    } finally {
      setLoading(false)
    }
  }, [])

  // optimistic status update
  async function updateStatus(id: string, newStatus: string) {
    // remember previous
    const prev = submissions.find((s) => s.id === id)
    if (!prev) return

    // optimistic
    setOptimistic((o) => ({ ...o, [id]: newStatus }))
    setSubmissions((s) => s.map((x) => (x.id === id ? { ...x, status: newStatus } : x)))

    try {
      const r = await fetch(`/api/proxy/contact-submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!r.ok) {
        throw new Error('update failed')
      }
      const updated = await r.json()
      setSubmissions((s) => s.map((x) => (x.id === id ? updated : x)))
    } catch (e) {
      // rollback on error
      setSubmissions((s) => s.map((x) => (x.id === id ? prev : x)))
    } finally {
      setOptimistic((o) => {
        const c = { ...o }
        delete c[id]
        return c
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={refresh} className="px-4 py-2 bg-black text-white rounded">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ul className="space-y-2">
        {submissions.map((s) => (
          <li key={s.id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p>
                  <strong>{s.name}</strong>
                </p>
                <p className="text-sm text-gray-500">{s.email}</p>
                <p className="mt-2">{s.message}</p>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <small className="text-xs text-gray-500">Status</small>
                  <div className="mt-1 flex gap-2">
                    <select
                      value={optimistic[s.id] ?? s.status ?? 'new'}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="new">new</option>
                      <option value="in_review">in_review</option>
                      <option value="responded">responded</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : null}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}