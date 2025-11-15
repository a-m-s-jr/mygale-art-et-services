import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit({
  submissionId,
  action,
  changedById,
  details,
}: {
  submissionId: string;
  action: string;
  changedById?: string | null;
  details?: Record<string, any> | null;
  }) {
  
  return prisma.auditLog.create({
    data: {
      contactSubmissionId: submissionId,
      action,
      changedById: changedById ?? null,
      meta: details ?? null,
    } as any,
  });
}
