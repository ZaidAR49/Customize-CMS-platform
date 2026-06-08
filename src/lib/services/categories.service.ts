import supabase from '@/lib/supabase';
import type { CategoryRow } from '@/types/category';
import { unstable_cache } from 'next/cache';

const CATEGORY_SELECT = '*, translations:category_translations(lang, label, description)';

type RawCategory = CategoryRow & {
  translations?: any[];
};

function mapCategory(row: RawCategory): CategoryRow {
  const { translations, ...rest } = row;
  const trans = Array.isArray(translations) ? translations : [];
  const ar = trans.find((t: any) => t.lang === 'ar') || {};
  const en = trans.find((t: any) => t.lang === 'en') || {};

  return {
    ...rest,
    label_ar: ar.label ?? rest.label_ar ?? '',
    label_en: en.label ?? rest.label_en ?? '',
    description_ar: ar.description ?? rest.description_ar ?? '',
    description_en: en.description ?? rest.description_en ?? '',
  };
}

export const categoriesService = {
  async getAllCategories(): Promise<CategoryRow[]> {
    const fetchFunc = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(CATEGORY_SELECT)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return ((data as RawCategory[]) ?? []).map(mapCategory);
    };

    return unstable_cache(fetchFunc, ['categories'], {
      tags: ['categories'],
      revalidate: 3600,
    })();
  },

  async createCategory(catData: Partial<CategoryRow>): Promise<CategoryRow> {
    const { label_ar, label_en, description_ar, description_en, ...insertData } = catData;

    const { data, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create category');

    const categoryId = data.id;
    const trans = [];
    if (label_ar || description_ar) trans.push({ category_id: categoryId, lang: 'ar', label: label_ar ?? '', description: description_ar });
    if (label_en || description_en) trans.push({ category_id: categoryId, lang: 'en', label: label_en ?? '', description: description_en });

    if (trans.length > 0) {
      await supabase.from('category_translations').insert(trans);
    }

    const { data: fullData, error: fetchErr } = await supabase
      .from('categories')
      .select(CATEGORY_SELECT)
      .eq('id', categoryId)
      .single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Failed to fetch after create');
    return mapCategory(fullData as RawCategory);
  },

  async updateCategory(id: string, catData: Partial<CategoryRow>): Promise<CategoryRow> {
    const { label_ar, label_en, description_ar, description_en, ...updateData } = catData;

    // Remove computed/non-db fields
    delete (updateData as any).created_at;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    }

    const trans = [];
    if (label_ar !== undefined || description_ar !== undefined) {
      trans.push({ category_id: id, lang: 'ar', label: label_ar ?? '', description: description_ar });
    }
    if (label_en !== undefined || description_en !== undefined) {
      trans.push({ category_id: id, lang: 'en', label: label_en ?? '', description: description_en });
    }

    if (trans.length > 0) {
      const { error: transErr } = await supabase
        .from('category_translations')
        .upsert(trans, { onConflict: 'category_id, lang' });
      if (transErr) throw transErr;
    }

    const { data: fullData, error: fetchErr } = await supabase
      .from('categories')
      .select(CATEGORY_SELECT)
      .eq('id', id)
      .single();
    if (fetchErr || !fullData) throw fetchErr || new Error('Category not found or update failed');
    return mapCategory(fullData as RawCategory);
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
