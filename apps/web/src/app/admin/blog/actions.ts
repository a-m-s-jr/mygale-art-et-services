'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import prisma from '@/lib/prisma'
import { requireAdmin, requireRole } from '@/lib/auth'
import type { BlogLocale } from '@prisma/client'

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

function normalizeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true })
}

async function resolveTagIds(rawTags: string): Promise<string[]> {
  const names = rawTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const ids: string[] = []
  for (const name of names) {
    const slug = slugify(name, { lower: true, strict: true, trim: true })
    if (!slug) continue
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { slug, nameFr: name, nameEn: name },
    })
    ids.push(tag.id)
  }
  return ids
}

/** Links this post's translationGroupId with an existing post in the other locale. */
async function linkTranslation(postId: string, translationOfId: string) {
  const other = await prisma.blogPost.findUnique({ where: { id: translationOfId } })
  if (!other) return

  const groupId = other.translationGroupId ?? crypto.randomUUID()
  if (!other.translationGroupId) {
    await prisma.blogPost.update({ where: { id: other.id }, data: { translationGroupId: groupId } })
  }
  await prisma.blogPost.update({ where: { id: postId }, data: { translationGroupId: groupId } })
}

export async function createBlogPost(_prevState: ActionState, formData: FormData) {
  await requireRole('EDITOR')

  const title = asString(formData.get('title'))
  const rawSlug = asString(formData.get('slug')) || title
  const slug = normalizeSlug(rawSlug)
  const excerpt = asString(formData.get('excerpt'))
  const content = asString(formData.get('content'))
  const coverImage = asString(formData.get('coverImage'))
  const locale = (asString(formData.get('locale')) || 'fr') as BlogLocale
  const published = formData.get('published') === 'on'
  const publishedAtInput = parseDate(formData.get('publishedAt'))
  const seoTitle = asString(formData.get('seoTitle'))
  const seoDescription = asString(formData.get('seoDescription'))
  const categoryId = asString(formData.get('categoryId')) || null
  const tagIds = await resolveTagIds(asString(formData.get('tags')))
  const translationOfId = asString(formData.get('translationOfId'))

  if (!title || !slug || !excerpt || !content || !seoTitle || !seoDescription) {
    return { error: 'Please fill in all required fields.' }
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) {
    return { error: 'Slug already exists. Please choose another.' }
  }

  const publishedAt = published ? publishedAtInput ?? new Date() : null

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      locale,
      published,
      publishedAt,
      seoTitle,
      seoDescription,
      categoryId,
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
  })

  if (translationOfId) {
    await linkTranslation(post.id, translationOfId)
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin/blog')
}

export async function updateBlogPost(_prevState: ActionState, formData: FormData) {
  await requireRole('EDITOR')

  const id = asString(formData.get('id'))
  const title = asString(formData.get('title'))
  const rawSlug = asString(formData.get('slug')) || title
  const slug = normalizeSlug(rawSlug)
  const excerpt = asString(formData.get('excerpt'))
  const content = asString(formData.get('content'))
  const coverImage = asString(formData.get('coverImage'))
  const locale = (asString(formData.get('locale')) || 'fr') as BlogLocale
  const published = formData.get('published') === 'on'
  const publishedAtInput = parseDate(formData.get('publishedAt'))
  const seoTitle = asString(formData.get('seoTitle'))
  const seoDescription = asString(formData.get('seoDescription'))
  const categoryId = asString(formData.get('categoryId')) || null
  const tagIds = await resolveTagIds(asString(formData.get('tags')))
  const translationOfId = asString(formData.get('translationOfId'))

  if (!id || !title || !slug || !excerpt || !content || !seoTitle || !seoDescription) {
    return { error: 'Please fill in all required fields.' }
  }

  const current = await prisma.blogPost.findUnique({ where: { id } })
  if (!current) {
    return { error: 'Blog post not found.' }
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing && existing.id !== id) {
    return { error: 'Slug already exists. Please choose another.' }
  }

  const publishedAt = published ? publishedAtInput ?? current.publishedAt ?? new Date() : null

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      locale,
      published,
      publishedAt,
      seoTitle,
      seoDescription,
      categoryId,
      tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
    },
  })

  if (translationOfId) {
    await linkTranslation(post.id, translationOfId)
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin/blog')
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin()

  const id = asString(formData.get('id'))
  if (!id) return

  const post = await prisma.blogPost.delete({ where: { id } })
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin/blog')
}

export async function toggleBlogPostPublish(formData: FormData) {
  await requireAdmin()

  const id = asString(formData.get('id'))
  const value = asString(formData.get('published'))
  if (!id) return

  const published = value === 'true'
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      published,
      publishedAt: published ? new Date() : null,
    },
  })

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin/blog')
}
