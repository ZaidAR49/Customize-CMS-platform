import supabase from '@/lib/supabase';
import { normalizeSlug } from '@/lib/slug';
import type { Post } from '@/types/post';
import { unstable_cache } from 'next/cache';

const POST_SELECT =
  '*, author:users(name, avatar_url), category:categories!posts_category_id_fkey(id, key, translations:category_translations(lang, label)), translations:post_translations(lang, slug, title, description, excerpt)';
type RawPost = Record<string, any>;

function normalizePostType(type: string | null | undefined): Post['type'] {
  if (type === 'activities') return 'activity';
  if (type === 'posts') return 'news';
  if (type === 'top_employees') return 'center';
  if (type === 'activity' || type === 'program' || type === 'center') return type;
  return 'news';
}

function toDatabasePostType(type: string | null | undefined): string {
  if (type === 'activity') return 'activities';
  return type ?? 'news';
}

function parseGallery(metadata: Record<string, unknown>): string[] {
  const raw = metadata.gallery;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function parseLikes(metadata: Record<string, unknown>): number {
  const raw = metadata.likes;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
  if (typeof raw === 'string') {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return Math.max(0, n);
  }
  return 0;
}

function mapPost(row: RawPost): Post {
  const metadata = row.metadata ?? {};
  const postTrans = Array.isArray(row.translations) ? row.translations : [];
  const postAr = postTrans.find((t: any) => t.lang === 'ar') || {};
  const postEn = postTrans.find((t: any) => t.lang === 'en') || {};

  const titleAr = postAr.title ?? row.title ?? '';
  const titleEn = postEn.title ?? '';

  const descripcionAr = postAr.description ?? row.descripcion ?? row.description ?? (typeof metadata.body === 'string' ? metadata.body : '') ?? '';
  const descripcionEn = postEn.description ?? '';

  const excerptAr = postAr.excerpt ?? '';
  const excerptEn = postEn.excerpt ?? '';

  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  const catTrans = Array.isArray(category?.translations) ? category.translations : [];
  const catAr = catTrans.find((t: any) => t.lang === 'ar') || {};
  const catEn = catTrans.find((t: any) => t.lang === 'en') || {};

  return {
    id: row.id,
    slug: postAr.slug ?? postEn.slug ?? '',
    slug_en: postEn.slug || undefined,
    title: titleAr,
    title_en: titleEn,
    excerpt: excerptAr,
    excerpt_en: excerptEn,
    descripcion: descripcionAr,
    descripcion_en: descripcionEn,
    coverImage: metadata.cover_image ?? '',
    type: normalizePostType(row.type),
    categoryId: row.category_id ?? category?.id ?? undefined,
    category: category?.key ?? metadata.category ?? undefined,
    categoryLabel: catAr.label ?? catEn.label ?? category?.key ?? metadata.category ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    tags_en: Array.isArray(row.tags_en) ? row.tags_en : [],
    gallery: parseGallery(metadata),
    likes: parseLikes(metadata),
    published: row.published ?? false,
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toISOString(),
    author: {
      name: row.author?.name ?? 'إدارة الجمعية',
      avatarUrl: row.author?.avatar_url ?? '',
    },
    isBotGenerated: row.is_bot_generated ?? false,
  };
}

export const postsService = {
  async getPosts(type?: string, publishedOnly: boolean = false): Promise<Post[]> {
    const fetchFunc = async () => {
      let query = supabase
        .from('posts')
        .select(POST_SELECT)
        .order('published_at', { ascending: false });

      if (type) query = query.eq('type', toDatabasePostType(type));
      if (publishedOnly) query = query.eq('published', true);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapPost);
    };

    if (!publishedOnly) {
      return fetchFunc();
    }

    const cacheKey = ['posts', type ?? 'all'];
    return unstable_cache(fetchFunc, cacheKey, {
      tags: cacheKey,
      revalidate: 3600,
    })();
  },

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapPost(data) : null;
  },

  async getPostBySlug(slug: string, publishedOnly = true): Promise<Post | null> {
    const normalized = normalizeSlug(slug)

    const fetchFunc = async () => {
      // Find the post ID via the translation slug
      const { data: transData, error: transError } = await supabase
        .from('post_translations')
        .select('post_id')
        .eq('slug', normalized)
        .single()
      if (transError && transError.code !== 'PGRST116') throw transError
      if (transData) {
        const post = await this.getPostById(transData.post_id)
        if (publishedOnly && post && !post.published) return null
        return post
      }

      // Fallback: match after NFC normalization (encoding / copy-paste differences)
      let listQuery = supabase.from('posts').select(POST_SELECT)
      if (publishedOnly) listQuery = listQuery.eq('published', true)

      const { data: rows, error: listError } = await listQuery
      if (listError) throw listError

      const match = (rows ?? []).find((row: any) => normalizeSlug(row.slug ?? '') === normalized)
      return match ? mapPost(match) : null
    };

    if (!publishedOnly) {
      return fetchFunc();
    }

    const cacheKey = ['post-slug', normalized];
    return unstable_cache(fetchFunc, cacheKey, {
      tags: cacheKey,
      revalidate: 3600,
    })();
  },

  async createPost(postData: any): Promise<Post> {
    const { title, title_en, slug, slug_en, descripcion, descripcion_en, excerpt, excerpt_en, cover_image, gallery, type, published, author_id, category_id, tags, tags_en } = postData;
    const metadata: Record<string, unknown> = { likes: 0 };
    if (cover_image !== undefined) metadata.cover_image = cover_image ?? null;
    if (gallery !== undefined) metadata.gallery = Array.isArray(gallery) ? gallery : [];

    const { data: postRow, error } = await supabase
      .from('posts')
      .insert({
        // slug is stored in translation, not in posts table
        // omit slug here

        type: toDatabasePostType(type),
        metadata,
        category_id: category_id || null,
        published: published ?? false,
        author_id,
        tags: Array.isArray(tags) ? tags : [],
        tags_en: Array.isArray(tags_en) ? tags_en : [],
      })
      .select('id')
      .single();

    if (error) throw error;

    const postId = postRow.id;
    const trans = [];
    if (title || descripcion || excerpt || slug) {
      trans.push({
        post_id: postId,
        lang: 'ar',
        slug: slug ?? '',
        title: title ?? '',
        description: descripcion ?? '',
        excerpt: excerpt ?? '',
      });
    }
    if (title_en || descripcion_en || excerpt_en || slug_en) {
      trans.push({
        post_id: postId,
        lang: 'en',
        slug: slug_en ?? slug ?? '',
        title: title_en ?? '',
        description: descripcion_en ?? '',
        excerpt: excerpt_en ?? '',
      });
    }
    
    if (trans.length > 0) {
      const { error: transError } = await supabase.from('post_translations').insert(trans);
      if (transError) throw transError;
    }

    const fullPost = await this.getPostById(postId);
    if (!fullPost) throw new Error('Post not found after insert');
    return fullPost;
  },

  async updatePost(id: string, postData: any): Promise<Post> {
    const { slug, slug_en, title, title_en, descripcion, descripcion_en, excerpt, excerpt_en, cover_image, gallery, type, category_id, tags, tags_en, ...rest } = postData;
    const payload: Record<string, any> = { ...rest };

    if (type !== undefined) payload.type = toDatabasePostType(type);
    if (category_id !== undefined) payload.category_id = category_id || null;
    if (tags !== undefined) payload.tags = Array.isArray(tags) ? tags : [];
    if (tags_en !== undefined) payload.tags_en = Array.isArray(tags_en) ? tags_en : [];

    if (cover_image !== undefined || gallery !== undefined) {
      const { data: existingPost, error: existingError } = await supabase
        .from('posts')
        .select('metadata')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      const nextMetadata = {
        ...(existingPost?.metadata ?? {}),
      };

      if (cover_image !== undefined) nextMetadata.cover_image = cover_image ?? null;
      if (gallery !== undefined) nextMetadata.gallery = Array.isArray(gallery) ? gallery : [];

      payload.metadata = nextMetadata;
    }

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    }

    // Update translations for each language
    for (const lang of ['ar', 'en'] as const) {
      const transPayload: Record<string, any> = {};
      if (lang === 'ar') {
        if (slug !== undefined) transPayload.slug = slug;
        if (title !== undefined) transPayload.title = title;
        if (descripcion !== undefined) transPayload.description = descripcion;
        if (excerpt !== undefined) transPayload.excerpt = excerpt;
      } else {
        if (slug_en !== undefined) transPayload.slug = slug_en;
        if (title_en !== undefined) transPayload.title = title_en;
        if (descripcion_en !== undefined) transPayload.description = descripcion_en;
        if (excerpt_en !== undefined) transPayload.excerpt = excerpt_en;
      }

      if (Object.keys(transPayload).length > 0) {
        const { data: existingTrans, error: transFetchError } = await supabase
          .from('post_translations')
          .select('id')
          .eq('post_id', id)
          .eq('lang', lang)
          .maybeSingle();
        
        if (transFetchError) throw transFetchError;

        if (existingTrans) {
          const { error: updateErr } = await supabase
            .from('post_translations')
            .update(transPayload)
            .eq('id', existingTrans.id);
          if (updateErr) throw updateErr;
        } else {
          // For insert, make sure required fields are present
          const { error: insertErr } = await supabase
            .from('post_translations')
            .insert({
              post_id: id,
              lang,
              slug: transPayload.slug ?? '',
              title: transPayload.title ?? '',
              description: transPayload.description ?? '',
              excerpt: transPayload.excerpt ?? '',
            });
          if (insertErr) throw insertErr;
        }
      }
    }


    const fullPost = await this.getPostById(id);
    if (!fullPost) throw new Error('Post not found after update');
    return fullPost;
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementLikes(id: string): Promise<number> {
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('metadata')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!post) throw new Error('Post not found');

    const metadata = (post.metadata ?? {}) as Record<string, unknown>;
    const nextLikes = parseLikes(metadata) + 1;

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        metadata: {
          ...metadata,
          likes: nextLikes,
        },
      })
      .eq('id', id);

    if (updateError) throw updateError;
    return nextLikes;
  },
};
