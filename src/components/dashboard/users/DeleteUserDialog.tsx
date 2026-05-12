'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { AppUser } from '@/types/user'

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

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف المستخدم <strong>{user?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            {isSelf ? (
              <span className="mt-2 block font-medium text-amber-800">
                سيتم تسجيل خروجك تلقائياً بعد حذف حسابك.
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'جاري الحذف...' : 'حذف نهائي'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
