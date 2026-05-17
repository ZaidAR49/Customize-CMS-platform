'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteGalleryImagesDialogProps {
  open: boolean
  count: number
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const CONFIRM_WORD = 'DELETE'

export function DeleteGalleryImagesDialog({
  open,
  count,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteGalleryImagesDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (!open) setConfirmText('')
  }, [open])

  const canConfirm = confirmText === CONFIRM_WORD

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            تأكيد حذف {count} صورة
          </DialogTitle>
          <div className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            <strong className="font-semibold">⚠ هذا الإجراء لا يمكن التراجع عنه.</strong> قد تكون هذه
            الصور مستخدمة حالياً في مقال أو صفحة أو محتوى آخر في تطبيقك. حذفها من Cloudinary سيكسر
            فوراً أي محتوى يعتمد عليها — بما في ذلك الصفحات المنشورة والمباشرة. يرجى التأكد من أن أي
            من هذه الصور غير مستخدمة قبل المتابعة.
          </div>
          <DialogDescription>
            للمتابعة، اكتب{' '}
            <span className="font-mono font-semibold text-foreground">{CONFIRM_WORD}</span> في الحقل
            أدناه.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delete-confirm">تأكيد الحذف</Label>
          <Input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            className="font-mono"
            dir="ltr"
            autoComplete="off"
            disabled={pending}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!canConfirm || pending}
          >
            {pending ? 'جاري الحذف...' : `حذف ${count} صورة`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
