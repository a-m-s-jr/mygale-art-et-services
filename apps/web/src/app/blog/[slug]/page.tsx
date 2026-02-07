import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    })

    return posts.map((post) => ({ slug: post.slug }))
  } catch (error) {
    console.warn('Database not available during build, skipping static generation:', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
  })

  if (!post) {
    return {
      title: 'Blog | Mygale Art & Services',
      description: 'Mygale Art & Services blog post.',
    }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
  })

  if (!post) {
    notFound()
  }

  const dateLocale = post.locale === 'en' ? 'en-US' : 'fr-FR'

  return (
    <article className="bg-white text-black">
      {post.coverImage && (
        <div className="relative h-80 md:h-105 w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-4xl mx-auto px-4 pb-10 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                {post.publishedAt
                  ? new Intl.DateTimeFormat(dateLocale, { dateStyle: 'long' }).format(
                      post.publishedAt,
                    )
                  : ''}
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">
                {post.title}
              </h1>
              <p className="mt-4 text-white/85 max-w-3xl">{post.excerpt}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        <MarkdownRenderer content={post.content} />

        <div className="mt-12 border-t pt-6">
          <Link href={`/blog?lang=${post.locale}`} className="text-sm font-semibold text-[#003366]">
            {'<- Back to Blog'}
          </Link>
        </div>
      </div>
    </article>
  )
}
