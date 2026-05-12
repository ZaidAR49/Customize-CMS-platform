import supabase from '@/lib/supabase';
import type { Post } from '@/types/post';

const POST_SELECT = '*, author:users(name, avatar_url)';

export const postsService = {
  async getPosts(type?: string, publishedOnly: boolean = false): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (publishedOnly) query = query.eq('published', true);

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as Post[];
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as unknown as Post) ?? null;
  },

  async createPost(postData: any): Promise<Post> {
    const { title, slug, content, excerpt, cover_image, type, published, author_id } = postData;

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt ?? null,
        cover_image: cover_image ?? null,
        type,
        published: published ?? false,
        author_id,
      })
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    return data as unknown as Post;
  },

  async updatePost(id: string, postData: any): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Post not found');
    return data as unknown as Post;
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
