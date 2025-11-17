/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type Body = {
  name?: string
  email?: string
  phone?: string
  message?: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // configure nodemailer transporter using env
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT ?? 587)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const to = process.env.CONTACT_TO ?? 'mygaleartetservices@gmail.com'

  if (!smtpHost || !smtpUser || !smtpPass) {
    // fail safe: if SMTP credentials missing, still return 500 with message
    return NextResponse.json({ error: 'SMTP not configured on server' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })

  const html = `
    <h3>Nouveau message Mygale</h3>
    <p><strong>Nom:</strong> ${escapeHtml(body.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
    <p><strong>Téléphone:</strong> ${escapeHtml(body.phone ?? '')}</p>
    <p><strong>Message:</strong><br/>${escapeHtml(body.message)}</p>
  `

  try {
    await transporter.sendMail({
      from: `"Mygale Website" <${smtpUser}>`,
      to,
      subject: `Nouveau message de ${body.name}`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('mail error', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
