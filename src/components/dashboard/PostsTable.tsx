'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Post } from '@/types/post'
import { formatSiteDate, formatSiteNumber } from '@/lib/date-format'
import { TruncateFullTextPopup } from '@/components/ui/truncate-full-text'

const typeLabels: Record<string, string> = {
  news: 'أخبار',
  activity: 'نشاطات',
  program: 'برامج',
  center: 'مراكز',
}

interface PostsTableProps {
  posts: Post[]
  pendingDeleteId?: string | null
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
}

export function PostsTable({ posts, pendingDeleteId, onEdit, onDelete }: PostsTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-(--fcps-bg-soft)">
            <TableHead className="text-right font-bold">العنوان</TableHead>
            <TableHead className="text-right font-bold">النوع</TableHead>
            <TableHead className="text-right font-bold">التاريخ</TableHead>
            <TableHead className="text-right font-bold">الإعجابات</TableHead>
            <TableHead className="text-right font-bold">الحالة</TableHead>
            <TableHead className="text-right font-bold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="hover:bg-(--fcps-bg-soft)/50">
              <TableCell className="max-w-[min(280px,40vw)] font-medium">
                <TruncateFullTextPopup text={post.title} dialogTitle="العنوان" />
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[post.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-(--fcps-gray-text)">
                {formatSiteDate(post.publishedAt)}
              </TableCell>
              <TableCell className="text-sm">{formatSiteNumber(post.likes)}</TableCell>
              <TableCell>
                {post.published ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none text-xs">
                    منشور
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none text-xs">
                    مسودة
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onEdit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-(--fcps-gray-text) hover:text-(--fcps-primary)"
                      onClick={() => onEdit(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-(--fcps-gray-text) hover:text-red-500"
                      onClick={() => onDelete(post)}
                      disabled={pendingDeleteId === post.id}
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
