import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import BlogPostForm from '../../BlogPostForm'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { tags: true },
  })

  if (!post) {
    notFound()
  }

  const [categories, translationCandidates] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.blogPost.findMany({
      where: { id: { not: id }, locale: post.locale === 'fr' ? 'en' : 'fr' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, locale: true },
      take: 100,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
        <p className="text-sm text-neutral-400">Update content, SEO, and publishing settings.</p>
      </div>
      <BlogPostForm
        mode="edit"
        categories={categories}
        translationOptions={translationCandidates}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content,
          coverImage: post.coverImage || '',
          locale: post.locale,
          published: post.published,
          publishedAt: post.publishedAt,
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          categoryId: post.categoryId || '',
          tags: post.tags.map((t) => t.nameFr).join(', '),
          translationOfId: '',
        }}
      />
    </div>
  )
}
