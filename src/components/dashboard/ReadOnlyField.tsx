import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ReadOnlyFieldProps {
  id: string
  label: string
  value: string
  className?: string
  dir?: 'rtl' | 'ltr' | 'auto'
}

export function ReadOnlyField({ id, label, value, className, dir = 'rtl' }: ReadOnlyFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        readOnly
        disabled
        dir={dir}
        tabIndex={-1}
        aria-readonly
        className="cursor-not-allowed bg-muted/50 text-muted-foreground"
      />
    </div>
  )
}
