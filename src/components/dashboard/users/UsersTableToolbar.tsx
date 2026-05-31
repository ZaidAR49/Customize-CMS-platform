'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'

interface UsersTableToolbarProps {
  onAddClick: () => void
}

export function UsersTableToolbar({ onAddClick }: UsersTableToolbarProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()
  
  return (
    <div className={`mb-4 flex ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
      <Button type="button" onClick={onAddClick} className="gap-2">
        <UserPlus className="h-4 w-4" />
        {t('addUser')}
      </Button>
    </div>
  )
}
