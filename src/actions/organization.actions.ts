'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { organizationService } from '@/lib/services/organization.service';
import { updateOrganizationSchema } from '@/lib/validations/organization.schema';
import { revalidatePath } from 'next/cache';

export async function updateOrganizationAction(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    const parsed = updateOrganizationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const org = await organizationService.updateOrganization(id, parsed.data);
    
    revalidatePath('/dashboard/settings');
    revalidatePath('/');
    
    return { success: true, data: org };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update organization details' };
  }
}
