'use server';

import { requireAdmin } from '@/lib/auth';
import { organizationStatsService } from '@/lib/services/organization-stats.service';
import { organizationService } from '@/lib/services/organization.service';
import { organizationStatSchema, zodErrorToFieldErrors } from '@/lib/validations/organization-stats.schema';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createOrganizationStatAction(data: unknown) {
  try {
    const session = await requireAdmin();

    const parsed = organizationStatSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid data',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const org = await organizationService.getOrganization();
    if (!org) {
      return { success: false, error: 'Organization not found. Please setup the organization settings first.' };
    }

    const payload = {
      ...parsed.data,
      organization_id: org.id,
      updated_by: session.user.id,
    };

    const stat = await organizationStatsService.createStat(payload);

    revalidateTag('organization_stats', 'max');
    revalidatePath('/dashboard/statistics');
    revalidatePath('/');

    return { success: true, data: stat };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create organization stat';
    return { success: false, error: message };
  }
}

export async function updateOrganizationStatAction(id: string, data: unknown) {
  try {
    const session = await requireAdmin();

    const parsed = organizationStatSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid data',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const payload = {
      ...parsed.data,
      updated_by: session.user.id,
    };

    const stat = await organizationStatsService.updateStat(id, payload);

    revalidateTag('organization_stats', 'max');
    revalidatePath('/dashboard/statistics');
    revalidatePath('/');

    return { success: true, data: stat };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update organization stat';
    return { success: false, error: message };
  }
}

export async function deleteOrganizationStatAction(id: string) {
  try {
    await requireAdmin();

    await organizationStatsService.deleteStat(id);

    revalidateTag('organization_stats', 'max');
    revalidatePath('/dashboard/statistics');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete organization stat';
    return { success: false, error: message };
  }
}
