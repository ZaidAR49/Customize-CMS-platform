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
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('dashboardCategories')
  const locale = useLocale()

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('confirmDeleteDesc', { name: locale === 'ar' ? (category?.label_ar || '') : (category?.label_en || category?.label_ar || '') })}
            {category?.key ? (
              <span className="mt-2 block rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/90" dir="ltr">
                {category.key}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={`gap-2 sm:justify-start ${locale === 'ar' ? '' : 'sm:justify-end'}`}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? t('deleting') : t('finalDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

