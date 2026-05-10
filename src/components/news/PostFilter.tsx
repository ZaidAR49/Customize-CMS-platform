'use client'

import { Button } from '@/components/ui/button'
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
}

export function PostFilter({ activeFilter, onFilterChange }: PostFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'rounded-full transition-all',
            activeFilter === filter.value
              ? 'bg-[var(--fcps-primary)] text-white hover:bg-[var(--fcps-primary-dark)]'
              : 'border-[var(--fcps-primary)]/20 text-[var(--fcps-gray-text)] hover:bg-[var(--fcps-bg-soft)] hover:text-[var(--fcps-primary)]'
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
