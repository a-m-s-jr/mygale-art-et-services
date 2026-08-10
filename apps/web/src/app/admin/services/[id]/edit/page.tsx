import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ServiceForm from '../../ServiceForm'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      heroImage: { select: { url: true } },
      sections: {
        orderBy: { order: 'asc' },
        include: { media: { select: { url: true } } },
      },
    },
  })

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Service</h1>
        <p className="text-sm text-neutral-400">Update content, sections, and SEO.</p>
      </div>
      <ServiceForm
        mode="edit"
        initial={{
          id: service.id,
          slug: service.slug,
          titleFr: service.titleFr,
          titleEn: service.titleEn,
          summaryFr: service.summaryFr,
          summaryEn: service.summaryEn,
          heroImageUrl: service.heroImage?.url || '',
          seoTitleFr: service.seoTitleFr || '',
          seoTitleEn: service.seoTitleEn || '',
          seoDescriptionFr: service.seoDescriptionFr || '',
          seoDescriptionEn: service.seoDescriptionEn || '',
          order: service.order,
          featured: service.featured,
          published: service.published,
          sections: service.sections.map((s) => ({
            key: s.key,
            // Phase 1 admin only edits BULLET_LIST/RICHTEXT sections; IMAGE/VIDEO block
            // types are reserved for a future phase and won't occur in seeded data.
            type: (s.type === 'RICHTEXT' ? 'RICHTEXT' : 'BULLET_LIST') as 'BULLET_LIST' | 'RICHTEXT',
            titleFr: s.titleFr,
            titleEn: s.titleEn,
            itemsFr: s.itemsFr.join('\n'),
            itemsEn: s.itemsEn.join('\n'),
            bodyFr: s.bodyFr || '',
            bodyEn: s.bodyEn || '',
            mediaKey: '',
            mediaUrl: s.media?.url || '',
          })),
        }}
      />
    </div>
  )
}
