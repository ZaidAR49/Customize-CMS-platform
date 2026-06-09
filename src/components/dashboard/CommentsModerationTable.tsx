'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton'
import { moderateCommentAction, deleteCommentAction } from '@/actions/comments.actions'
import type { CommentStatus, PostCommentWithPost, PostSummaryEmbed } from '@/types/comment'
import { formatSiteDateTime } from '@/lib/date-format'
import { TruncateFullTextPopup } from '@/components/ui/truncate-full-text'
import { useTranslations, useLocale } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ResolvedPost {
  type: string
  slug: string
  title: string
  title_en: string
}

function resolvePost(posts: PostCommentWithPost['posts']): ResolvedPost | null {
  const embed: PostSummaryEmbed | null = Array.isArray(posts) ? (posts[0] ?? null) : posts
  if (!embed) return null
  const trans = Array.isArray(embed.translations) ? embed.translations : []
  const ar = trans.find((t) => t.lang === 'ar')
  const en = trans.find((t) => t.lang === 'en')
  return {
    type: embed.type,
    slug: ar?.slug ?? en?.slug ?? '',
    title: ar?.title ?? en?.title ?? '',
    title_en: en?.title ?? ar?.title ?? '',
  }
}

function publicPostPath(type: string, slug: string) {
  const base: Record<string, string> = {
    news: '/news',
    activity: '/news',
    program: '/programs',
    center: '/centers',
  }
  return `${base[type] ?? '/news'}/${slug}`
}

const statusVariant: Record<
  CommentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

interface Props {
  comments: PostCommentWithPost[]
}

export function CommentsModerationTable({ comments }: Props) {
  const t = useTranslations('dashboardComments')
  const locale = useLocale()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | CommentStatus>('all')
  const [pending, startTransition] = useTransition()
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  const statusLabels: Record<CommentStatus, string> = {
    pending: t('filterPending'),
    approved: t('filterApproved'),
    rejected: t('filterRejected'),
  }

  const rows = useMemo(() => {
    if (filter === 'all') return comments
    return comments.filter((c) => c.status === filter)
  }, [comments, filter])

  function act(id: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      const res = await moderateCommentAction({ id, status })
      if (res.success) {
        toast.success(status === 'approved' ? t('successApprove') : t('successReject'))
        router.refresh()
      } else {
        toast.error(res.error ?? t('errorUpdate'))
      }
    })
  }

  function openDeleteDialog(id: string) {
    setCommentToDelete(id)
  }

  function confirmDelete() {
    if (!commentToDelete) return
    startTransition(async () => {
      const res = await deleteCommentAction({ id: commentToDelete })
      setCommentToDelete(null)
      if (res.success) {
        toast.success(t('successDelete'))
        router.refresh()
      } else {
        toast.error(res.error ?? t('error'))
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-(--fcps-gray-text)">{t('filterLabel')}</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
            >
              {key === 'all'
                ? t('filterAll')
                : statusLabels[key as CommentStatus]}
            </Button>
          ))}
        </div>
        <ClearFiltersButton onClear={() => setFilter('all')} disabled={filter === 'all'} />
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table className="table-fixed" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft)">
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.post')}</TableHead>
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.author')}</TableHead>
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.comment')}</TableHead>
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.status')}</TableHead>
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.date')}</TableHead>
              <TableHead className={`font-bold ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('tableHeaders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-(--fcps-gray-text)">
                  {t('emptyState')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => {
                const post = resolvePost(c.posts)
                const href = post?.slug ? publicPostPath(post.type, post.slug) : '#'

                return (
                  <TableRow key={c.id} className="align-top hover:bg-(--fcps-bg-soft)/50">
                    <TableCell className="max-w-[180px] whitespace-normal wrap-break-word">
                      {post ? (
                        <TruncateFullTextPopup
                          text={locale === 'ar' ? post.title : (post.title_en || post.title)}
                          dialogTitle={t('dialogTitlePost')}
                          className="font-medium text-(--fcps-primary)"
                          renderDialogFooter={(close) => (
                            <>
                              <Button type="button" variant="outline" onClick={close}>
                                {t('close')}
                              </Button>
                              <Link
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={close}
                                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                              >
                                {t('openPost')}
                              </Link>
                            </>
                          )}
                        />
                      ) : (
                        <span className="text-sm text-(--fcps-gray-text)">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[140px] whitespace-normal wrap-break-word">
                      <div className="font-medium">
                        <TruncateFullTextPopup text={c.author_name} dialogTitle={t('dialogTitleAuthor')} />
                      </div>
                      {c.author_email ? (
                        <div className="text-xs text-(--fcps-gray-text) break-all" dir="ltr">
                          <TruncateFullTextPopup text={c.author_email} dialogTitle={t('dialogTitleEmail')} />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">
                      <TruncateFullTextPopup
                        text={c.body}
                        dialogTitle={t('dialogTitleComment')}
                        className="whitespace-pre-line"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[c.status]} className="text-xs">
                        {statusLabels[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-(--fcps-gray-text)">
                      {formatSiteDateTime(c.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 sm:flex-row">
                        {/* Approved: only Delete */}
                        {c.status === 'approved' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={pending}
                            onClick={() => openDeleteDialog(c.id)}
                          >
                            {t('delete')}
                          </Button>
                        )}
                        {/* Rejected: only Approve */}
                        {c.status === 'rejected' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            disabled={pending}
                            onClick={() => act(c.id, 'approved')}
                          >
                            {t('approve')}
                          </Button>
                        )}
                        {/* Pending: Approve + Reject */}
                        {c.status === 'pending' && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              disabled={pending}
                              onClick={() => act(c.id, 'approved')}
                            >
                              {t('approve')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={pending}
                              onClick={() => act(c.id, 'rejected')}
                            >
                              {t('reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>{t('confirmDelete')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className={`gap-2 ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommentToDelete(null)}
              disabled={pending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={pending}
            >
              {pending ? t('deleting') : t('finalDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-(--fcps-gray-text)">
        {t.rich('apiNote', {
           api: (
             <code className="rounded bg-(--fcps-bg-soft) px-1" dir="ltr">
               POST /api/comments
             </code>
           ) as any
        })}
      </p>
    </div>
  )
}
