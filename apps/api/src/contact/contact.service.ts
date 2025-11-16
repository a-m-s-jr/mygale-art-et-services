// apps/api/src/contact/contact.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ContactSubmission, SubmissionStatus } from '@prisma/client';
import { Subject, ReplaySubject } from 'rxjs';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ReplyDto } from './schemas';

export type ContactEvent =
  | { type: 'created'; payload: any }
  | { type: 'updated'; payload: any }
  | { type: 'status_changed'; payload: any }
  | { type: 'reply_added'; payload: any };

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  // in-memory event bus for realtime (Gateway will subscribe)
  private events$ = new ReplaySubject<ContactEvent>(10);

  getEventsSubject() {
    return this.events$;
  }

  // Create a contact submission
  async createContact(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    source?: string;
  }): Promise<ContactSubmission> {
    const created = await this.prisma.contactSubmission.create({ data });
    // create lightweight audit log
    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: created.id,
        actorId: null,
        action: 'submission_created',
        meta: { source: data.source ?? 'unknown' },
      },
    });
    this.events$.next({ type: 'created', payload: created });
    return created;
  }

  async listContacts(): Promise<ContactSubmission[]> {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContactById(id: string) {
    const found = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        replies: { orderBy: { sentAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    return found;
  }

  async findByIdWithHistory(id: string) {
    return this.getContactById(id);
  }

  // Admin-only status update
  async updateStatus(
    id: string,
    status: SubmissionStatus,
    assignedToId?: string,
    actorId?: string,
  ) {
    const prev = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!prev) throw new NotFoundException('Contact not found');

    const updated = await this.prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        ...(assignedToId
          ? { assignedTo: { connect: { id: assignedToId } } }
          : assignedToId === null
            ? { assignedTo: { disconnect: true } }
            : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: id,
        actorId: actorId ?? null,
        action: 'status_changed',
        meta: { from: prev.status, to: status },
      },
    });

    this.events$.next({ type: 'status_changed', payload: { id, status } });
    this.events$.next({ type: 'updated', payload: updated });

    return updated;
  }

  // add a reply record (basic)
  async addReplyLog(id: string, replyData: any, assignedToId?: string) {
    await this.prisma.reply.create({
      data: {
        submissionId: id,
        body: replyData.body,
        channel: replyData.channel ?? 'note',
        meta: replyData.meta ?? undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: id,
        actorId: assignedToId ?? null,
        action: 'reply_added',
        meta: replyData,
      },
    });

    const updated = await this.getContactById(id);
    this.events$.next({ type: 'reply_added', payload: { id, replyData } });
    this.events$.next({ type: 'updated', payload: updated });
    return updated;
  }

  // -----------------------
  // NEW: sendReply & draft save
  // -----------------------

  private createTransport(): Transporter {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      // dev-friendly: stream transport (prints to console)
      return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private stripHtml(html: string) {
    return html.replace(/<[^>]+>/g, '');
  }

  /**
   * Persist a reply and send email if channel === 'email'
   */
  async sendReply(submissionId: string, payload: ReplyDto, actorId?: string) {
    // ensure submission exists
    const submission = await this.prisma.contactSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    // create reply row
    const reply = await this.prisma.reply.create({
      data: {
        submissionId,
        body: payload.body,
        channel: payload.channel,
        meta: payload.subject ? { subject: payload.subject } : undefined,
      },
    });

    // audit log for reply
    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: submissionId,
        actorId: actorId ?? null,
        action: 'reply_added',
        meta: { channel: payload.channel, subject: payload.subject ?? null },
      },
    });

    // if email, attempt to send
    if (payload.channel === 'email') {
      const transport = this.createTransport();
      const mailOptions: any = {
        from:
          process.env.EMAIL_FROM ??
          `no-reply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '')}`,
        to: submission.email,
        subject:
          payload.subject ??
          `Reply from ${process.env.NEXTAUTH_URL ?? 'Support'}`,
        html: payload.body,
        text: this.stripHtml(payload.body),
      };

      try {
        const info = await transport.sendMail(mailOptions);
        await this.prisma.auditLog.create({
          data: {
            contactSubmissionId: submissionId,
            actorId: actorId ?? null,
            action: 'email_sent',
            meta: {
              envelope: (info as any).envelope ?? null,
              response: (info as any).response ?? null,
            },
          },
        });
      } catch (err) {
        // log failure as audit and rethrow
        await this.prisma.auditLog.create({
          data: {
            contactSubmissionId: submissionId,
            actorId: actorId ?? null,
            action: 'email_send_failed',
            meta: { message: (err as any)?.message ?? String(err) },
          },
        });
        throw err;
      }
    }

    const updated = await this.getContactById(submissionId);
    this.events$.next({ type: 'reply_added', payload: reply });
    this.events$.next({ type: 'updated', payload: updated });
    return { reply, updated };
  }

  // Save a lightweight draft as an audit log entry (no schema change)
  async saveDraft(
    submissionId: string,
    draft: string | null,
    actorId?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        contactSubmissionId: submissionId,
        actorId: actorId ?? null,
        action: 'draft_saved',
        meta: { draft },
      },
    });
    return { ok: true };
  }

  async getLatestDraft(submissionId: string) {
    const draft = await this.prisma.auditLog.findFirst({
      where: { contactSubmissionId: submissionId, action: 'draft_saved' },
      orderBy: { createdAt: 'desc' },
    });
    return draft?.meta ?? null;
  }
}
