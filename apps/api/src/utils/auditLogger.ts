import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function logAudit({
  submissionId,
  action,
  changedById,
  details,
}: {
  submissionId: string
  action: string
  changedById?: string | null
  details?: Record<string, any>
}) {
  return prisma.auditLog.create({
    data: { submissionId, action, changedById, details },
  })
}
