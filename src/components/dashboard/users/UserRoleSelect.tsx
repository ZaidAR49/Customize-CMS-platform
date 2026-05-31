'use client'

import type { UserRole } from '@/types/user'
import { roleSelectClassName } from './users-table.constants'
import { useTranslations, useLocale } from 'next-intl'

interface UserRoleSelectProps {
  id: string
  value: UserRole
  onChange: (role: UserRole) => void
  disabled: boolean
  /** When true, role cannot be changed (sole admin editing self) */
  locked?: boolean
  lockHint?: string
}

export function UserRoleSelect({
  id,
  value,
  onChange,
  disabled,
  locked = false,
  lockHint,
}: UserRoleSelectProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={`text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        {t('roleField')}
      </label>
      <select
        id={id}
        className={`${roleSelectClassName} disabled:opacity-60 ${locale === 'ar' ? '' : 'text-left'}`}
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={disabled || locked}
      >
        <option value="admin">{t('roleAdmin')}</option>
        <option value="editor">{t('roleEditor')}</option>
        <option value="viewer">{t('roleViewer')}</option>
      </select>
      {locked && lockHint ? <p className={`text-xs text-amber-800 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{lockHint}</p> : null}
    </div>
  )
}
