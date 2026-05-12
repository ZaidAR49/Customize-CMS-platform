'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UsersTableToolbarProps {
  onAddClick: () => void
}

export function UsersTableToolbar({ onAddClick }: UsersTableToolbarProps) {
  return (
    <div className="mb-4 flex justify-end">
      <Button type="button" onClick={onAddClick} className="gap-2">
        <UserPlus className="h-4 w-4" />
        إضافة مستخدم
      </Button>
    </div>
  )
}
