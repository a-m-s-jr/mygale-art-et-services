'use client'
import React, { useEffect, useState } from 'react'
import RichTextComposer from '../../../../components/RichTextComposer'
import StatusChip from '../../../../components/StatusChip'

type Submission = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
  status: string
  replies?: { id: string; body: string; sentAt: string }[]
}

export default function SubmissionDetail({ params }: { params: { id: string } }) {
  const id = params.id
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [composer, setComposer] = useState('')

  useEffect(() => {
    // load submission (placeholder)
    fetch(`/api/proxy/contact-submissions/${id}`)
      .then((r) => r.json())
      .then((j) => setSubmission(j))
      .catch(() => {
        setSubmission({
          id,
          name: 'Demo user',
          email: 'demo@example.com',
          message: 'Hello — this is a demo conversation.',
          createdAt: new Date().toISOString(),
          status: 'new',
          replies: [],
        })
      })
  }, [id])

  async function sendReply() {
    if (!composer.trim()) return
    try {
      const r = await fetch(`/api/proxy/contact-submissions/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: composer, channel: 'email' }),
      })
      if (!r.ok) throw new Error('send failed')
      const j = await r.json()
      setSubmission(j.updated ?? j)
      setComposer('')
      alert('Sent (demo)')
    } catch {
      alert('Failed to send')
    }
  }

  if (!submission) return <div>Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">{submission.name}</h1>
          <div className="text-sm text-gray-400">{submission.email}</div>
          <div className="text-xs text-gray-500">
            Received: {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>
        <div>
          <StatusChip status={submission.status} />
        </div>
      </div>

      <section className="bg-neutral-850 p-4 rounded border border-neutral-800">
        <h3 className="font-medium">Message</h3>
        <p className="mt-2 whitespace-pre-line text-gray-200">{submission.message}</p>
      </section>

      <section>
        <h3 className="font-medium mb-3">Replies</h3>
        <div className="space-y-3">
          {(submission.replies ?? []).map((r) => (
            <div key={r.id} className="p-3 bg-neutral-800 rounded">
              <div className="text-xs text-gray-400">{new Date(r.sentAt).toLocaleString()}</div>
              <div className="mt-1">{r.body}</div>
            </div>
          ))}

          <div>
            <RichTextComposer
              value={composer}
              onChange={setComposer}
              placeholder="Write your reply..."
            />
            <div className="mt-2 flex gap-2">
              <button onClick={sendReply} className="px-3 py-2 bg-indigo-600 rounded">
                Send
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
