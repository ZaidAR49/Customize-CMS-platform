import supabase from '@/lib/supabase';
import { pickJoinedUserName } from '@/lib/user-display';
import type { OrganizationRow } from '@/types/organization';

const ORG_SELECT = '*, updated_by_user:users!organization_updated_by_fkey(name)';

type RawOrganization = OrganizationRow & {
  updated_by_user?: { name?: string | null } | { name?: string | null }[] | null;
};

function mapOrganization(row: RawOrganization): OrganizationRow {
  const { updated_by_user, ...rest } = row;
  return {
    ...rest,
    updatedByName: pickJoinedUserName(updated_by_user, ''),
  };
}

export const organizationService = {
  async getOrganization(): Promise<OrganizationRow | null> {
    const { data, error } = await supabase
      .from('organization')
      .select(ORG_SELECT)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapOrganization(data as RawOrganization) : null;
  },

  async updateOrganization(id: string, orgData: Record<string, unknown>): Promise<OrganizationRow> {
    const { data, error } = await supabase
      .from('organization')
      .update(orgData)
      .eq('id', id)
      .select(ORG_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Organization not found');
    return mapOrganization(data as RawOrganization);
  },

  async createOrganization(orgData: Record<string, unknown>): Promise<OrganizationRow> {
    const { data, error } = await supabase
      .from('organization')
      .insert(orgData)
      .select(ORG_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Organization insert failed');
    return mapOrganization(data as RawOrganization);
  },
};
