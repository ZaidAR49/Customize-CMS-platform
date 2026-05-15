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
import { moderateCommentAction } from '@/actions/comments.actions'
import type { CommentStatus, PostCommentWithPost } from '@/types/comment'
import { formatSiteDateTime } from '@/lib/date-format'
import { TruncateFullTextPopup } from '@/components/ui/truncate-full-text'

function postEmbed(posts: PostCommentWithPost['posts']) {
  if (!posts) return null
  return Array.isArray(posts) ? posts[0] ?? null : posts
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

const statusLabels: Record<CommentStatus, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
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
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | CommentStatus>('all')
  const [pending, startTransition] = useTransition()

  const rows = useMemo(() => {
    if (filter === 'all') return comments
    return comments.filter((c) => c.status === filter)
  }, [comments, filter])

  function act(id: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      const res = await moderateCommentAction({ id, status })
      if (res.success) {
        toast.success(status === 'approved' ? 'تم قبول التعليق' : 'تم رفض التعليق')
        router.refresh()
      } else {
        toast.error(res.error ?? 'فشل التحديث')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-(--fcps-gray-text)">عرض:</span>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
            >
              {key === 'all'
                ? 'الكل'
                : statusLabels[key as CommentStatus]}
            </Button>
          ))}
        </div>
        <ClearFiltersButton onClear={() => setFilter('all')} disabled={filter === 'all'} />
      </div>

      <div className="rounded-lg border bg-white">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-(--fcps-bg-soft)">
              <TableHead className="text-right font-bold">المقال</TableHead>
              <TableHead className="text-right font-bold">المشارك</TableHead>
              <TableHead className="text-right font-bold">التعليق</TableHead>
              <TableHead className="text-right font-bold">الحالة</TableHead>
              <TableHead className="text-right font-bold">التاريخ</TableHead>
              <TableHead className="text-right font-bold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-(--fcps-gray-text)">
                  لا توجد تعليقات ضمن هذا الفلتر.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => {
                const post = postEmbed(c.posts)
                const href = post ? publicPostPath(post.type, post.slug) : '#'

                return (
                  <TableRow key={c.id} className="align-top hover:bg-(--fcps-bg-soft)/50">
                    <TableCell className="max-w-[180px] whitespace-normal wrap-break-word">
                      {post ? (
                        <TruncateFullTextPopup
                          text={post.title}
                          dialogTitle="عنوان المقال"
                          className="font-medium text-(--fcps-primary)"
                          renderDialogFooter={(close) => (
                            <>
                              <Button type="button" variant="outline" onClick={close}>
                                إغلاق
                              </Button>
                              <Link
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={close}
                                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                              >
                                فتح المقال
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
                        <TruncateFullTextPopup text={c.author_name} dialogTitle="اسم المشارك" />
                      </div>
                      {c.author_email ? (
                        <div className="text-xs text-(--fcps-gray-text) break-all" dir="ltr">
                          <TruncateFullTextPopup text={c.author_email} dialogTitle="البريد الإلكتروني" />
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">
                      <TruncateFullTextPopup
                        text={c.body}
                        dialogTitle="نص التعليق"
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
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          disabled={pending || c.status === 'approved'}
                          onClick={() => act(c.id, 'approved')}
                        >
                          قبول
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={pending || c.status === 'rejected'}
                          onClick={() => act(c.id, 'rejected')}
                        >
                          رفض
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

      <p className="text-xs text-(--fcps-gray-text)">
        إرسال تعليقات جديدة من الواجهة العامة عبر{' '}
        <code className="rounded bg-(--fcps-bg-soft) px-1" dir="ltr">
          POST /api/comments
        </code>{' '}
        (تُخزَّن كـ «قيد المراجعة» حتى يعتمدها مسؤول هنا).
      </p>
    </div>
  )
}
