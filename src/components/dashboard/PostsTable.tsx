import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Post } from '@/types/post'

const typeLabels: Record<string, string> = {
  news: 'أخبار',
  activity: 'نشاطات',
  program: 'برامج',
  center: 'مراكز',
}

interface PostsTableProps {
  posts: Post[]
}

export function PostsTable({ posts }: PostsTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--fcps-bg-soft)]">
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
            <TableRow key={post.id} className="hover:bg-[var(--fcps-bg-soft)]/50">
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[post.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-[var(--fcps-gray-text)]">
                {new Date(post.publishedAt).toLocaleDateString('ar-JO')}
              </TableCell>
              <TableCell className="text-sm">{post.likes}</TableCell>
              <TableCell>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none text-xs">
                  منشور
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--fcps-gray-text)] hover:text-[var(--fcps-primary)]">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--fcps-gray-text)] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
