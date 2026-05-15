'use client'

import { useState } from 'react'
import { formatSiteDate } from '@/lib/date-format'
import type { PostApprovedComment } from '@/components/news/post-detail/PostCommentsSection'

const PAGE_SIZE = 5

interface PostApprovedCommentsListProps {
  comments: PostApprovedComment[]
}

export function PostApprovedCommentsList({ comments }: PostApprovedCommentsListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visible = comments.slice(0, visibleCount)
  const hasMore = visibleCount < comments.length

  if (comments.length === 0) {
    return <p className="mb-8 text-sm text-[#777777]">كن أول من يعلق</p>
  }

  return (
    <div className="mb-8">
      <ol className="space-y-6">
        {visible.map((comment) => (
          <li key={comment.id} className="border-b border-[#e8e8e8] pb-6 last:border-0 last:pb-0">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-[#1a1a1a]">{comment.author_name}</span>
              <time className="text-[#777777]" dateTime={comment.created_at}>
                {formatSiteDate(comment.created_at)}
              </time>
            </div>
            <p className="whitespace-pre-wrap text-right text-[#333333] leading-relaxed">
              {comment.body}
            </p>
          </li>
        ))}
      </ol>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => Math.min(n + PAGE_SIZE, comments.length))}
            className="text-sm font-medium text-[#0073aa] hover:text-[#005580]"
          >
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  )
}
