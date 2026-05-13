'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PostType } from '@/types/post'
import { cn } from '@/lib/utils'

const filters: { label: string; value: PostType | 'all' }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'أخبار', value: 'news' },
  { label: 'نشاطات', value: 'activity' },
  { label: 'برامج', value: 'program' },
  { label: 'مراكز', value: 'center' },
]

interface PostFilterProps {
  activeFilter: PostType | 'all'
  onFilterChange: (filter: PostType | 'all') => void
  searchQuery: string
  onSearchChange: (value: string) => void
  activeCategory: string
  onCategoryChange: (value: string) => void
  categories: Array<{ key: string; label: string }>
}

export function PostFilter({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  categories,
}: PostFilterProps) {
  return (
    <div className="mb-8 space-y-4">
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث بالـ slug (مثل: news-2026)"
        dir="ltr"
        className="text-left"
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'rounded-full transition-all',
              activeFilter === filter.value
                ? 'bg-(--fcps-primary) text-white hover:bg-(--fcps-primary-dark)'
                : 'border-(--fcps-primary)/20 text-(--fcps-gray-text) hover:bg-(--fcps-bg-soft) hover:text-(--fcps-primary)'
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="max-w-xs">
        <select
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((category) => (
            <option key={category.key} value={category.key}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
