'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

function asString(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function createBlogCategory(formData: FormData) {
  await requireRole('EDITOR')

  const nameFr = asString(formData.get('nameFr'))
  const nameEn = asString(formData.get('nameEn'))
  if (!nameFr || !nameEn) return

  const slug = slugify(nameEn || nameFr, { lower: true, strict: true, trim: true })

  const existing = await prisma.blogCategory.findUnique({ where: { slug } })
  if (existing) return

  await prisma.blogCategory.create({ data: { slug, nameFr, nameEn } })

  revalidatePath('/admin/blog-categories')
  revalidatePath('/blog')
  redirect('/admin/blog-categories')
}

export async function deleteBlogCategory(formData: FormData) {
  await requireRole('EDITOR')
  const id = asString(formData.get('id'))
  if (!id) return

  await prisma.blogCategory.delete({ where: { id } })

  revalidatePath('/admin/blog-categories')
  revalidatePath('/blog')
}
