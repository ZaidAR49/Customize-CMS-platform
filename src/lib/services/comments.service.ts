import supabase from '@/lib/supabase'
import type { PostCommentRow, PostCommentWithPost } from '@/types/comment'
import { unstable_cache } from 'next/cache'

export const commentsService = {
  async listRecentApproved(limit = 5) {
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, body, created_at, posts(title, slug)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data ?? []
  },

  async listApprovedForPost(postId: string) {
    const fetchFunc = async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('id, author_name, body, created_at')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    };

    const cacheKey = ['comments', postId];
    return unstable_cache(fetchFunc, cacheKey, {
      tags: ['comments', `comments-${postId}`],
      revalidate: 3600,
    })();
  },

  async countApprovedForPost(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('status', 'approved')

    if (error) throw error
    return count ?? 0
  },

  async getApprovedCommentCounts(postIds: string[]): Promise<Record<string, number>> {
    const fetchFunc = async () => {
      if (!postIds || postIds.length === 0) return {}
      const { data, error } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds)
        .eq('status', 'approved')

      if (error) throw error

      const counts: Record<string, number> = {}
      postIds.forEach(id => {
        counts[id] = 0
      })
      data?.forEach((row: any) => {
        if (row.post_id) {
          counts[row.post_id] = (counts[row.post_id] || 0) + 1
        }
      })
      return counts
    };

    const sortedIds = [...postIds].sort();
    const cacheKey = ['comments-counts', ...sortedIds];
    return unstable_cache(fetchFunc, cacheKey, {
      tags: ['comments', 'comments-counts'],
      revalidate: 3600,
    })();
  },

  async listForModeration(): Promise<PostCommentWithPost[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(
        `
        *,
        posts (
          title,
          slug,
          type
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as PostCommentWithPost[]
  },

  async createPending(input: {
    post_id: string
    author_name: string
    author_email: string | null
    body: string
  }): Promise<PostCommentRow> {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: input.post_id,
        author_name: input.author_name,
        author_email: input.author_email,
        body: input.body,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data as PostCommentRow
  },

  async updateModeration(
    id: string,
    patch: {
      status: 'approved' | 'rejected'
      moderated_at: string
      moderated_by: string
    }
  ): Promise<PostCommentRow> {
    const { data, error } = await supabase
      .from('post_comments')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Comment not found')
    return data as PostCommentRow
  },
}
