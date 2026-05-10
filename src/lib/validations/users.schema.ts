import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Invalid role',
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
