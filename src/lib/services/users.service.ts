import supabase from '@/lib/supabase';
import type { AppUser as User } from '@/types/user';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as User[];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as User) ?? null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as User) ?? null;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        avatar_url: user.avatarUrl ?? null,
        role: user.role ?? 'viewer',
      })
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
};
