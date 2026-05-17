import supabase from '@/lib/supabase';
import { pickJoinedUserName } from '@/lib/user-display';
import type { OrganizationStatRow } from '@/types/organization';

const ORG_STAT_SELECT = '*, updated_by_user:users!organization_stats_updated_by_fkey(name)';

type RawOrganizationStat = OrganizationStatRow & {
  updated_by_user?: { name?: string | null } | { name?: string | null }[] | null;
};

function mapOrganizationStat(row: RawOrganizationStat): OrganizationStatRow {
  const { updated_by_user, ...rest } = row;
  return {
    ...rest,
    updatedByName: pickJoinedUserName(updated_by_user, ''),
  };
}

export const organizationStatsService = {
  async getAllStats(): Promise<OrganizationStatRow[]> {
    const { data, error } = await supabase
      .from('organization_stats')
      .select(ORG_STAT_SELECT)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return ((data as RawOrganizationStat[]) ?? []).map(mapOrganizationStat);
  },

  async createStat(statData: Partial<OrganizationStatRow>): Promise<OrganizationStatRow> {
    const { updatedByName, ...insertData } = statData;
    void updatedByName;
    const { data, error } = await supabase
      .from('organization_stats')
      .insert(insertData)
      .select(ORG_STAT_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create stat');
    return mapOrganizationStat(data as RawOrganizationStat);
  },

  async updateStat(id: string, statData: Partial<OrganizationStatRow>): Promise<OrganizationStatRow> {
    const { updatedByName, ...updateData } = statData;
    void updatedByName;
    const { data, error } = await supabase
      .from('organization_stats')
      .update(updateData)
      .eq('id', id)
      .select(ORG_STAT_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Stat not found or update failed');
    return mapOrganizationStat(data as RawOrganizationStat);
  },

  async deleteStat(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_stats')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
