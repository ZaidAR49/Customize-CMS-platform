'use client'

import Link from 'next/link'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Pencil, Trash2, Eye } from 'lucide-react'
import type { Post } from '@/types/post'
import { formatSiteDate, formatSiteNumber } from '@/lib/date-format'
import { TruncateFullTextPopup } from '@/components/ui/truncate-full-text'
import { useTranslations, useLocale } from 'next-intl'

interface PostsTableProps {
  posts: Post[]
  pendingDeleteId?: string | null
  onDelete?: (post: Post) => void
  editUrlPrefix?: string
  isEditor?: boolean
  hideStats?: boolean
}

export function PostsTable({ posts, pendingDeleteId, onDelete, editUrlPrefix = '/dashboard/posts', isEditor = true, hideStats = false }: PostsTableProps) {
  const t = useTranslations('dashboardPosts')
  const locale = useLocale()

  const typeLabels: Record<string, string> = {
    news: t('types.news'),
    activity: t('types.activity'),
    program: t('types.program'),
    center: t('types.center'),
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-(--fcps-bg-soft)">
            <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.title')}</TableHead>
            <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.type')}</TableHead>
            <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.date')}</TableHead>
            {!hideStats && (
              <>
                <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.likes')}</TableHead>
                <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.status')}</TableHead>
              </>
            )}
            <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="hover:bg-(--fcps-bg-soft)/50">
              <TableCell className="max-w-[min(280px,40vw)] font-medium">
                <div className="flex items-center gap-2">
                  <TruncateFullTextPopup text={locale === 'ar' ? post.title : (post.title_en || post.title)} dialogTitle={t('tableHeaders.title')} />
                  {post.isBotGenerated && (
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 whitespace-nowrap text-[10px] h-5">
                      {locale === 'ar' ? 'بوت' : 'Bot'}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[post.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-(--fcps-gray-text)">
                {formatSiteDate(post.publishedAt)}
              </TableCell>
              {!hideStats && (
                <>
                  <TableCell className="text-sm">{formatSiteNumber(post.likes)}</TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none text-xs">
                         {t('statusPublished')}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none text-xs">
                        {t('statusDraft')}
                      </Badge>
                    )}
                  </TableCell>
                </>
              )}
              <TableCell>
                <div className="flex gap-2">
                  {post.published && post.slug ? (
                    <a
                      href={
                        post.type === 'program'
                          ? `/${locale}/programs/${post.slug}`
                          : post.type === 'center'
                          ? `/${locale}/centers/${post.slug}`
                          : `/${locale}/news/${post.slug}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'h-8 w-8 p-0 text-(--fcps-gray-text) hover:text-(--fcps-primary)'
                      )}
                      title={locale === 'ar' ? 'عرض المنشور' : 'View Post'}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  ) : null}
                  {post.id && isEditor ? (
                    <Link
                      href={`${editUrlPrefix}/${post.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'h-8 w-8 p-0 text-(--fcps-gray-text) hover:text-(--fcps-primary)'
                      )}
                      title={locale === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {onDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-(--fcps-gray-text) hover:text-red-500"
                      onClick={() => onDelete(post)}
                      disabled={pendingDeleteId === post.id}
                      title={locale === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

