import supabase from '@/lib/supabase';
import type { Organization } from '@/types/organization';

export const organizationService = {
  async getOrganization(): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Organization) ?? null;
  },

  async updateOrganization(id: string, orgData: any): Promise<Organization> {
    const { data, error } = await supabase
      .from('organization')
      .update(orgData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Organization not found');
    return data as Organization;
  }
};
