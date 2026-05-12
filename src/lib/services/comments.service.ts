import supabase from '@/lib/supabase'
import type { PostCommentRow, PostCommentWithPost } from '@/types/comment'

export const commentsService = {
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
