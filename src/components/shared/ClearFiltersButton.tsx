'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClearFiltersButtonProps {
  onClear: () => void
  disabled?: boolean
  className?: string
  label?: string
}

export function ClearFiltersButton({ onClear, disabled, className, label }: ClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClear}
      disabled={disabled}
      className={cn(
        'gap-1.5 shrink-0 border-(--fcps-primary)/20 text-(--fcps-gray-text) hover:bg-(--fcps-bg-soft) hover:text-(--fcps-primary) disabled:opacity-50',
        className
      )}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {label || 'مسح التصفية'}
    </Button>
  )
}

