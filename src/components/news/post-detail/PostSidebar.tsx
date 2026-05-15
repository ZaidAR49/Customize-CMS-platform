'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/post'
import { SearchBar } from '@/components/shared/SearchBar'
import { formatSiteDate } from '@/lib/date-format'

interface SidebarCategory {
  key: string
  label: string
}

interface PostSidebarProps {
  latestPosts: Array<Post & { commentCount?: number }>
  categories: SidebarCategory[]
}

export function PostSidebar({ latestPosts, categories }: PostSidebarProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  return (
    <aside className="space-y-8 lg:col-span-1">
      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={(q) => {
            const trimmed = q.trim()
            if (trimmed) router.push(`/news?q=${encodeURIComponent(trimmed)}`)
            else router.push('/news')
          }}
          placeholder="بحث..."
          aria-label="بحث في الأخبار"
        />
      </div>

      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">احدث المنشورات</h3>
        <ol className="space-y-3 text-sm">
          {latestPosts.map((post) => (
            <li key={post.id} className="leading-relaxed text-[#333333]">
              <span className="text-[#777777]">{post.commentCount ?? 0} · </span>
              <Link href={`/news/${post.slug}`} className="font-medium text-[#0073aa] hover:text-[#005580]">
                {post.title}
              </Link>
              <span className="text-[#777777]"> · {formatSiteDate(post.publishedAt)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">التصنيفات</h3>
        <ul className="list-disc space-y-2 pr-5 text-sm text-[#0073aa]">
          {categories.map((cat) => (
            <li key={cat.key}>
              <Link href={`/news?category=${encodeURIComponent(cat.key)}`} className="hover:text-[#005580]">
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </aside>
  )
}
