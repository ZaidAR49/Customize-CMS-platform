import supabase from '@/lib/supabase';
import { pickJoinedUserName } from '@/lib/user-display';
import type { OrganizationRow } from '@/types/organization';

const ORG_SELECT = '*, updated_by_user:users!organization_updated_by_fkey(name), translations:organization_translations(lang, name, tagline, about, mission, vision)';

type RawOrganization = OrganizationRow & {
  updated_by_user?: { name?: string | null } | { name?: string | null }[] | null;
  translations?: any[];
};

function mapOrganization(row: RawOrganization): OrganizationRow {
  const { updated_by_user, translations, ...rest } = row;
  const trans = Array.isArray(translations) ? translations : [];
  const ar = trans.find((t: any) => t.lang === 'ar') || {};
  const en = trans.find((t: any) => t.lang === 'en') || {};

  return {
    ...rest,
    name_ar: ar.name ?? rest.name_ar ?? '',
    name_en: en.name ?? rest.name_en ?? '',
    tagline_ar: ar.tagline ?? rest.tagline_ar ?? '',
    tagline_en: en.tagline ?? rest.tagline_en ?? '',
    about_ar: ar.about ?? rest.about_ar ?? '',
    about_en: en.about ?? rest.about_en ?? '',
    mission_ar: ar.mission ?? rest.mission_ar ?? '',
    mission_en: en.mission ?? rest.mission_en ?? '',
    vision_ar: ar.vision ?? rest.vision_ar ?? '',
    vision_en: en.vision ?? rest.vision_en ?? '',
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
    const { name_ar, name_en, tagline_ar, tagline_en, about_ar, about_en, mission_ar, mission_en, vision_ar, vision_en, ...updateData } = orgData;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('organization')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    }

    const trans = [];
    if (name_ar !== undefined || tagline_ar !== undefined || about_ar !== undefined || mission_ar !== undefined || vision_ar !== undefined) {
      trans.push({ organization_id: id, lang: 'ar', name: name_ar ?? '', tagline: tagline_ar ?? '', about: about_ar ?? '', mission: mission_ar ?? '', vision: vision_ar ?? '' });
    }
    if (name_en !== undefined || tagline_en !== undefined || about_en !== undefined || mission_en !== undefined || vision_en !== undefined) {
      trans.push({ organization_id: id, lang: 'en', name: name_en ?? '', tagline: tagline_en ?? '', about: about_en ?? '', mission: mission_en ?? '', vision: vision_en ?? '' });
    }

    if (trans.length > 0) {
      const { error: transErr } = await supabase.from('organization_translations').upsert(trans, { onConflict: 'organization_id, lang' });
      if (transErr) throw transErr;
    }

    const { data: fullData, error: fetchErr } = await supabase.from('organization').select(ORG_SELECT).eq('id', id).single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Organization not found');
    return mapOrganization(fullData as RawOrganization);
  },

  async createOrganization(orgData: Record<string, unknown>): Promise<OrganizationRow> {
    const { name_ar, name_en, tagline_ar, tagline_en, about_ar, about_en, mission_ar, mission_en, vision_ar, vision_en, ...insertData } = orgData;

    const { data, error } = await supabase
      .from('organization')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Organization insert failed');

    const orgId = data.id;
    const trans = [];
    if (name_ar || tagline_ar || about_ar || mission_ar || vision_ar) {
      trans.push({ organization_id: orgId, lang: 'ar', name: name_ar ?? '', tagline: tagline_ar ?? '', about: about_ar ?? '', mission: mission_ar ?? '', vision: vision_ar ?? '' });
    }
    if (name_en || tagline_en || about_en || mission_en || vision_en) {
      trans.push({ organization_id: orgId, lang: 'en', name: name_en ?? '', tagline: tagline_en ?? '', about: about_en ?? '', mission: mission_en ?? '', vision: vision_en ?? '' });
    }

    if (trans.length > 0) {
      await supabase.from('organization_translations').insert(trans);
    }

    const { data: fullData, error: fetchErr } = await supabase.from('organization').select(ORG_SELECT).eq('id', orgId).single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Organization fetch failed');
    return mapOrganization(fullData as RawOrganization);
  },
};
