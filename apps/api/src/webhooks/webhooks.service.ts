import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a webhook attempt record and immediately attempt delivery.
   * This returns the created attempt record.
   */
  async createAndSend(webhookUrl: string, payload: any) {
    const created = await this.prisma.webhookAttempt.create({
      data: {
        webhookUrl,
        payload,
        status: 'pending',
        attempt: 0,
        maxAttempts: 5,
      },
    });

    // fire-and-forget attempt (do not block caller)
    void this.tryDeliver(created.id);

    return created;
  }

  /** List attempts (admin) */
  async listAttempts({
    page = 1,
    pageSize = 25,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    const take = Math.min(200, pageSize);
    const skip = Math.max(0, (page - 1) * take);
    const [items, total] = await Promise.all([
      this.prisma.webhookAttempt.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.webhookAttempt.count(),
    ]);
    return { items, total, page, pageSize: take };
  }

  /** Manual retry an attempt by id */
  async retryAttempt(id: string) {
    const attempt = await this.prisma.webhookAttempt.findUnique({
      where: { id },
    });
    if (!attempt) throw new Error('Attempt not found');
    // reset counters so tryDeliver will re-attempt
    await this.prisma.webhookAttempt.update({
      where: { id },
      data: { status: 'pending', nextRetryAt: null },
    });
    void this.tryDeliver(id);
    return attempt;
  }

  /** Core delivery routine with exponential backoff */
  async tryDeliver(attemptId: string) {
    const attemptRecord = await this.prisma.webhookAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attemptRecord) return;
    // if already success or exhausted, stop
    if (attemptRecord.status === 'success') return;
    if (attemptRecord.attempt >= attemptRecord.maxAttempts) {
      await this.prisma.webhookAttempt.update({
        where: { id: attemptId },
        data: { status: 'failed', nextRetryAt: null },
      });
      return;
    }

    // attempt
    const nextAttemptNumber = attemptRecord.attempt + 1;
    try {
      this.logger.log(
        `Attempting webhook ${attemptRecord.webhookUrl} (#${nextAttemptNumber})`,
      );

      // Use global fetch (Node 18+). Timeout handled by platform/resilient infra in prod.
      const res = await fetch(attemptRecord.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptRecord.payload),
      });
      const text = await res.text().catch(() => '');

      if (res.ok) {
        await this.prisma.webhookAttempt.update({
          where: { id: attemptId },
          data: {
            attempt: nextAttemptNumber,
            status: 'success',
            response: text.substring(0, 2000),
            nextRetryAt: null,
          },
        });
        this.logger.log(`Webhook delivered: ${attemptId}`);
        return;
      } else {
        // failed -> update and schedule retry
        await this.handleFailure(attemptId, nextAttemptNumber, text);
      }
    } catch (err: any) {
      await this.handleFailure(
        attemptId,
        nextAttemptNumber,
        err?.message ?? String(err),
      );
    }
  }

  private async handleFailure(
    attemptId: string,
    attemptNum: number,
    responseText: string,
  ) {
    // exponential backoff: 2^attemptNum * 1000ms, capped
    const delayMs = Math.min(1000 * Math.pow(2, attemptNum), 1000 * 60 * 10); // cap 10m
    const nextRetry = new Date(Date.now() + delayMs);

    await this.prisma.webhookAttempt.update({
      where: { id: attemptId },
      data: {
        attempt: attemptNum,
        status: 'pending',
        response: (responseText ?? '').substring(0, 2000),
        nextRetryAt: nextRetry,
      },
    });

    // schedule next try (background)
    setTimeout(() => void this.tryDeliver(attemptId), delayMs);
  }
}
