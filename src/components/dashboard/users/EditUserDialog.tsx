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
import type { AppUser, UserRole } from '@/types/user'
import { UserAvatarPicker } from './UserAvatarPicker'
import { UserRoleSelect } from './UserRoleSelect'
import { useTranslations, useLocale } from 'next-intl'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editUser: AppUser | null
  currentUserId: string
  lockSelfRole: boolean
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
  onSave: () => void
  onCancel: () => void
}

export function EditUserDialog({
  open,
  onOpenChange,
  editUser,
  currentUserId,
  lockSelfRole,
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
  onSave,
  onCancel,
}: EditUserDialogProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <DialogTitle>{t('editTitle')}</DialogTitle>
          <DialogDescription>
            {editUser && editUser.id === currentUserId ? (
              <span className="mt-2 block text-amber-900">
                {t('editSelfWarning')}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <UserAvatarPicker
            displaySrc={avatarDisplaySrc}
            fallbackLetter={name.charAt(0)}
            isBlobPreview={avatarIsBlobPreview}
            disabled={pending}
            onFileSelected={onAvatarFile}
          />
          <div className="grid gap-2">
            <Label className={locale === 'ar' ? 'text-right' : 'text-left'} htmlFor="edit-name">{t('nameField')}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              dir="auto"
              className={locale === 'ar' ? '' : 'text-left'}
            />
          </div>
          <div className="grid gap-2">
            <Label className={locale === 'ar' ? 'text-right' : 'text-left'} htmlFor="edit-email">{t('emailField')}</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
          </div>
          <UserRoleSelect
            id="role-select"
            value={role}
            onChange={setRole}
            disabled={pending}
            locked={lockSelfRole}
            lockHint={t('lockHint')}
          />
        </div>
        <DialogFooter className={`gap-2 ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            {t('cancelBtn')}
          </Button>
          <Button type="button" onClick={onSave} disabled={pending || !name.trim() || !email.trim()}>
            {pending ? t('savingBtn') : t('saveBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
