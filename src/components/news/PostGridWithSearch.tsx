'use client'

import { useSearchParams } from 'next/navigation'
import { PostGrid } from './PostGrid'
import type { Post } from '@/types/post'

interface PostGridWithSearchProps {
  posts: Post[]
}

export function PostGridWithSearch({ posts }: PostGridWithSearchProps) {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const initialCategory = searchParams.get('category') ?? 'all'

  return (
    <PostGrid
      posts={posts}
      initialSearchQuery={initialQ}
      initialCategory={initialCategory}
    />
  )
}
