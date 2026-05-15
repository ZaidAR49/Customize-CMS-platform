import { z } from 'zod';

export const createPostSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  category_id: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  excerpt: z.string().optional(),
  descripcion: z.string().optional(),
  cover_image: z.string().url('Invalid URL').optional().or(z.literal('')),
  type: z.enum(['news', 'activity', 'program', 'center'], {
    message: 'Invalid post type',
  }),
  published: z.boolean().default(false),
  published_at: z.string().datetime().optional().or(z.literal('')),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid('Invalid post ID'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
