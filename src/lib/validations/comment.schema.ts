import { z } from 'zod'

export const createCommentSchema = z.object({
  post_id: z.string().uuid('معرّف المقال غير صالح'),
  author_name: z.string().min(1, 'الاسم مطلوب').max(200),
  author_email: z.union([z.literal(''), z.string().email('بريد غير صالح')]).optional(),
  body: z.string().min(1, 'نص التعليق مطلوب').max(8000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const moderateCommentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
})
