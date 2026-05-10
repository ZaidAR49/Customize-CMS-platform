import { supabaseAdmin } from '@/lib/supabase';
import type { Post } from '@/types/post';

export const postsService = {
  async getPosts(type?: string, publishedOnly: boolean = false): Promise<Post[]> {
    let query = supabaseAdmin
      .from('posts')
      .select('*, author:users(name, avatar_url)')
      .order('created_at', { ascending: false });

    if (publishedOnly) {
      query = query.eq('published', true);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Post[];
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*, author:users(name, avatar_url)')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data as Post;
  },

  async createPost(postData: any): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([postData])
      .select('*, author:users(name, avatar_url)')
      .single();
    
    if (error) throw new Error(error.message);
    return data as Post;
  },

  async updatePost(id: string, postData: any): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select('*, author:users(name, avatar_url)')
      .single();
    
    if (error) throw new Error(error.message);
    return data as Post;
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  },

  async incrementLikes(id: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('increment_likes', { post_id: id });
    if (error) throw new Error(error.message);
  }
};
