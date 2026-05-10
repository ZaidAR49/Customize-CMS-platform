'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { usersService } from '@/lib/services/users.service';
import { updateUserRoleSchema } from '@/lib/validations/users.schema';
import { revalidatePath } from 'next/cache';

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    const parsed = updateUserRoleSchema.safeParse({ userId, role });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const user = await usersService.updateUserRole(userId, role);
    revalidatePath('/dashboard/users');
    
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user role' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    await usersService.deleteUser(userId);
    revalidatePath('/dashboard/users');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user' };
  }
}
