'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  'aria-label'?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  className?: string
  inputClassName?: string
  showClear?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'بحث...',
  'aria-label': ariaLabel = 'بحث',
  dir,
  className,
  inputClassName,
  showClear = true,
}: SearchBarProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(value)
  }

  const field = (
    <>
      <Search
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-(--fcps-gray-text)"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        dir={dir}
        className={cn('h-10 pe-9 ps-9', inputClassName)}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-(--fcps-gray-text) transition-colors hover:text-(--fcps-text)"
          aria-label="مسح البحث"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </>
  )

  if (onSubmit) {
    return (
      <form onSubmit={handleSubmit} className={cn('relative', className)}>
        {field}
      </form>
    )
  }

  return <div className={cn('relative', className)}>{field}</div>
}
