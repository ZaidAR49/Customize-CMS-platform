import { z } from 'zod';

export const organizationStatSchema = z.object({
  key: z.string().min(1, 'Key is required').max(50, 'Key must be at most 50 characters'),
  label_ar: z.string().min(1, 'Arabic label is required').max(100, 'Label must be at most 100 characters'),
  value: z.string().min(1, 'Value is required').max(20, 'Value must be at most 20 characters'),
  icon: z.string().max(100).optional().nullable(),
  display_order: z.number().int().default(0),
  description_ar: z.string().optional().nullable(),
});

export type OrganizationStatInput = z.infer<typeof organizationStatSchema>;

export function zodErrorToFieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
