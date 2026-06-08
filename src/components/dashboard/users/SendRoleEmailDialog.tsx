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
import type { UserRole } from '@/types/user'
import { useTranslations, useLocale } from 'next-intl'

export interface RoleEmailPrompt {
  name: string
  email: string
  role: UserRole
}

interface SendRoleEmailDialogProps {
  prompt: RoleEmailPrompt | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SendRoleEmailDialog({
  prompt,
  pending,
  onOpenChange,
  onConfirm,
}: SendRoleEmailDialogProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()
  
  const getRoleLabel = (r: UserRole) => {
    switch(r) {
      case 'admin': return t('roleAdmin')
      case 'editor': return t('roleEditor')
      case 'viewer': return t('roleViewer')
      default: return r
    }
  }

  const roleLabel = prompt ? getRoleLabel(prompt.role) : ''

  return (
    <Dialog open={!!prompt} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <DialogTitle>{t('emailPromptTitle')}</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              {t.rich('emailPromptDesc', {
                name: <strong>{prompt?.name}</strong> as any,
                email: <span dir="ltr">({prompt?.email})</span> as any,
                role: <strong>{roleLabel}</strong> as any
              })}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={`gap-2 ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t('emailPromptNo')}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={pending}>
            {pending ? t('emailPromptSending') : t('emailPromptYes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
