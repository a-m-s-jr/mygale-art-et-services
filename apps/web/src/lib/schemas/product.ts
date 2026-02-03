import { z } from 'zod'
import { ProductType } from '@prisma/client'

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  price: z.number().min(0, 'Price must be positive').optional().nullable(),
  type: z.enum([ProductType.PRODUCT, ProductType.SERVICE], {
    message: 'Type is required',
  }),
  images: z.array(z.string().url('Must be a valid URL')).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
