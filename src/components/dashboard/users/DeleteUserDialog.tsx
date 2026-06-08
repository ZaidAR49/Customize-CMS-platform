'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { AppUser } from '@/types/user'
import { useTranslations, useLocale } from 'next-intl'

interface DeleteUserDialogProps {
  user: AppUser | null
  currentUserId: string
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteUserDialog({
  user,
  currentUserId,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  const isSelf = !!user && user.id === currentUserId
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          <DialogDescription>
            {t.rich('deleteConfirmDesc', {
              name: <strong>{user?.name}</strong> as any
            })}
            {isSelf ? (
              <span className={`mt-2 block font-medium text-amber-800 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('deleteSelfSignout')}
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
