import { z } from 'zod';

export const CreateContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(1),
  source: z.string().optional().nullable(),
});

export const ReplySchema = z.object({
  body: z.string().min(1, 'Body is required').max(20000),
  channel: z.enum(['email', 'phone', 'whatsapp', 'note']).default('email'),
  subject: z.string().optional(),
});

export type ReplyDto = z.infer<typeof ReplySchema>;

export const DraftSchema = z.object({
  draft: z.string().nullable().optional(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['new', 'in_review', 'responded', 'closed']),
  assignedToId: z.string().optional().nullable(),
});
