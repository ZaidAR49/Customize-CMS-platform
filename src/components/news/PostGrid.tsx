'use client'

import { useState } from 'react'
import type { Post, PostType } from '@/types/post'
import { PostCard } from './PostCard'
import { PostFilter } from './PostFilter'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  const [activeFilter, setActiveFilter] = useState<PostType | 'all'>('all')

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.type === activeFilter)

  return (
    <div>
      <PostFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg text-(--fcps-gray-text)">لا توجد مقالات في هذا التصنيف</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
