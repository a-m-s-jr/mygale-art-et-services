import prisma from '@/lib/prisma'
import type { Prisma, RevisionAction } from '@prisma/client'

/** Entity types that write Revision snapshots. Full restore UI currently only exists for Service. */
export type RevisionEntityType =
  | 'Service'
  | 'HomepageSection'
  | 'SiteSettings'
  | 'NavigationItem'
  | 'SocialLink'
  | 'AboutPage'

export async function writeRevision(
  entityType: RevisionEntityType,
  entityId: string,
  action: RevisionAction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
  createdById?: string,
) {
  await prisma.revision.create({
    data: {
      entityType,
      entityId,
      action,
      snapshot,
      createdById: createdById ?? null,
    },
  })
}

export async function writeAuditLog(
  action: string,
  meta: Record<string, unknown>,
  actorId?: string,
) {
  await prisma.auditLog.create({
    data: {
      action,
      meta: meta as Prisma.InputJsonValue,
      actorId: actorId ?? null,
    },
  })
}
