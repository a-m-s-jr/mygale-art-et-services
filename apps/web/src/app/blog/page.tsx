import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

const PAGE_SIZE = 6
export const revalidate = 300

function getLocale(lang?: string) {
  return lang === 'en' ? 'en' : 'fr'
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const locale = getLocale(params?.lang)
  const title = locale === 'fr' ? 'Blog | Mygale Art & Services' : 'Blog | Mygale Art & Services'
  const description =
    locale === 'fr'
      ? 'Actualités, projets et conseils par Mygale Art & Services.'
      : 'News, projects, and insights from Mygale Art & Services.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; lang?: string }>
}) {
  const params = await searchParams
  const locale = getLocale(params?.lang)
  const page = Math.max(1, Number(params?.page ?? '1') || 1)

  const total = await prisma.blogPost.count({ where: { published: true, locale } })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const posts = await prisma.blogPost.findMany({
    where: { published: true, locale },
    orderBy: [{ createdAt: 'desc' }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return (
    <div className="bg-white text-black">
      <section className="border-b bg-[#F4F6F8]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-[#003366]">Blog</h1>
              <p className="mt-2 text-gray-600">
                {locale === 'fr'
                  ? 'Nouvelles, projets et conseils de notre studio.'
                  : 'News, projects, and insights from our studio.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/blog?lang=fr&page=1`}
                className={`px-3 py-1 rounded border transition-colors ${
                  locale === 'fr'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'hover:border-[#003366]'
                }`}
              >
                FR
              </Link>
              <Link
                href={`/blog?lang=en&page=1`}
                className={`px-3 py-1 rounded border transition-colors ${
                  locale === 'en'
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'hover:border-[#003366]'
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-gray-500">
            {locale === 'fr' ? 'Aucun article publié pour le moment.' : 'No published posts yet.'}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage && (
                    <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      {post.publishedAt
                        ? new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
                            dateStyle: 'medium',
                          }).format(post.publishedAt)
                        : ''}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-[#003366]">{post.title}</h2>
                    <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#003366]">
                      {locale === 'fr' ? 'Lire la suite' : 'Read more'}
                      <span className="ml-2">{'->'}</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-between text-sm">
            <Link
              href={`/blog?lang=${locale}&page=${Math.max(1, currentPage - 1)}`}
              className={`px-4 py-2 rounded border ${
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {locale === 'fr' ? 'Précédent' : 'Previous'}
            </Link>
            <div className="text-gray-500">
              {locale === 'fr' ? 'Page' : 'Page'} {currentPage} / {totalPages}
            </div>
            <Link
              href={`/blog?lang=${locale}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-4 py-2 rounded border ${
                currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {locale === 'fr' ? 'Suivant' : 'Next'}
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  )
}
