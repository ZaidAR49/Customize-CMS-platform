'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Post, PostType } from '@/types/post'
import { PostCard } from './PostCard'
import { PostFilter } from './PostFilter'

interface PostGridProps {
  posts: Post[]
  initialSearchQuery?: string
  initialCategory?: string
  dbCategories?: Array<{ key: string; label: string }>
}

const POSTS_PER_PAGE = 8

function normalizeSlugSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isSmartSlugMatch(slug: string, query: string): boolean {
  const nSlug = normalizeSlugSearch(slug)
  const nQuery = normalizeSlugSearch(query)
  if (!nQuery) return true
  if (nSlug.includes(nQuery)) return true

  const compactSlug = nSlug.replace(/-/g, '')
  const compactQuery = nQuery.replace(/-/g, '')
  if (compactSlug.includes(compactQuery)) return true

  const queryParts = nQuery.split('-').filter(Boolean)
  if (queryParts.length > 1 && queryParts.every((part) => nSlug.includes(part))) return true

  let i = 0
  for (const ch of compactSlug) {
    if (ch === compactQuery[i]) i += 1
    if (i === compactQuery.length) return true
  }
  return false
}

export function PostGrid({
  posts,
  initialSearchQuery = '',
  initialCategory = 'all',
  dbCategories,
}: PostGridProps) {
  const [activeFilter, setActiveFilter] = useState<PostType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [activeCategory, setActiveCategory] = useState(
    initialCategory === 'all' || !initialCategory ? 'all' : initialCategory
  )
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setSearchQuery(initialSearchQuery)
  }, [initialSearchQuery])

  useEffect(() => {
    setActiveCategory(initialCategory === 'all' || !initialCategory ? 'all' : initialCategory)
  }, [initialCategory])

  const categories = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories
    }
    // Fallback: derive from posts
    const values = new Map<string, string>()
    for (const post of posts) {
      if (!post.category) continue
      values.set(post.category, post.categoryLabel ?? post.category)
    }
    return Array.from(values.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
  }, [posts, dbCategories])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const typeMatch = activeFilter === 'all' || post.type === activeFilter
      const categoryMatch = activeCategory === 'all' || post.category === activeCategory
      const searchMatch = isSmartSlugMatch(post.slug, searchQuery)
      return typeMatch && categoryMatch && searchMatch
    })
  }, [posts, activeFilter, activeCategory, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedPosts = filteredPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE)

  function changeFilter(next: PostType | 'all') {
    setActiveFilter(next)
    setCurrentPage(1)
  }

  function changeCategory(next: string) {
    setActiveCategory(next)
    setCurrentPage(1)
  }

  function changeSearch(next: string) {
    setSearchQuery(next)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    activeFilter !== 'all' || activeCategory !== 'all' || searchQuery.trim() !== ''

  function clearFilters() {
    setActiveFilter('all')
    setActiveCategory('all')
    setSearchQuery('')
    setCurrentPage(1)
  }

  function goToPage(next: number) {
    if (next < 1 || next > totalPages) return
    setCurrentPage(next)
  }

  return (
    <div>
      <PostFilter
        activeFilter={activeFilter}
        onFilterChange={changeFilter}
        searchQuery={searchQuery}
        onSearchChange={changeSearch}
        activeCategory={activeCategory}
        onCategoryChange={changeCategory}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
      />

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg text-(--fcps-gray-text)">لا توجد نتائج مطابقة للتصفية الحالية</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-(--fcps-gray-text)">
            عرض {paginatedPosts.length} من أصل {filteredPosts.length} نتيجة
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
            >
              السابق
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1
              return (
                <button
                  key={page}
                  type="button"
                  className={`rounded-md border px-3 py-1 text-sm ${
                    page === safePage ? 'bg-(--fcps-primary) text-white border-(--fcps-primary)' : ''
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              )
            })}
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              التالي
            </button>
          </div>
        </>
      )}
    </div>
  )
}
