import supabase from '@/lib/supabase';
import { normalizeSlug } from '@/lib/slug';
import type { Post } from '@/types/post';

const POST_SELECT =
  '*, author:users(name, avatar_url), category:categories!posts_category_id_fkey(id, key, translations:category_translations(lang, label)), translations:post_translations(lang, title, description)';
type RawPost = Record<string, any>;

function normalizePostType(type: string | null | undefined): Post['type'] {
  if (type === 'activities') return 'activity';
  if (type === 'posts') return 'program';
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
  const excerpt = metadata.excerpt ?? '';
  const postTrans = Array.isArray(row.translations) ? row.translations : [];
  const postAr = postTrans.find((t: any) => t.lang === 'ar') || {};
  const postEn = postTrans.find((t: any) => t.lang === 'en') || {};

  const titleAr = postAr.title ?? row.title ?? '';
  const titleEn = postEn.title ?? '';

  const descripcionAr = postAr.description ?? row.descripcion ?? row.description ?? (typeof metadata.body === 'string' ? metadata.body : '') ?? '';
  const descripcionEn = postEn.description ?? '';

  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  const catTrans = Array.isArray(category?.translations) ? category.translations : [];
  const catAr = catTrans.find((t: any) => t.lang === 'ar') || {};
  const catEn = catTrans.find((t: any) => t.lang === 'en') || {};

  return {
    id: row.id,
    slug: row.slug ?? '',
    title: titleAr,
    title_en: titleEn,
    excerpt,
    descripcion: descripcionAr,
    descripcion_en: descripcionEn,
    coverImage: row.cover_image ?? row.coverImage ?? '',
    type: normalizePostType(row.type),
    categoryId: row.category_id ?? category?.id ?? undefined,
    category: category?.key ?? metadata.category ?? undefined,
    categoryLabel: catAr.label ?? catEn.label ?? category?.key ?? metadata.category ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    gallery: parseGallery(metadata),
    likes: parseLikes(metadata),
    published: row.published ?? false,
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toISOString(),
    author: {
      name: row.author?.name ?? 'إدارة الجمعية',
      avatarUrl: row.author?.avatar_url ?? '',
    },
  };
}

export const postsService = {
  async getPosts(type?: string, publishedOnly: boolean = false): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select(POST_SELECT)
      .order('published_at', { ascending: false });

    if (type) query = query.eq('type', toDatabasePostType(type));
    if (publishedOnly) query = query.eq('published', true);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapPost);
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

    let query = supabase.from('posts').select(POST_SELECT).eq('slug', normalized)
    if (publishedOnly) query = query.eq('published', true)

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) return mapPost(data)

    // Fallback: match after NFC normalization (encoding / copy-paste differences)
    let listQuery = supabase.from('posts').select(POST_SELECT)
    if (publishedOnly) listQuery = listQuery.eq('published', true)

    const { data: rows, error: listError } = await listQuery
    if (listError) throw listError

    const match = (rows ?? []).find((row) => normalizeSlug(row.slug ?? '') === normalized)
    return match ? mapPost(match) : null
  },

  async createPost(postData: any): Promise<Post> {
    const { title, title_en, slug, descripcion, descripcion_en, excerpt, cover_image, type, published, author_id, category_id } = postData;
    const metadata: Record<string, unknown> = { likes: 0 };
    if (excerpt !== undefined) metadata.excerpt = excerpt;

    const { data: postRow, error } = await supabase
      .from('posts')
      .insert({
        slug,
        cover_image: cover_image ?? null,
        type: toDatabasePostType(type),
        metadata,
        category_id: category_id || null,
        published: published ?? false,
        author_id,
      })
      .select('id')
      .single();

    if (error) throw error;

    const postId = postRow.id;
    const trans = [];
    if (title || descripcion) trans.push({ post_id: postId, lang: 'ar', title: title ?? '', description: descripcion ?? '' });
    if (title_en || descripcion_en) trans.push({ post_id: postId, lang: 'en', title: title_en ?? '', description: descripcion_en ?? '' });
    
    if (trans.length > 0) {
      await supabase.from('post_translations').insert(trans);
    }

    const fullPost = await this.getPostById(postId);
    if (!fullPost) throw new Error('Post not found after insert');
    return fullPost;
  },

  async updatePost(id: string, postData: any): Promise<Post> {
    const { title, title_en, descripcion, descripcion_en, excerpt, type, category_id, ...rest } = postData;
    const payload: Record<string, any> = { ...rest };

    if (type !== undefined) payload.type = toDatabasePostType(type);
    if (category_id !== undefined) payload.category_id = category_id || null;

    if (excerpt !== undefined) {
      const { data: existingPost, error: existingError } = await supabase
        .from('posts')
        .select('metadata')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      payload.metadata = {
        ...(existingPost?.metadata ?? {}),
        excerpt,
      };
    }

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    }

    const trans = [];
    if (title !== undefined || descripcion !== undefined) {
      trans.push({ post_id: id, lang: 'ar', title: title ?? '', description: descripcion ?? '' });
    }
    if (title_en !== undefined || descripcion_en !== undefined) {
      trans.push({ post_id: id, lang: 'en', title: title_en ?? '', description: descripcion_en ?? '' });
    }

    if (trans.length > 0) {
      const { error: transError } = await supabase.from('post_translations').upsert(trans, { onConflict: 'post_id, lang' });
      if (transError) throw transError;
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
