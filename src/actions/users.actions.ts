'use server';

import { requireAdmin } from '@/lib/auth';
import { usersService } from '@/lib/services/users.service';
import { createUserSchema, updateUserProfileSchema } from '@/lib/validations/users.schema';
import { revalidatePath } from 'next/cache';
import { uploadImage } from '@/actions/cloudinary.actions';

const AVATAR_MAX_BYTES = 4 * 1024 * 1024;

/** Server Actions may supply a binary body that is not `instanceof File` across JS realms. */
function isNonEmptyFormDataBinary(value: unknown): value is Blob {
  if (value == null || typeof value !== 'object') return false;
  const b = value as Blob;
  return typeof b.arrayBuffer === 'function' && typeof b.size === 'number' && b.size > 0;
}

type AvatarUploadResult =
  | { ok: true; url?: string }
  | { ok: false; error: string };

async function uploadAvatarFromFormField(raw: FormDataEntryValue | null): Promise<AvatarUploadResult> {
  if (!isNonEmptyFormDataBinary(raw)) {
    return { ok: true };
  }
  const declared = raw.type?.trim() ?? '';
  if (declared && !declared.startsWith('image/')) {
    return { ok: false, error: 'The uploaded file must be an image.' };
  }
  if (raw.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: 'Image size must not exceed 4 MB.' };
  }
  const buf = Buffer.from(await raw.arrayBuffer());
  const mime = declared || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
  const url = await uploadImage(dataUrl, 'avatars');
  return { ok: true, url };
}

export async function updateUserProfileAction(formData: FormData) {
  try {
    const session = await requireAdmin();

    const userId = String(formData.get('userId') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const role = String(formData.get('role') ?? '').trim();

    const parsed = updateUserProfileSchema.safeParse({ userId, name, email, role });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await usersService.getUserById(parsed.data.userId);
    if (!existing) {
      return { success: false, error: 'User not found.' };
    }

    const isSelf = parsed.data.userId === session.user.id;
    if (
      isSelf &&
      existing.role === 'admin' &&
      parsed.data.role !== 'admin'
    ) {
      const allUsers = await usersService.getAllUsers();
      const adminCount = allUsers.filter((u) => u.role === 'admin').length;
      if (adminCount < 2) {
        return {
          success: false,
          error:
            'You cannot change your role as long as you are the only admin. Assign another admin first, then you can change your role.',
        };
      }
    }

    const emailLower = parsed.data.email.trim().toLowerCase();
    const other = await usersService.findOtherUserWithEmail(parsed.data.userId, emailLower);
    if (other) {
      return { success: false, error: 'This email is already registered to another user.' };
    }

    const avatarRes = await uploadAvatarFromFormField(formData.get('avatar'));
    if (!avatarRes.ok) {
      return { success: false, error: avatarRes.error };
    }
    const nextAvatarUrl = avatarRes.url;

    const patch: {
      name: string;
      email: string;
      role: string;
      avatar_url?: string;
    } = {
      name: parsed.data.name,
      email: emailLower,
      role: parsed.data.role,
    };
    if (nextAvatarUrl) {
      patch.avatar_url = nextAvatarUrl;
    }

    const user = await usersService.updateUser(parsed.data.userId, patch);
    revalidatePath('/dashboard/users');

    return { success: true as const, data: user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    console.log("update user", error);
    return { success: false as const, error: message };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await requireAdmin();

    const isSelf = userId === session.user.id;

    if (isSelf) {
      const allUsers = await usersService.getAllUsers();
      const adminCount = allUsers.filter((u) => u.role === 'admin').length;
      if (adminCount < 2) {
        return {
          success: false as const,
          error:
            'You cannot delete your account as long as you are the only admin. You must have another admin in the system before deleting your account.',
        };
      }
    }

    await usersService.deleteUser(userId);
    revalidatePath('/dashboard/users');

    return { success: true as const, deletedSelf: isSelf };
  } catch (error: any) {
    return { success: false as const, error: error.message || 'Failed to delete user' };
  }
}

export async function getUserByEmailAction(email: string) {
  try {
    await requireAdmin();
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
    await requireAdmin();

    const users = await usersService.getAllUsers();
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get users' };
  }
}
export async function createUserAction(formData: FormData) {
  try {
    const session = await requireAdmin();

    const name = String(formData.get('name') ?? '').trim();
    const emailRaw = String(formData.get('email') ?? '').trim();
    const role = String(formData.get('role') ?? '').trim();

    const parsed = createUserSchema.safeParse({ name, email: emailRaw, role });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const avatarRes = await uploadAvatarFromFormField(formData.get('avatar'));
    if (!avatarRes.ok) {
      return { success: false, error: avatarRes.error };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await usersService.getUserByEmail(email);
    if (existing) {
      return { success: false, error: 'This email is already registered.' };
    }

    const createdUser = await usersService.createUser({
      name: parsed.data.name.trim(),
      email,
      role: parsed.data.role,
      avatarUrl: avatarRes.url ?? null,
    });

    revalidatePath('/dashboard/users');

    return { success: true, data: createdUser };
  } catch (error: any) {
    const msg = String(error?.message ?? 'Failed to create user');
    if (msg.includes('duplicate') || msg.includes('unique') || error?.code === '23505') {
      return { success: false, error: 'This email is already registered.' };
    }
    return { success: false, error: msg };
  }
}