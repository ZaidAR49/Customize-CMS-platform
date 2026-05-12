import supabase from '@/lib/supabase';
import type { OrganizationRow } from '@/types/organization';

export const organizationService = {
  async getOrganization(): Promise<OrganizationRow | null> {
    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as OrganizationRow) ?? null;
  },

  async updateOrganization(id: string, orgData: Record<string, unknown>): Promise<OrganizationRow> {
    const { data, error } = await supabase
      .from('organization')
      .update(orgData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Organization not found');
    return data as OrganizationRow;
  }
};
