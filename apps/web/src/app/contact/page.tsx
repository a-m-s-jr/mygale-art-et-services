/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react'
import { useLocale } from '@/lib/locale'
import { z } from 'zod'
import SuccessAnim from '@/components/SuccessAnim'

const FormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
})

export default function ContactPage() {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorText('')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setErrorText(data?.error || 'Failed to send')
        setStatus('error')
        return
      }
      setStatus('sent')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch (err: any) {
      setStatus('error')
      setErrorText(err?.message || 'Network error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-4">{t.contactUs}</h1>
      <p className="text-gray-600 mb-6">
        Pour toute demande, envoyez-nous un message — nous répondrons rapidement.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          placeholder={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="input"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder={t.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="input h-36"
          placeholder={t.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <div>
          <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : t.send}
          </button>
        </div>
        {status === 'sent' && <div className="text-green-600">{t.thanks}</div>}
        {status === 'error' && <div className="text-red-600">Erreur: {errorText}</div>}
      </form>
    </div>
  )
}
