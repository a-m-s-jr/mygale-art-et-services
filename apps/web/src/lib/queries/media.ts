import prisma from '@/lib/prisma'

/**
 * The admin upload route (/api/media/upload) returns a raw {key, url} pair,
 * not a Media row. This upserts a Media row for that S3 key so relational
 * fields (Service.heroImageId, etc.) can point at it.
 */
export async function attachUploadedMedia(
  input: { key: string; url: string; folder: string },
  uploadedById?: string,
) {
  return prisma.media.upsert({
    where: { key: input.key },
    update: { url: input.url },
    create: {
      key: input.key,
      url: input.url,
      folder: input.folder,
      uploadedById: uploadedById ?? null,
    },
  })
}
