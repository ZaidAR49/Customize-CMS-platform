export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface PostCommentRow {
  id: string
  post_id: string
  author_name: string
  author_email: string | null
  body: string
  status: CommentStatus
  created_at: string
  moderated_at: string | null
  moderated_by: string | null
}

export interface PostTranslationEmbed {
  lang: string
  slug: string
  title: string
}

export interface PostSummaryEmbed {
  type: string
  translations: PostTranslationEmbed[] | null
}

export type PostCommentWithPost = PostCommentRow & {
  posts: PostSummaryEmbed | PostSummaryEmbed[] | null
}
