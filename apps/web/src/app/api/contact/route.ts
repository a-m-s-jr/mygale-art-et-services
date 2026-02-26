import { NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
})

export async function POST(request: Request) {
  console.log('[Contact API] Received POST request')
  
  try {
    const body = await request.json()
    console.log('[Contact API] Parsed body:', { ...body, message: body.message?.substring(0, 50) })
    
    const data = schema.parse(body)
    console.log('[Contact API] Validation passed')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    console.log('[Contact API] Transporter created')

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.CONTACT_TO,
      subject: `Contact form: ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message}`,
      html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Phone:</strong> ${data.phone || 'N/A'}</p><p><strong>Message:</strong></p><p>${data.message}</p>`,
    })
    console.log('[Contact API] Email sent successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Contact API] Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
