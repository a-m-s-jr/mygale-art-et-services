import Link from 'next/link'
import prisma from '@/lib/prisma'
import MediaUploadWidget from './MediaUploadWidget'
import { deleteMediaItem, restoreMediaItem } from './actions'

function formatSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; folder?: string; q?: string }>
}) {
  const { tab, folder, q } = await searchParams
  const showTrash = tab === 'trash'

  const items = await prisma.media.findMany({
    where: {
      deletedAt: showTrash ? { not: null } : null,
      ...(folder ? { folder: { startsWith: folder } } : {}),
      ...(q
        ? {
            OR: [
              { key: { contains: q, mode: 'insensitive' } },
              { altFr: { contains: q, mode: 'insensitive' } },
              { altEn: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
  })

  const folders = await prisma.media.groupBy({
    by: ['folder'],
    where: { deletedAt: null },
    _count: true,
    orderBy: { folder: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="text-sm text-neutral-400">
          All images uploaded across the site, backed by your S3/CloudFront storage.
        </p>
      </div>

      <MediaUploadWidget />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/media"
            className={`rounded px-3 py-1 ${!folder && !showTrash ? 'bg-neutral-800' : 'border border-neutral-800'}`}
          >
            All
          </Link>
          {folders.map((f) => (
            <Link
              key={f.folder}
              href={`/admin/media?folder=${encodeURIComponent(f.folder)}`}
              className={`rounded px-3 py-1 ${folder === f.folder ? 'bg-neutral-800' : 'border border-neutral-800'}`}
            >
              {f.folder} ({f._count})
            </Link>
          ))}
          <Link
            href="/admin/media?tab=trash"
            className={`rounded px-3 py-1 ${showTrash ? 'bg-neutral-800' : 'border border-neutral-800'}`}
          >
            Trash
          </Link>
        </div>

        <form className="flex items-center gap-2" action="/admin/media" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name or alt text..."
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
          />
          <button type="submit" className="rounded border border-neutral-700 px-3 py-1.5 text-xs">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-neutral-800 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl || item.url}
              alt={item.altFr || item.key}
              className="h-28 w-full rounded object-cover"
            />
            <div className="mt-2 truncate text-xs text-neutral-400" title={item.key}>
              {item.key}
            </div>
            <div className="text-[10px] text-neutral-500">
              {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
              {formatSize(item.size)}
            </div>
            <div className="mt-2">
              {showTrash ? (
                <form action={restoreMediaItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="w-full rounded border border-neutral-700 px-2 py-1 text-xs">
                    Restore
                  </button>
                </form>
              ) : (
                <form action={deleteMediaItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="w-full rounded border border-red-500/60 px-2 py-1 text-xs text-red-200"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          {showTrash ? 'Trash is empty.' : 'No media found.'}
        </p>
      ) : null}
    </div>
  )
}
