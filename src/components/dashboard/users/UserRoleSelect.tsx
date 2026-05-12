'use client'

import type { UserRole } from '@/types/user'
import { roleLabels, roleSelectClassName } from './users-table.constants'

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
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        الدور
      </label>
      <select
        id={id}
        className={`${roleSelectClassName} disabled:opacity-60`}
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={disabled || locked}
      >
        {(Object.keys(roleLabels) as UserRole[]).map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
      {locked && lockHint ? <p className="text-xs text-amber-800">{lockHint}</p> : null}
    </div>
  )
}
