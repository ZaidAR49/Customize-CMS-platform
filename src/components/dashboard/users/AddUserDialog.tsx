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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/types/user'
import { UserAvatarPicker } from './UserAvatarPicker'
import { roleSelectClassName } from './users-table.constants'
import { useTranslations, useLocale } from 'next-intl'

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  setName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  role: UserRole
  setRole: (v: UserRole) => void
  avatarDisplaySrc: string | null
  avatarIsBlobPreview: boolean
  onAvatarFile: (file: File | null) => void
  pending: boolean
  onSubmit: () => void
}

export function AddUserDialog({
  open,
  onOpenChange,
  name,
  setName,
  email,
  setEmail,
  role,
  setRole,
  avatarDisplaySrc,
  avatarIsBlobPreview,
  onAvatarFile,
  pending,
  onSubmit,
}: AddUserDialogProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>
            {t('addDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <UserAvatarPicker
            displaySrc={avatarDisplaySrc}
            fallbackLetter={name.charAt(0)}
            isBlobPreview={avatarIsBlobPreview}
            disabled={pending}
            onFileSelected={onAvatarFile}
            footerHint={t('avatarHint')}
          />
          <div className="grid gap-2">
            <Label className={locale === 'ar' ? 'text-right' : 'text-left'} htmlFor="add-name">{t('nameField')}</Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={pending}
              dir="auto"
              className={locale === 'ar' ? '' : 'text-left'}
            />
          </div>
          <div className="grid gap-2">
            <Label className={locale === 'ar' ? 'text-right' : 'text-left'} htmlFor="add-email">{t('emailField')}</Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="grid gap-2">
            <Label className={locale === 'ar' ? 'text-right' : 'text-left'} htmlFor="add-role">{t('roleField')}</Label>
            <select
              id="add-role"
              className={roleSelectClassName}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={pending}
            >
              <option value="admin">{t('roleAdmin')}</option>
              <option value="editor">{t('roleEditor')}</option>
              <option value="viewer">{t('roleViewer')}</option>
            </select>
          </div>
        </div>
        <DialogFooter className={`gap-2 ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t('cancelBtn')}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={pending || !name.trim() || !email.trim()}>
            {pending ? t('addingBtn') : t('addBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
