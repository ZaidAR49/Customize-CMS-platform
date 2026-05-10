import { supabaseAdmin } from '@/lib/supabase';
import type { Organization } from '@/types/organization';

export const organizationService = {
  async getOrganization(): Promise<Organization | null> {
    const { data, error } = await supabaseAdmin
      .from('organization')
      .select('*')
      .limit(1)
      .single();
    
    if (error) return null;
    return data as Organization;
  },

  async updateOrganization(id: string, orgData: any): Promise<Organization> {
    const { data, error } = await supabaseAdmin
      .from('organization')
      .update(orgData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data as Organization;
  }
};
