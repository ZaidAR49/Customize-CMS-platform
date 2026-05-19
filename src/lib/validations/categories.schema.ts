import { z } from 'zod';

export const categorySchema = z.object({
  key: z.string().min(1, 'المفتاح مطلوب').max(50, 'المفتاح يجب ألا يتجاوز 50 حرف'),
  label_ar: z.string().min(1, 'الاسم بالعربية مطلوب').max(100, 'الاسم يجب ألا يتجاوز 100 حرف'),
  display_order: z.number().int().default(0),
  description_ar: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

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
