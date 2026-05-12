import supabase from '@/lib/supabase';
import type { OrganizationStatRow } from '@/types/organization';

export const organizationStatsService = {
  async getAllStats(): Promise<OrganizationStatRow[]> {
    const { data, error } = await supabase
      .from('organization_stats')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data as OrganizationStatRow[]) || [];
  },

  async createStat(statData: Partial<OrganizationStatRow>): Promise<OrganizationStatRow> {
    const { data, error } = await supabase
      .from('organization_stats')
      .insert(statData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create stat');
    return data as OrganizationStatRow;
  },

  async updateStat(id: string, statData: Partial<OrganizationStatRow>): Promise<OrganizationStatRow> {
    const { data, error } = await supabase
      .from('organization_stats')
      .update(statData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Stat not found or update failed');
    return data as OrganizationStatRow;
  },

  async deleteStat(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_stats')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
