import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(200, 'الاسم طويل جداً'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserProfileSchema = z.object({
  userId: z.string().uuid('معرّف المستخدم غير صالح'),
  name: z.string().min(1, 'الاسم مطلوب').max(200, 'الاسم طويل جداً'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صالح'),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
