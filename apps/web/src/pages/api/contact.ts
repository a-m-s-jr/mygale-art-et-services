/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(5),
  source: z.string().optional(),
})

type Submission = z.infer<typeof ContactSchema> & { id: string; createdAt: string }

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json')

function saveSubmissionLocally(sub: Submission) {
  try {
    if (!fs.existsSync(path.dirname(SUBMISSIONS_FILE)))
      fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true })

    let arr: Submission[] = []
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf8')
      try {
        arr = JSON.parse(raw || '[]')
      } catch {
        arr = []
      }
    }
    arr.unshift(sub)
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Failed to save submission file', err)
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const parsed = ContactSchema.parse(req.body)
    const submission: Submission = {
      ...parsed,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    // Send email via Nodemailer / SMTP
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT || 587)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const contactTo = process.env.CONTACT_TO

    if (!smtpHost || !smtpUser || !smtpPass || !contactTo) {
      console.error('SMTP environment variables not set')
      // Still save locally for the tiny-CMS; return 202
      saveSubmissionLocally(submission)
      return res.status(202).json({ ok: true, warning: 'SMTP not configured; saved locally' })
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const html = `
      <h2>New contact submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(submission.phone ?? '')}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(submission.message).replace(/\n/g, '<br/>')}</p>
      <hr/>
      <small>Received at ${submission.createdAt}</small>
    `

    await transporter.sendMail({
      from: `"Mygale Contact" <${smtpUser}>`,
      to: contactTo,
      subject: `New contact from ${submission.name}`,
      text: `${submission.name} <${submission.email}>: ${submission.message}`,
      html,
    })

    // Save locally too (for admin view)
    saveSubmissionLocally(submission)

    return res.status(201).json({ ok: true })
  } catch (err: any) {
    console.error('Contact API error:', err)
    if (err?.issues) {
      // zod validation errors
      return res.status(422).json({ ok: false, errors: err.issues })
    }
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}

function escapeHtml(s: string) {
  if (!s) return ''
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )
}
