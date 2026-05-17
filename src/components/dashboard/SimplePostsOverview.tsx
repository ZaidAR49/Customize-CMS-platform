'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { PostsTable } from '@/components/dashboard/PostsTable'
import { deletePostAction } from '@/actions/posts.actions'
import type { Post } from '@/types/post'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimplePostsOverviewProps {
  posts: Post[]
  newUrl: string
  newLabel: string
  editUrlPrefix: string
  isEditor?: boolean
}

export function SimplePostsOverview({ posts, newUrl, newLabel, editUrlPrefix, isEditor = false }: SimplePostsOverviewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  function deletePost(post: Post) {
    setPostToDelete(post)
  }

  function confirmDelete() {
    if (!postToDelete?.id) return

    setPendingDeleteId(postToDelete.id)
    startTransition(async () => {
      const result = await deletePostAction(postToDelete.id as string)
      if (!result.success) {
        toast.error(result.error ?? 'تعذر الحذف')
        setPendingDeleteId(null)
        setPostToDelete(null)
        return
      }
      toast.success('تم الحذف')
      setPendingDeleteId(null)
      setPostToDelete(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {isEditor && (
        <div className="flex items-center justify-end">
          <Link
            href={newUrl}
            className={cn(
              buttonVariants(),
              'bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white'
            )}
          >
            <Plus className="h-4 w-4 ml-2" />
            {newLabel}
          </Link>
        </div>
      )}

      <PostsTable 
        posts={posts} 
        onDelete={isEditor ? deletePost : undefined} 
        pendingDeleteId={pendingDeleteId} 
        editUrlPrefix={editUrlPrefix} 
        isEditor={isEditor}
        hideStats={true}
      />

      <Dialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف <strong>{postToDelete?.title}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={() => setPostToDelete(null)} disabled={pendingDeleteId !== null}>
              إلغاء
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={pendingDeleteId !== null}>
              {pendingDeleteId !== null ? 'جاري الحذف...' : 'حذف نهائي'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
