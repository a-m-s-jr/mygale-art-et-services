/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react'
import useSocket from '@/hooks/useSocket'
import { useToast } from '../../../components/ToastProvider'

type Reply = { id: string; body: string; channel: string; sentAt: string }
type Submission = {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
  replies?: Reply[]
  auditLogs?: any[]
}

export default function ContactDetailClient({
  initialData,
  token,
}: {
  initialData: Submission
  token: string
}) {
  const [submission, setSubmission] = useState<Submission>(initialData)
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [newReply, setNewReply] = useState('')

  // Receive server updates for this submission
  useSocket('contact:event', (evt: any) => {
    if (!evt) return
    if (evt.type === 'updated' && evt.payload?.id === submission.id) {
      setSubmission(evt.payload)
      toast.push('Submission updated', 'info')
    }
    if (evt.type === 'status_changed' && evt.payload?.id === submission.id) {
      setSubmission((s) => ({ ...s, status: evt.payload.status }))
      toast.push(`Status changed: ${evt.payload.status}`, 'success')
    }
  })

  async function changeStatusOptimistic(newStatus: string) {
    const prev = submission.status
    setSubmission({ ...submission, status: newStatus } as Submission) // optimistic
    setSaving(true)
    try {
      const res = await fetch(`/api/contact-submissions/${submission.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.push('Status updated', 'success')
    } catch (err) {
      setSubmission({ ...submission, status: prev })
      toast.push('Status update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function submitReply() {
    if (!newReply.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/contact-submissions/${submission.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: newReply, channel: 'email' }),
      })
      if (!res.ok) throw new Error('Reply failed')
      const updated = await res.json()
      setSubmission(updated)
      setNewReply('')
      toast.push('Reply added', 'success')
    } catch (err) {
      toast.push('Reply failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">{submission.name}</h1>
          <div className="text-sm text-gray-500">{submission.email}</div>
          <div className="text-xs text-gray-400">
            Submitted: {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm">
            Status: <strong>{submission.status}</strong>
          </div>
          <div className="flex gap-2">
            <button
              disabled={saving}
              onClick={() => changeStatusOptimistic('in_review')}
              className="px-2 py-1 border rounded text-sm"
            >
              Mark In Review
            </button>
            <button
              disabled={saving}
              onClick={() => changeStatusOptimistic('responded')}
              className="px-2 py-1 border rounded text-sm"
            >
              Mark Responded
            </button>
            <button
              disabled={saving}
              onClick={() => changeStatusOptimistic('closed')}
              className="px-2 py-1 border rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <section className="border p-4 rounded">
        <h2 className="font-medium">Message</h2>
        <p className="mt-2 whitespace-pre-line">{submission.message}</p>
      </section>

      <section>
        <h3 className="font-medium">Replies</h3>
        <div className="space-y-3 mt-3">
          {(submission.replies ?? []).map((r) => (
            <div key={r.id} className="p-3 border rounded">
              <div className="text-sm text-gray-500">
                {r.channel} · {new Date(r.sentAt).toLocaleString()}
              </div>
              <div className="mt-1">{r.body}</div>
            </div>
          ))}

          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 border px-3 py-2 rounded"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a reply..."
            />
            <button
              onClick={submitReply}
              disabled={saving}
              className="px-3 py-2 bg-black text-white rounded"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-medium">Audit Timeline</h3>
        <div className="mt-3 space-y-2">
          {submission.auditLogs?.length ? (
            submission.auditLogs.map((a: any) => (
              <div key={a.id} className="text-sm text-gray-700 border-l pl-3">
                <div className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
                <div className="mt-1">{a.action}</div>
                {a.details && (
                  <pre className="text-xs text-gray-500 mt-1">{JSON.stringify(a.details)}</pre>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No audit entries</div>
          )}
        </div>
      </section>
    </div>
  )
}
