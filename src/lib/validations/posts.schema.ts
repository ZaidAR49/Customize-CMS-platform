import { z } from 'zod';

export const createPostSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  slug_en: z.string().optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required'),
  title_en: z.string().optional().or(z.literal('')),
  category_id: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  excerpt: z.string().optional(),
  excerpt_en: z.string().optional().or(z.literal('')),
  descripcion: z.string().optional(),
  descripcion_en: z.string().optional().or(z.literal('')),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  gallery: z.array(z.string()).max(20, 'لا يمكن إضافة أكثر من 20 صورة').optional(),
  type: z.enum(['news', 'activity', 'program', 'center'], {
    message: 'Invalid post type',
  }),
  published: z.boolean().default(false),
  published_at: z.string().datetime().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid('Invalid post ID'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
