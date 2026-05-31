'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/post'
import { SearchBar } from '@/components/shared/SearchBar'
import { formatSiteDate } from '@/lib/date-format'
import { getSearchPostsAction } from '@/actions/posts.actions'
import { Calendar, Loader2, Newspaper } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('newsPage.sidebar')
  const tPage = useTranslations('newsPage')
  const locale = useLocale()
  const [search, setSearch] = useState('')
  const [allSearchPosts, setAllSearchPosts] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleFocus = async () => {
    setIsFocused(true)
    if (allSearchPosts === null && !isLoading) {
      setIsLoading(true)
      try {
        const res = await getSearchPostsAction()
        if (res.success && res.data) {
          setAllSearchPosts(res.data)
        }
      } catch (err) {
        console.error('Error loading search posts:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const query = search.trim().toLowerCase()
  const matchingPosts =
    query && allSearchPosts
      ? allSearchPosts.filter(
          (post) => {
            const title = locale === 'ar' ? post.title : (post.title_en || post.title)
            return title.toLowerCase().includes(query) ||
            post.slug.toLowerCase().includes(query)
          }
        )
      : []

  const showDropdown = isFocused && search.trim().length > 0

  return (
    <aside className="space-y-8 lg:col-span-1">
      <div className="relative rounded-lg bg-[#f9f9f9] p-5" ref={dropdownRef}>
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val)
            setIsFocused(true)
          }}
          onSubmit={(q) => {
            const trimmed = q.trim()
            if (trimmed) router.push(`/news?q=${encodeURIComponent(trimmed)}`)
            else router.push('/news')
          }}
          placeholder={tPage('searchPlaceholder')}
          aria-label={tPage('searchAria')}
          onFocus={handleFocus}
        />

        {showDropdown && (
          <div className="absolute right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-2xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-[#777777] gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-(--fcps-primary)" />
                <span className="text-sm font-medium">{t('searching')}</span>
              </div>
            ) : matchingPosts.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#777777]">
                <p>{t('noSearchMatches', { search })}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {matchingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    onClick={() => {
                      setIsFocused(false)
                      setSearch('')
                    }}
                    className="flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 active:bg-gray-100 group"
                  >
                    {post.coverImage ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-gray-100">
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#fafafa] border border-gray-100 text-[#777777]">
                        {post.type === 'activity' ? (
                          <Calendar className="h-5 w-5 text-(--fcps-primary-light)" />
                        ) : (
                          <Newspaper className="h-5 w-5 text-(--fcps-primary-light)" />
                        )}
                      </div>
                    )}
                    <div className={`min-w-0 flex-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug transition-colors group-hover:text-[#0073aa] group-focus:text-[#0073aa]">
                        {locale === 'ar' ? post.title : (post.title_en || post.title)}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="rounded bg-[#f0f9ff] px-1.5 py-0.5 font-medium text-[#0073aa]">
                          {post.type === 'activity' ? t('activityBadge') : t('newsBadge')}
                        </span>
                        <span>•</span>
                        <span>{formatSiteDate(post.publishedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">{t('latestPosts')}</h3>
        <ol className="space-y-3 text-sm">
          {latestPosts.map((post) => (
            <li key={post.id} className="leading-relaxed text-[#333333]">
              <span className="text-[#777777]">{post.commentCount ?? 0} · </span>
              <Link href={`/news/${post.slug}`} className="font-medium text-[#0073aa] hover:text-[#005580]">
                {locale === 'ar' ? post.title : (post.title_en || post.title)}
              </Link>
              <span className="text-[#777777]"> · {formatSiteDate(post.publishedAt)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg bg-[#f9f9f9] p-5">
        <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">{t('categories')}</h3>
        <ul className={`list-disc space-y-2 text-sm text-[#0073aa] ${locale === 'ar' ? 'pr-5' : 'pl-5'}`}>
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
