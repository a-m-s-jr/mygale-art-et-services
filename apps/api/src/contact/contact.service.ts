import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ContactSubmission, SubmissionStatus } from '@prisma/client';
import { logAudit } from '../utils/auditLogger';

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
    const created = await this.prisma.contactSubmission.create({ data });
    await logAudit({
      submissionId: created.id,
      action: 'Submission created',
      details: { source: data.source ?? 'unknown' },
    });
    return created;
  }

  async listContacts(): Promise<ContactSubmission[]> {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContactById(id: string): Promise<ContactSubmission | null> {
    return this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        replies: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: true },
        },
      },
    });
  }

  async getContactWithHistory(
    id: string,
  ): Promise<ContactSubmission & { auditLogs: any[] }> {
    const contactWithHistory = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contactWithHistory) {
      throw new Error('Contact submission not found');
    }

    return contactWithHistory;
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
    assignedToId?: string,
    changedById?: string,
  ): Promise<ContactSubmission> {
    const updated = await this.prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        ...(assignedToId
          ? { assignedTo: { connect: { id: assignedToId } } }
          : { assignedTo: { disconnect: true } }),
      },
    });

    await logAudit({
      submissionId: id,
      action: `Status changed to ${status}`,
      changedById,
    });

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
