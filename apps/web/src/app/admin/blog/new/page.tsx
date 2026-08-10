import prisma from '@/lib/prisma'
import BlogPostForm from '../BlogPostForm'

export default async function NewBlogPostPage() {
  const [categories, translationOptions] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, locale: true },
      take: 100,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Blog Post</h1>
        <p className="text-sm text-neutral-400">Draft a new post and publish when ready.</p>
      </div>
      <BlogPostForm mode="create" categories={categories} translationOptions={translationOptions} />
    </div>
  )
}
