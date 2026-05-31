import supabase from '@/lib/supabase';
import type { AppUser as User } from '@/types/user';

/** Escape `%` and `_` so `.ilike()` matches the full string literally. */
function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function mapUserRow(row: Record<string, unknown>): User {
  const created = row.created_at;
  const createdAt =
    typeof created === 'string'
      ? created
      : created instanceof Date
        ? created.toISOString()
        : String(created ?? '');

  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    avatarUrl: (() => {
      const raw = row.avatar_url
      if (raw == null) return undefined
      const s = String(raw).trim()
      return s.length > 0 ? s : undefined
    })(),
    role: row.role as User['role'],
    createdAt,
  };
}

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row: any) => mapUserRow(row as Record<string, unknown>));
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapUserRow(data as Record<string, unknown>) : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const trimmed = email.trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', escapeIlikeExact(trimmed))
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapUserRow(data as Record<string, unknown>) : null;
  },

  /** Another user (not `excludeUserId`) already has this email (case-insensitive). */
  async findOtherUserWithEmail(excludeUserId: string, email: string): Promise<User | null> {
    const trimmed = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', escapeIlikeExact(trimmed))
      .neq('id', excludeUserId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapUserRow(data as Record<string, unknown>) : null;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    return usersService.updateUser(id, { role });
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateUserAvatar(id: string, avatarUrl: string | null): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', id);

    if (error) throw error;
  },

  async updateUser(
    id: string,
    patch: { name?: string; email?: string; role?: string; avatar_url?: string | null }
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');
    return mapUserRow(data as Record<string, unknown>);
  },

  async createUser(input: {
    name: string
    email: string
    role: User['role']
    avatarUrl?: string | null
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email,
        name: input.name,
        avatar_url: input.avatarUrl ?? null,
        role: input.role,
      })
      .select()
      .single();

    if (error) throw error;
    return mapUserRow(data as Record<string, unknown>);
  }
};
