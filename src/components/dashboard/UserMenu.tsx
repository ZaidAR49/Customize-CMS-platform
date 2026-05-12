'use client'

import { useState } from 'react'
import Image from 'next/image'

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [imgError, setImgError] = useState(false)

  const displayName = user?.name || 'مدير النظام'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {user?.image && !imgError ? (
        <Image
          src={user.image}
          alt={displayName}
          width={36}
          height={36}
          className="rounded-full object-cover border border-gray-200"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--fcps-primary) text-sm font-bold text-white shadow-sm">
          {initial}
        </div>
      )}
      <span className="text-sm font-medium text-(--fcps-text)">{displayName}</span>
    </div>
  )
}
