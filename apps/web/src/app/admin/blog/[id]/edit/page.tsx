import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import BlogPostForm from '../../BlogPostForm'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
        <p className="text-sm text-neutral-400">Update content, SEO, and publishing settings.</p>
      </div>
      <BlogPostForm
        mode="edit"
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
        }}
      />
    </div>
  )
}
