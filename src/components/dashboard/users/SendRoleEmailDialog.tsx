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
import { roleLabels } from './users-table.constants'

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
  const roleLabel = prompt ? roleLabels[prompt.role] : ''

  return (
    <Dialog open={!!prompt} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إرسال إشعار بالبريد الإلكتروني؟</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              هل تريد إرسال بريد إلكتروني إلى <strong>{prompt?.name}</strong> (
              <span dir="ltr">{prompt?.email}</span>) لإعلامه بأنه تم تعيين دور{' '}
              <strong>{roleLabel}</strong> لحسابه؟
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            لا، شكراً
          </Button>
          <Button type="button" onClick={onConfirm} disabled={pending}>
            {pending ? 'جاري الإرسال...' : 'نعم، أرسل البريد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
