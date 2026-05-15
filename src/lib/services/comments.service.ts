import supabase from '@/lib/supabase'
import type { PostCommentRow, PostCommentWithPost } from '@/types/comment'

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
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, author_name, body, created_at')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
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
