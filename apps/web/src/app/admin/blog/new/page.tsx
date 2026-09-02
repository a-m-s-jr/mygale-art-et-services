import prisma from '@/lib/prisma'
import { getAdminT } from '@/lib/getLocale'
import BlogPostForm from '../BlogPostForm'

export default async function NewBlogPostPage() {
  const [categories, translationOptions, adminT] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, locale: true },
      take: 100,
    }),
    getAdminT(),
  ])
  const t = adminT.blog

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.createTitle}</h1>
        <p className="text-sm text-neutral-400">{t.createSubtitle}</p>
      </div>
      <BlogPostForm mode="create" categories={categories} translationOptions={translationOptions} />
    </div>
  )
}
