import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'
import { escapeHtml } from '@/lib/escapeHtml'
import { getClientIp, rateLimit } from '@/lib/rateLimit'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
})

// 5 submissions per 10 minutes per client IP.
const CONTACT_RATE_LIMIT = 5
const CONTACT_RATE_WINDOW_MS = 10 * 60_000

export async function POST(request: Request) {
  console.log('[Contact API] Received POST request')

  const clientIp = getClientIp(request.headers)
  const rate = rateLimit(`contact:${clientIp}`, CONTACT_RATE_LIMIT, CONTACT_RATE_WINDOW_MS)
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    )
  }

  try {
    const body = await request.json()
    console.log('[Contact API] Parsed body:', { ...body, message: body.message?.substring(0, 50) })

    const data = schema.parse(body)
    console.log('[Contact API] Validation passed')

    // Persist first — this is the source of truth for the admin inbox.
    // Independent try/catch below for email so a DB hiccup doesn't block the
    // notification email, and vice versa.
    try {
      await prisma.contactSubmission.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message,
          source: 'website_contact_form',
        },
      })
      console.log('[Contact API] Submission persisted')
    } catch (dbError) {
      console.error('[Contact API] Failed to persist submission:', dbError)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.CONTACT_TO,
        subject: `Contact form: ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p><p><strong>Email:</strong> ${escapeHtml(data.email)}</p><p><strong>Phone:</strong> ${escapeHtml(data.phone || 'N/A')}</p><p><strong>Message:</strong></p><p>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>`,
      })
      console.log('[Contact API] Email sent successfully')
    } catch (emailError) {
      console.error('[Contact API] Email send failed (submission was still saved):', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Contact API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
