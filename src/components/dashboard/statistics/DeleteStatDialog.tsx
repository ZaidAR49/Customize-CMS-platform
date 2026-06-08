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
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('dashboardStatistics');
  const locale = useLocale();

  return (
    <Dialog open={!!stat} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
          <DialogDescription>
            {t.rich('confirmDeleteDesc', {
              title: <strong className="text-foreground mx-1">{locale === 'ar' ? stat?.label_ar : stat?.label_en || stat?.label_ar}</strong> as any
            })}
            {stat?.key ? (
              <span className={`mt-2 block rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/90 ${locale === 'ar' ? 'text-left' : ''}`} dir="ltr">
                {stat.key}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={`gap-2 ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t('cancelBtn')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? t('deletingBtn') : t('finalDeleteBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
