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
import { roleLabels, roleSelectClassName } from './users-table.constants'

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم</DialogTitle>
          <DialogDescription>

            يجب أن يكون بريد المستخدم
            مطابقاً لحساب Google.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <UserAvatarPicker
            displaySrc={avatarDisplaySrc}
            fallbackLetter={name.charAt(0)}
            isBlobPreview={avatarIsBlobPreview}
            disabled={pending}
            onFileSelected={onAvatarFile}
            footerHint="اضغط أيقونة الكاميرا لاختيار صورة (حتى 4 ميغابايت). اضغط إضافة لرفع الصورة وإنشاء المستخدم."
          />
          <div className="grid gap-2">
            <Label htmlFor="add-name">الاسم</Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={pending}
              dir="rtl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="add-email">البريد الإلكتروني</Label>
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
            <Label htmlFor="add-role">الدور</Label>
            <select
              id="add-role"
              className={roleSelectClassName}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={pending}
            >
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" onClick={onSubmit} disabled={pending || !name.trim() || !email.trim()}>
            {pending ? 'جاري الإضافة...' : 'إضافة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
