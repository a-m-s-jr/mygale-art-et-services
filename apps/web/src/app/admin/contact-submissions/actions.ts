'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import type { SubmissionStatus } from '@prisma/client'

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function updateSubmissionStatus(formData: FormData) {
  const user = await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  const status = asString(formData.get('status')) as SubmissionStatus
  if (!id || !status) return

  await prisma.contactSubmission.update({ where: { id }, data: { status } })

  await prisma.auditLog.create({
    data: { contactSubmissionId: id, action: `status:${status}`, actorId: user.id },
  })

  revalidatePath('/admin/contact-submissions')
  revalidatePath('/admin')
}

export async function assignSubmission(formData: FormData) {
  const user = await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  const assignedToId = asString(formData.get('assignedToId'))
  if (!id) return

  await prisma.contactSubmission.update({
    where: { id },
    data: { assignedToId: assignedToId || null },
  })

  await prisma.auditLog.create({
    data: {
      contactSubmissionId: id,
      action: assignedToId ? 'assigned' : 'unassigned',
      actorId: user.id,
    },
  })

  revalidatePath('/admin/contact-submissions')
}
