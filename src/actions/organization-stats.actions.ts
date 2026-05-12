'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { organizationStatsService } from '@/lib/services/organization-stats.service';
import { organizationService } from '@/lib/services/organization.service';
import { organizationStatSchema, zodErrorToFieldErrors } from '@/lib/validations/organization-stats.schema';
import { revalidatePath } from 'next/cache';

export async function createOrganizationStatAction(data: unknown) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    await organizationStatsService.deleteStat(id);

    revalidatePath('/dashboard/statistics');
    revalidatePath('/');

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete organization stat';
    return { success: false, error: message };
  }
}
