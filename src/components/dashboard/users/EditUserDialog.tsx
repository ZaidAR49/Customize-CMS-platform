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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المستخدم</DialogTitle>
          <DialogDescription>
            {editUser && editUser.id === currentUserId ? (
              <span className="mt-2 block text-amber-900">
                عند تغيير بريدك قد تحتاج لتسجيل الدخول مرة أخرى بالبريد الجديد في Google.
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
            <Label htmlFor="edit-name">الاسم</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              dir="auto"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">البريد الإلكتروني</Label>
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
            lockHint="لا يمكن تغيير دورك طالما أنت المسؤول الوحيد. أضف مسؤولاً آخر أولاً."
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" onClick={onSave} disabled={pending || !name.trim() || !email.trim()}>
            {pending ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
