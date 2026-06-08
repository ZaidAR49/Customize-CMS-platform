'use server';

import { requireAdmin } from '@/lib/auth';
import { categoriesService } from '@/lib/services/categories.service';
import { categorySchema, zodErrorToFieldErrors } from '@/lib/validations/categories.schema';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createCategoryAction(data: unknown) {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const category = await categoriesService.createCategory(parsed.data);

    revalidateTag('categories', 'max');
    revalidatePath('/dashboard/categories');
    revalidatePath('/');

    return { success: true, data: category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل في إنشاء التصنيف';
    return { success: false, error: message };
  }
}

export async function updateCategoryAction(id: string, data: unknown) {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const category = await categoriesService.updateCategory(id, parsed.data);

    revalidateTag('categories', 'max');
    revalidatePath('/dashboard/categories');
    revalidatePath('/');

    return { success: true, data: category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل في تحديث التصنيف';
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdmin();

    await categoriesService.deleteCategory(id);

    revalidateTag('categories', 'max');
    revalidatePath('/dashboard/categories');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'فشل في حذف التصنيف';
    return { success: false, error: message };
  }
}
