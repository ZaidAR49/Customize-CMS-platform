'use server';

import { requireAdmin } from '@/lib/auth';
import { organizationService } from '@/lib/services/organization.service';
import {
  updateOrganizationSchema,
  zodErrorToFieldErrors,
  type UpdateOrganizationInput,
} from '@/lib/validations/organization.schema';
import { SOCIAL_PLATFORM_KEYS } from '@/types/organization';
import { revalidatePath } from 'next/cache';

function normalizeSocial(s: UpdateOrganizationInput['social']) {
  const out: Record<string, string> = {};
  if (!s) return out;
  for (const key of SOCIAL_PLATFORM_KEYS) {
    const v = s[key];
    if (typeof v === 'string' && v.trim() !== '') out[key] = v.trim();
  }
  return out;
}

function normalizeMetadata(m: UpdateOrganizationInput['metadata']) {
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const [k, v] of Object.entries(m)) {
    const key = k.trim();
    if (!key || v.trim() === '') continue;
    out[key] = v.trim();
  }
  return out;
}

function toDbPayload(parsed: UpdateOrganizationInput, userId: string) {
  const { social, metadata, ...rest } = parsed;
  return {
    ...rest,
    social: normalizeSocial(social),
    metadata: normalizeMetadata(metadata),
    updated_by: userId,
  };
}

export async function updateOrganizationAction(id: string, data: unknown) {
  try {
    const session = await requireAdmin();

    const parsed = updateOrganizationSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid data',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const org = await organizationService.updateOrganization(id, toDbPayload(parsed.data, session.user.id));

    revalidatePath('/dashboard/settings');
    revalidatePath('/');

    return { success: true, data: org };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update organization details';
    return { success: false, error: message };
  }
}

export async function createOrganizationAction(data: unknown) {
  try {
    const session = await requireAdmin();

    const parsed = updateOrganizationSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid data',
        fieldErrors: zodErrorToFieldErrors(parsed.error),
      };
    }

    const org = await organizationService.createOrganization(toDbPayload(parsed.data, session.user.id));

    revalidatePath('/dashboard/settings');
    revalidatePath('/');

    return { success: true, data: org };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create organization';
    return { success: false, error: message };
  }
}
