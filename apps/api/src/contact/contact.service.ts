import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ContactSubmission, SubmissionStatus } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    source?: string;
  }): Promise<ContactSubmission> {
    return this.prisma.contactSubmission.create({ data });
  }

  async listContacts(): Promise<ContactSubmission[]> {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: true },
    });
  }

  async getContactById(id: string): Promise<ContactSubmission | null> {
    return this.prisma.contactSubmission.findUnique({
      where: { id },
      include: { assignedTo: true },
    });
  }

  // New: fetch submission + audit history
  async getContactWithHistory(
    id: string,
  ): Promise<ContactSubmission & { auditLogs: any[] }> {
    const submission = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          include: { assignedTo: true },
        },
      },
    });

    if (!submission) {
      throw new Error(`Submission ${id} not found`);
    }

    return submission as unknown as ContactSubmission & { auditLogs: any[] };
  }

  /**
   * Update a submission’s status or assignment.
   * Automatically record a history entry in AuditLog.
   */
  async updateStatus(
    id: string,
    status: SubmissionStatus,
    assignedToId?: string,
  ): Promise<ContactSubmission> {
    const [updated] = await this.prisma.$transaction([
      this.prisma.contactSubmission.update({
        where: { id },
        data: {
          status,
          ...(assignedToId
            ? { assignedTo: { connect: { id: assignedToId } } }
            : { assignedTo: { disconnect: true } }),
        },
      }),
      this.prisma.auditLogs.create({
        data: {
          submissionId: id,
          action: 'STATUS_CHANGE',
          newStatus: status,
          assignedToId: assignedToId ?? null,
        },
      }),
    ]);

    return updated;
  }

  async deleteContact(id: string): Promise<ContactSubmission> {
    const deleted: ContactSubmission =
      await this.prisma.contactSubmission.delete({
        where: { id },
      });
    return deleted;
  }
}
