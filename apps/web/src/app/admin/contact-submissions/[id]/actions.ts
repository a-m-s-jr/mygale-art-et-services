'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { writeAuditLog } from '@/lib/revisions'
import type { ReplyChannel } from '@prisma/client'

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function sendReply(_prevState: { error?: string }, formData: FormData) {
  const user = await requireRole('EDITOR')

  const submissionId = asString(formData.get('submissionId'))
  const channel = asString(formData.get('channel')) as ReplyChannel
  const body = asString(formData.get('body'))
  const returnToRaw = asString(formData.get('returnTo'))
  // Only allow redirecting back within this section — never trust an arbitrary path from a form field.
  const returnTo = returnToRaw.startsWith('/admin/contact-submissions/') ? returnToRaw : undefined

  if (!submissionId || !channel || !body) {
    return { error: 'A reply body and channel are required.' }
  }

  const submission = await prisma.contactSubmission.findUnique({ where: { id: submissionId } })
  if (!submission) {
    return { error: 'Submission not found.' }
  }

  if (channel === 'email') {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: submission.email,
        subject: `Re: your message to Mygale Art & Services`,
        text: body,
        html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      })
    } catch (err) {
      console.error('[Reply] Email send failed:', err)
      return { error: 'Failed to send email. The reply was not saved — please try again.' }
    }
  }

  await prisma.reply.create({
    data: { submissionId, channel, body, meta: { sentById: user.id } },
  })

  await prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { status: 'responded' },
  })

  await prisma.auditLog.create({
    data: { contactSubmissionId: submissionId, action: `reply:${channel}`, actorId: user.id },
  })
  await writeAuditLog(
    'contact_submission.reply',
    { entityType: 'ContactSubmission', entityId: submissionId, channel },
    user.id,
  )

  revalidatePath(`/admin/contact-submissions/${submissionId}`)
  revalidatePath('/admin/contact-submissions')
  revalidatePath('/admin')
  if (returnTo) revalidatePath(returnTo)
  redirect(returnTo ?? `/admin/contact-submissions/${submissionId}`)
}
