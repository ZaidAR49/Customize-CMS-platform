'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { CategoryRow } from '@/types/category'

interface DeleteCategoryDialogProps {
  category: CategoryRow | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteCategoryDialog({
  category,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تأكيد حذف التصنيف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف التصنيف <strong className="text-foreground">{category?.label_ar}</strong>؟ لا يمكن
            التراجع عن هذا الإجراء.
            {category?.key ? (
              <span className="mt-2 block rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/90" dir="ltr">
                {category.key}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'جاري الحذف...' : 'حذف نهائي'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
