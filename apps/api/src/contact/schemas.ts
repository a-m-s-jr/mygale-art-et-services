// apps/api/src/contact/schemas.ts
import { z } from 'zod';

export const CreateContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(1),
  source: z.string().optional().nullable(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['new', 'in_review', 'responded', 'closed']),
  assignedToId: z.string().optional().nullable(),
});
