import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ContactSubmission, SubmissionStatus } from '@prisma/client';
import { Subject, ReplaySubject } from 'rxjs';

export type ContactEvent =
  | { type: 'created'; payload: any }
  | { type: 'updated'; payload: any }
  | { type: 'status_changed'; payload: any };

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  // SSE/RxJS subject
  private events$ = new ReplaySubject<ContactEvent>(10);

  getEventsSubject() {
    return this.events$;
  }

  async createContact(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    source?: string;
  }): Promise<ContactSubmission> {
    const created = await this.prisma.contactSubmission.create({ data });
    // emit created
    this.events$.next({ type: 'created', payload: created });
    return created;
  }

  async listContacts(): Promise<ContactSubmission[]> {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContactById(id: string) {
    return this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        replies: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          include: { actor: true },
        },
      },
    });
  }

  async getContactWithHistory(id: string) {
    const contact = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return contact;
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
    assignedToId?: string,
    changedById?: string,
  ) {
    const prev = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!prev) throw new Error('Not found');

    const updated = await this.prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        ...(assignedToId
          ? { assignedTo: { connect: { id: assignedToId } } }
          : { assignedTo: { disconnect: true } }),
      },
    });

    // create audit log with schema that matches your prisma
    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: id,
        action: 'status_changed',
        createdAt: new Date(),
        meta: { from: prev.status, to: status },
        // actor id field name may vary in your schema: use changedById or actorId depending on your model
        // if your schema has 'changedById':
        changedById: changedById ?? null,
      } as any,
    });

    this.events$.next({ type: 'status_changed', payload: { id, status } });
    this.events$.next({ type: 'updated', payload: updated });

    return updated;
  }

  async addReplyLog(id: string, replyData: any, assignedToId?: string) {
    await this.prisma.reply.create({
      data: {
        submissionId: id,
        ...replyData,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: id,
        action: 'reply_added',
        meta: replyData,
        createdAt: new Date(),
      } as any,
    });

    const updated = await this.getContactById(id);
    this.events$.next({ type: 'updated', payload: updated });
    return updated;
  }

  async deleteContact(id: string) {
    const deleted = await this.prisma.contactSubmission.delete({
      where: { id },
    });
    this.events$.next({ type: 'updated', payload: deleted });
    return deleted;
  }
}
