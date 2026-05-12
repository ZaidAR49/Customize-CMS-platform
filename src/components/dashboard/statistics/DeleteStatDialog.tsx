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
import type { OrganizationStatRow } from '@/types/organization'

interface DeleteStatDialogProps {
  stat: OrganizationStatRow | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteStatDialog({
  stat,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteStatDialogProps) {
  return (
    <Dialog open={!!stat} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تأكيد حذف الإحصائية</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف الإحصائية <strong className="text-foreground">{stat?.label_ar}</strong>؟ لا يمكن
            التراجع عن هذا الإجراء.
            {stat?.key ? (
              <span className="mt-2 block rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/90" dir="ltr">
                {stat.key}
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
