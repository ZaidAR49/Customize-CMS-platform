'use client'

import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AppUser } from '@/types/user'
import { roleColors } from './users-table.constants'
import { formatSiteDate } from '@/lib/date-format'
import { useTranslations, useLocale } from 'next-intl'

interface UsersTableRowsProps {
  users: AppUser[]
  currentUserId: string
  isAdmin: boolean
  hasOtherAdmin: boolean
  onEdit: (user: AppUser) => void
  onDelete: (user: AppUser) => void
}

export function UsersTableRows({
  users,
  currentUserId,
  isAdmin,
  hasOtherAdmin,
  onEdit,
  onDelete,
}: UsersTableRowsProps) {
  const t = useTranslations('dashboardUsers')
  const locale = useLocale()

  const getRoleLabel = (r: string) => {
    switch(r) {
      case 'admin': return t('roleAdmin')
      case 'editor': return t('roleEditor')
      case 'viewer': return t('roleViewer')
      default: return r
    }
  }

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <TableHeader>
          <TableRow className="bg-(--fcps-bg-soft)">
            <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-bold`}>{t('colUser')}</TableHead>
            <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-bold`}>{t('colEmail')}</TableHead>
            <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-bold`}>{t('colRole')}</TableHead>
            <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-bold`}>{t('colJoined')}</TableHead>
            <TableHead className={`${locale === 'ar' ? 'text-right' : 'text-left'} font-bold`}>{t('colActions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-(--fcps-gray-text)">
                {t('emptyUsers')}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId
              const canDeleteSelf = isAdmin && isSelf && hasOtherAdmin
              const deleteDisabled = isSelf ? !canDeleteSelf : false
              const deleteTitle = isSelf
                ? hasOtherAdmin
                  ? t('deleteSelfSignout')
                  : t('deleteSelfBlocked')
                : t('deleteUser')

              return (
                <TableRow key={user.id} className="hover:bg-(--fcps-bg-soft)/50">
                  <TableCell className="max-w-[240px]">
                    <div className="flex w-full min-w-0 flex-row items-center gap-3" dir="ltr">
                      <span className={`min-w-0 flex-1 truncate font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`} dir="auto">
                        {user.name}
                      </span>
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="size-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-(--fcps-primary) text-xs font-bold text-white">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-(--fcps-gray-text)" dir="ltr">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${roleColors[user.role]} border-none text-xs`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-(--fcps-gray-text)">
                    {formatSiteDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className={`flex gap-2 ${locale === 'ar' ? '' : 'justify-start'}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                        onClick={() => onEdit(user)}
                        title={t('editData')}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="text-xs">{t('editAction')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-(--fcps-gray-text) hover:text-red-600 disabled:opacity-40"
                        disabled={deleteDisabled}
                        onClick={() => onDelete(user)}
                        title={deleteTitle}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">{t('deleteAction')}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
