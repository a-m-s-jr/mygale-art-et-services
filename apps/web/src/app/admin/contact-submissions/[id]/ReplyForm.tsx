'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendReply } from './actions'

const initialState = { error: '' as string | undefined }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="rounded-lg bg-[#003366] px-5 py-2 text-white font-semibold disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Sending...' : 'Send Reply'}
    </button>
  )
}

export default function ReplyForm({
  submissionId,
  returnTo,
}: {
  submissionId: string
  returnTo?: string
}) {
  const [channel, setChannel] = useState<'email' | 'phone' | 'whatsapp' | 'note'>('email')
  const [body, setBody] = useState('')
  const [state, formAction] = useActionState(sendReply, initialState)

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-neutral-800 p-4">
      {state.error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <input type="hidden" name="submissionId" value={submissionId} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <div>
        <label className="text-sm text-neutral-300">Channel</label>
        <select
          name="channel"
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          value={channel}
          onChange={(e) => setChannel(e.target.value as typeof channel)}
        >
          <option value="email">Email (sends to the submitter)</option>
          <option value="phone">Phone call (log only)</option>
          <option value="whatsapp">WhatsApp (log only)</option>
          <option value="note">Internal note (log only)</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-neutral-300">Message</label>
        <textarea
          name="body"
          rows={5}
          required
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <SubmitButton />
    </form>
  )
}
