'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { usersService } from '@/lib/services/users.service';
import { updateUserRoleSchema } from '@/lib/validations/users.schema';
import { revalidatePath } from 'next/cache';
import type { AppUser as User } from '@/types/user';
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

export async function getUserByEmailAction(email: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized access. Admins only.' };
  }

  try {
    const user = await usersService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get user' };
  }
}
export async function getAllUsersAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    const users = await usersService.getAllUsers();
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get users' };
  }
}
export async function createUserAction(user: User) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access. Admins only.' };
    }

    const createdUser = await usersService.createUser(user);
    revalidatePath('/dashboard/users');

    return { success: true, data: createdUser };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create user' };
  }
}