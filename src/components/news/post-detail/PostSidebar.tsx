'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import type { Post } from '@/types/post'
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) router.push(`/news?q=${encodeURIComponent(q)}`)
    else router.push('/news')
  }

  return (
    <aside className="space-y-8 lg:col-span-1">
      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-2.5 pr-10 pl-10 text-sm outline-none focus:border-[#0073aa] focus:ring-1 focus:ring-[#0073aa]"
            aria-label="بحث في الأخبار"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#333333]"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
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
