import { PostApprovedCommentsList } from '@/components/news/post-detail/PostApprovedCommentsList'
import { PostCommentForm } from '@/components/news/post-detail/PostCommentForm'

export interface PostApprovedComment {
  id: string
  author_name: string
  body: string
  created_at: string
}

interface PostCommentsSectionProps {
  postId: string
  comments: PostApprovedComment[]
}

export function PostCommentsSection({ postId, comments }: PostCommentsSectionProps) {
  return (
    <section className="mb-10 border-t border-[#e0e0e0] pt-10" id="comments">
      <h2 className="mb-6 text-2xl font-bold text-[#1a1a1a]">التعليقات</h2>

      <PostApprovedCommentsList comments={comments} />

      <PostCommentForm postId={postId} />
    </section>
  )
}
