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
import { useTranslations, useLocale } from 'next-intl'

interface DeleteGalleryImagesDialogProps {
  open: boolean
  count: number
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteGalleryImagesDialog({
  open,
  count,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteGalleryImagesDialogProps) {
  const t = useTranslations('dashboardGallery')
  const locale = useLocale()
  const CONFIRM_WORD = t('confirmWord')
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (!open) setConfirmText('')
  }, [open])

  const canConfirm = confirmText === CONFIRM_WORD

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-destructive ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <AlertTriangle className="size-5 shrink-0" />
            {t('confirmTitle', { count })}
          </DialogTitle>
          <div className={`rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            <strong className="font-semibold">{t('warningMsg1')}</strong> {t('warningMsg2')}
          </div>
          <DialogDescription className={locale === 'ar' ? 'text-right' : 'text-left'}>
            {t.rich('typeToConfirm', {
               word: <span className="font-mono font-semibold text-foreground">{CONFIRM_WORD}</span> as any
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delete-confirm" className={locale === 'ar' ? 'text-right block' : 'text-left block'}>{t('confirmLabel')}</Label>
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

        <DialogFooter className={`gap-2 sm:justify-start ${locale === 'ar' ? '' : 'sm:justify-end'}`}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!canConfirm || pending}
          >
            {pending ? t('deleting') : t('deleteBtn', { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

