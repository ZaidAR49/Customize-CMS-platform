import supabase from '@/lib/supabase';
import { pickJoinedUserName } from '@/lib/user-display';
import type { OrganizationStatRow } from '@/types/organization';

const ORG_STAT_SELECT = '*, updated_by_user:users!organization_stats_updated_by_fkey(name), translations:organization_stats_translations(lang, label, description)';

type RawOrganizationStat = OrganizationStatRow & {
  updated_by_user?: { name?: string | null } | { name?: string | null }[] | null;
  translations?: any[];
};

function mapOrganizationStat(row: RawOrganizationStat): OrganizationStatRow {
  const { updated_by_user, translations, ...rest } = row;
  const trans = Array.isArray(translations) ? translations : [];
  const ar = trans.find((t: any) => t.lang === 'ar') || {};
  const en = trans.find((t: any) => t.lang === 'en') || {};

  return {
    ...rest,
    label_ar: ar.label ?? rest.label_ar ?? '',
    label_en: en.label ?? rest.label_en ?? '',
    description_ar: ar.description ?? rest.description_ar ?? '',
    description_en: en.description ?? rest.description_en ?? '',
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
    const { updatedByName, label_ar, label_en, description_ar, description_en, ...insertData } = statData;
    void updatedByName;
    const { data, error } = await supabase
      .from('organization_stats')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create stat');

    const statId = data.id;
    const trans = [];
    if (label_ar || description_ar) trans.push({ stat_id: statId, lang: 'ar', label: label_ar ?? '', description: description_ar });
    if (label_en || description_en) trans.push({ stat_id: statId, lang: 'en', label: label_en ?? '', description: description_en });

    if (trans.length > 0) {
      await supabase.from('organization_stats_translations').insert(trans);
    }

    const { data: fullData, error: fetchErr } = await supabase.from('organization_stats').select(ORG_STAT_SELECT).eq('id', statId).single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Failed to fetch after create');
    return mapOrganizationStat(fullData as RawOrganizationStat);
  },

  async updateStat(id: string, statData: Partial<OrganizationStatRow>): Promise<OrganizationStatRow> {
    const { updatedByName, label_ar, label_en, description_ar, description_en, ...updateData } = statData;
    void updatedByName;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('organization_stats')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    }

    const trans = [];
    if (label_ar !== undefined || description_ar !== undefined) {
      trans.push({ stat_id: id, lang: 'ar', label: label_ar ?? '', description: description_ar });
    }
    if (label_en !== undefined || description_en !== undefined) {
      trans.push({ stat_id: id, lang: 'en', label: label_en ?? '', description: description_en });
    }

    if (trans.length > 0) {
      const { error: transErr } = await supabase.from('organization_stats_translations').upsert(trans, { onConflict: 'stat_id, lang' });
      if (transErr) throw transErr;
    }

    const { data: fullData, error: fetchErr } = await supabase.from('organization_stats').select(ORG_STAT_SELECT).eq('id', id).single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Stat not found or update failed');
    return mapOrganizationStat(fullData as RawOrganizationStat);
  },

  async deleteStat(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_stats')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
