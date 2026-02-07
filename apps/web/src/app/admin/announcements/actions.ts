'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import type { AnnouncementType } from '@prisma/client'

type ActionState = {
  error?: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function createAnnouncement(_prevState: ActionState, formData: FormData) {
  await requireAdmin()

  const title = asString(formData.get('title'))
  const message = asString(formData.get('message'))
  const imageUrl = asString(formData.get('imageUrl')) || null
  const type = (asString(formData.get('type')) || 'info') as AnnouncementType
  const active = formData.get('active') === 'on'
  const startsAt = parseDate(formData.get('startsAt'))
  const endsAt = parseDate(formData.get('endsAt'))
  const dismissible = formData.get('dismissible') === 'on'

  if (!title || !message) {
    return { error: 'Please provide a title and message.' }
  }

  await prisma.announcement.create({
    data: {
      title,
      message,
      imageUrl,
      type,
      active,
      startsAt,
      endsAt,
      dismissible,
    },
  })

  revalidatePath('/', 'layout')
  redirect('/admin/announcements')
}

export async function updateAnnouncement(_prevState: ActionState, formData: FormData) {
  await requireAdmin()

  const id = asString(formData.get('id'))
  const title = asString(formData.get('title'))
  const message = asString(formData.get('message'))
  const imageUrl = asString(formData.get('imageUrl')) || null
  const type = (asString(formData.get('type')) || 'info') as AnnouncementType
  const active = formData.get('active') === 'on'
  const startsAt = parseDate(formData.get('startsAt'))
  const endsAt = parseDate(formData.get('endsAt'))
  const dismissible = formData.get('dismissible') === 'on'

  if (!id || !title || !message) {
    return { error: 'Please provide a title and message.' }
  }

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      message,
      imageUrl,
      type,
      active,
      startsAt,
      endsAt,
      dismissible,
    },
  })

  revalidatePath('/', 'layout')
  redirect('/admin/announcements')
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin()

  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.announcement.delete({ where: { id } })
  revalidatePath('/', 'layout')
  redirect('/admin/announcements')
}

export async function toggleAnnouncementActive(formData: FormData) {
  await requireAdmin()

  const id = asString(formData.get('id'))
  const value = asString(formData.get('active'))
  if (!id) return

  const active = value === 'true'

  await prisma.announcement.update({
    where: { id },
    data: { active },
  })

  revalidatePath('/', 'layout')
  redirect('/admin/announcements')
}
