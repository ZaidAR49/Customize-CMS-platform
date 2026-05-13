import supabase from '@/lib/supabase';
import type { Post } from '@/types/post';

const POST_SELECT =
  '*, author:users(name, avatar_url), category:categories!posts_category_id_fkey(id, key, label_ar, label_en)';
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
  if (type === 'program') return 'posts';
  if (type === 'center') return 'top_employees';
  return type ?? 'news';
}

function mapPost(row: RawPost): Post {
  const metadata = row.metadata ?? {};
  const excerpt = row.excerpt ?? metadata.excerpt ?? '';
  const content = row.content ?? metadata.body ?? '';
  const category = Array.isArray(row.category) ? row.category[0] : row.category;

  return {
    id: row.id,
    slug: row.slug ?? '',
    title: row.title ?? '',
    excerpt,
    content,
    coverImage: row.cover_image ?? row.coverImage ?? '',
    type: normalizePostType(row.type),
    categoryId: row.category_id ?? category?.id ?? undefined,
    category: category?.key ?? metadata.category ?? undefined,
    categoryLabel: category?.label_ar ?? category?.label_en ?? category?.key ?? metadata.category ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    likes: row.likes ?? 0,
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

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? mapPost(data) : null;
  },

  async createPost(postData: any): Promise<Post> {
    const { title, slug, content, excerpt, cover_image, type, published, author_id, category_id } = postData;
    const metadata: Record<string, string> = {};
    if (excerpt !== undefined) metadata.excerpt = excerpt;
    if (content !== undefined) metadata.body = content;

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        cover_image: cover_image ?? null,
        type: toDatabasePostType(type),
        metadata,
        category_id: category_id || null,
        published: published ?? false,
        author_id,
      })
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    return mapPost(data);
  },

  async updatePost(id: string, postData: any): Promise<Post> {
    const { content, excerpt, type, category_id, ...rest } = postData;
    const payload: Record<string, any> = { ...rest };

    if (type !== undefined) payload.type = toDatabasePostType(type);
    if (category_id !== undefined) payload.category_id = category_id || null;

    if (content !== undefined || excerpt !== undefined) {
      const { data: existingPost, error: existingError } = await supabase
        .from('posts')
        .select('metadata')
        .eq('id', id)
        .single();

      if (existingError) throw existingError;

      payload.metadata = {
        ...(existingPost?.metadata ?? {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { body: content } : {}),
      };
    }

    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Post not found');
    return mapPost(data);
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementLikes(id: string): Promise<void> {
    // Fetch current likes, then increment
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const currentLikes = post?.likes ?? 0;

    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes: currentLikes + 1 })
      .eq('id', id);

    if (updateError) throw updateError;
  }
};
