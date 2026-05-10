import { supabaseAdmin } from '@/lib/supabase';
import type { AppUser as User } from '@/types/user';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as User[];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as User;
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};
