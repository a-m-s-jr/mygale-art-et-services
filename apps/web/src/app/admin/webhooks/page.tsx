/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type Attempt = {
  id: string
  webhookUrl: string
  status: string
  attempt: number
  maxAttempts: number
  response?: string
  createdAt: string
  nextRetryAt?: string | null
  payload?: any
}

export default function WebhookAdminPage() {
  const { data: session, status } = useSession()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page])

  async function fetchData() {
    setLoading(true)
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
    const res = await fetch(`${apiBase}/admin/webhooks?page=${page}&pageSize=25`, {
      headers: { Authorization: `Bearer ${session?.apiToken ?? ''}` },
    })
    if (!res.ok) {
      setAttempts([])
      setLoading(false)
      return
    }
    const j = await res.json()
    setAttempts(j.items ?? [])
    setLoading(false)
  }

  async function retry(id: string) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
    await fetch(`${apiBase}/admin/webhooks/${id}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.apiToken ?? ''}` },
    })
    // refresh
    void fetchData()
  }

  if (status === 'loading') return <div className="p-6">Loading…</div>
  if (status !== 'authenticated') return <div className="p-6">Please sign in</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Webhook Attempts</h1>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <div key={a.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-gray-600">{a.webhookUrl}</div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div>
                    <strong>{a.status}</strong> — {a.attempt}/{a.maxAttempts}
                  </div>
                  {a.nextRetryAt && (
                    <div className="text-xs text-gray-400">
                      Next: {new Date(a.nextRetryAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm">
                <div className="mb-2">
                  Response:{' '}
                  {a.response ? (
                    <pre className="whitespace-pre-wrap">{a.response}</pre>
                  ) : (
                    <em>—</em>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => retry(a.id)}
                    className="px-3 py-1 bg-black text-white rounded text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ))}
          {attempts.length === 0 && <div className="text-sm text-gray-500">No attempts</div>}
        </div>
      )}
    </div>
  )
}
