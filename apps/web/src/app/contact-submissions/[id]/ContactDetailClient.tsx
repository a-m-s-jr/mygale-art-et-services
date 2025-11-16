/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import useSocket from '@/hooks/useSocket'
import { useToast } from '@/components/ToastProvider'
import RichTextComposer from './RichTextComposer'

type Reply = { id: string; body: string; channel: string; sentAt: string }
type AuditLog = { id: string; action: string; details: any; createdAt: string }

type Submission = {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
  assignedTo?: string | null
  replies?: Reply[]
  auditLogs?: AuditLog[]
}

type TimelineItem = {
  id: string
  type: 'submission' | 'reply' | 'status' | 'audit'
  createdAt: string
  payload: any
}

export default function ContactDetailClient({
  initialData,
  token,
}: {
  initialData: Submission
  token: string
}) {
  const toast = useToast()
  const [submission, setSubmission] = useState<Submission>(initialData)
  const [saving, setSaving] = useState(false)

  /** ────────────────────────────────
   *  REPLY COMPOSER + DRAFT SYNC
   *  ────────────────────────────────
   */
  const draftKey = `draft:submission:${submission.id}`
  const [composerValue, setComposerValue] = useState<string>('')

  // Load local + server drafts
  useEffect(() => {
    try {
      const local = localStorage.getItem(draftKey)
      if (local) setComposerValue(local)
    } catch {}

    ;(async () => {
      if (!token) return
      try {
        const r = await fetch(`/api/proxy/contact-submissions/${submission.id}/draft`)
        if (r.ok) {
          const j = await r.json()
          if (j?.draft) setComposerValue(j.draft)
        }
      } catch {}
    })()
  }, [draftKey, submission.id, token])

  /** ────────────────────────────────
   *  WEBSOCKET SUBSCRIPTIONS
   *  ────────────────────────────────
   */
  const socket = useSocket(token)

  useEffect(() => {
    const unsub = socket.subscribe('contact:event', (evt: any) => {
      if (!evt || evt.payload?.id !== submission.id) return

      switch (evt.type) {
        case 'updated':
          setSubmission(evt.payload)
          toast.push('Submission updated', 'info')
          break

        case 'status_changed':
          setSubmission((s) => ({ ...s, status: evt.payload.status }))
          toast.push(`Status updated → ${evt.payload.status}`, 'success')
          break

        case 'reply_added':
          // Reload entire submission to sync timeline
          ;(async () => {
            try {
              const r = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'}/contact-submissions/${submission.id}`,
              )
              if (r.ok) {
                const full = await r.json()
                setSubmission(full)
              }
            } catch {}
          })()
          toast.push('New reply received', 'info')
          break
      }
    })

    return unsub
  }, [socket, submission.id, toast])

  /** ────────────────────────────────
   *  STATUS CHANGE (OPTIMISTIC)
   *  ────────────────────────────────
   */
  async function changeStatus(newStatus: string) {
    const prev = submission.status
    setSubmission({ ...submission, status: newStatus }) // optimistic
    setSaving(true)

    try {
      const res = await fetch(`/api/proxy/contact-submissions/${submission.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const j = await res.json()
      setSubmission(j)
      toast.push('Status updated', 'success')
    } catch (err) {
      setSubmission({ ...submission, status: prev })
      toast.push('Status update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  /** ────────────────────────────────
   *  SEND REPLY (HTML EMAIL)
   *  ────────────────────────────────
   */
  async function submitReply() {
    if (!composerValue?.trim()) {
      toast.push('Please enter a message', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/proxy/contact-submissions/${submission.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: composerValue, channel: 'email' }),
      })
      if (!res.ok) throw new Error('Reply failed')

      const j = await res.json()
      setSubmission(j.updated ?? j)
      setComposerValue('')

      // clear local + server drafts
      try {
        localStorage.removeItem(draftKey)
        await fetch(`/api/proxy/contact-submissions/${submission.id}/draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft: '' }),
        })
      } catch {}

      toast.push('Reply sent', 'success')
    } catch (err) {
      toast.push('Reply failed to send', 'error')
    } finally {
      setSaving(false)
    }
  }

  /** ────────────────────────────────
   *  TIMELINE AGGREGATION
   *  ────────────────────────────────
   */
  const timeline: TimelineItem[] = useMemo(() => {
    const base: TimelineItem[] = [
      {
        id: 'submission',
        type: 'submission',
        createdAt: submission.createdAt,
        payload: {
          message: submission.message,
          name: submission.name,
          email: submission.email,
        },
      },
    ]

    const replies =
      submission.replies?.map((r) => ({
        id: r.id,
        type: 'reply' as const,
        createdAt: r.sentAt,
        payload: r,
      })) ?? []

    const audits =
      submission.auditLogs?.map((a) => ({
        id: a.id,
        type: 'audit' as const,
        createdAt: a.createdAt,
        payload: a,
      })) ?? []

    const statusAudits =
      submission.auditLogs
        ?.filter((a) => a.action === 'status_changed')
        .map((a) => ({
          id: `status-${a.id}`,
          type: 'status' as const,
          createdAt: a.createdAt,
          payload: a.details,
        })) ?? []

    return [...base, ...replies, ...audits, ...statusAudits].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  }, [submission])

  /** ────────────────────────────────
   *  RENDER TIMELINE ITEM
   *  ────────────────────────────────
   */
  function renderTimelineItem(item: TimelineItem) {
    switch (item.type) {
      case 'submission':
        return (
          <div className="border-l pl-4 pb-4">
            <div className="text-xs text-gray-400">
              Submitted: {new Date(item.createdAt).toLocaleString()}
            </div>
            <p className="mt-1 whitespace-pre-line text-gray-700">{item.payload.message}</p>
          </div>
        )
      case 'reply':
        return (
          <div className="border-l pl-4 pb-4">
            <div className="text-xs text-gray-500">
              Reply · {new Date(item.createdAt).toLocaleString()}
            </div>
            <div
              className="mt-1 p-2 bg-gray-50 rounded"
              dangerouslySetInnerHTML={{ __html: item.payload.body }}
            />
          </div>
        )
      case 'status':
        return (
          <div className="border-l pl-4 pb-4 text-sm text-yellow-700">
            Status changed → <strong>{item.payload.status}</strong>
            <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
          </div>
        )
      case 'audit':
        return (
          <div className="border-l pl-4 pb-4 text-sm">
            <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
            <div className="mt-1">{item.payload.action}</div>
            {item.payload.details && (
              <pre className="text-xs text-gray-500 mt-1">
                {JSON.stringify(item.payload.details, null, 2)}
              </pre>
            )}
          </div>
        )
      default:
        return null
    }
  }

  /** ────────────────────────────────
   *  UI
   *  ────────────────────────────────
   */
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">{submission.name}</h1>
          <div className="text-sm text-gray-500">{submission.email}</div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => changeStatus('in_review')}
            className="px-2 py-1 border rounded"
          >
            In Review
          </button>
          <button
            disabled={saving}
            onClick={() => changeStatus('responded')}
            className="px-2 py-1 border rounded"
          >
            Responded
          </button>
          <button
            disabled={saving}
            onClick={() => changeStatus('closed')}
            className="px-2 py-1 border rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* ACTIVITY TIMELINE */}
      <section>
        <h2 className="font-medium mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.id}>{renderTimelineItem(item)}</div>
          ))}
        </div>
      </section>

      {/* REPLY COMPOSER */}
      <section>
        <h3 className="font-medium mb-2">Send a Reply</h3>

        <RichTextComposer
          value={composerValue}
          onChange={(v) => {
            setComposerValue(v)
            try {
              localStorage.setItem(draftKey, v)
            } catch {}
            // background save
            void fetch(`/api/proxy/contact-submissions/${submission.id}/draft`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ draft: v }),
            }).catch(() => {})
          }}
          placeholder="Write your reply (basic HTML allowed)"
          autosaveKey={draftKey}
        />

        <div className="flex gap-2 mt-2">
          <button
            onClick={submitReply}
            disabled={saving}
            className="px-3 py-2 bg-black text-white rounded"
          >
            Send Email
          </button>
          <button
            onClick={async () => {
              try {
                localStorage.setItem(draftKey, composerValue)
                await fetch(`/api/proxy/contact-submissions/${submission.id}/draft`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ draft: composerValue }),
                })
                toast.push('Draft saved', 'info')
              } catch {
                toast.push('Draft save failed', 'error')
              }
            }}
            className="px-3 py-2 border rounded"
          >
            Save Draft
          </button>
        </div>
      </section>

      {/* AUDIT LOG (full) */}
      <section>
        <h3 className="font-medium">Audit Log</h3>
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
