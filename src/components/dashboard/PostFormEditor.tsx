'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { PostForm } from '@/components/dashboard/PostForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createPostAction, updatePostAction } from '@/actions/posts.actions'
import {
  emptyPostFormValue,
  postToFormValue,
  type PostFormValue,
} from '@/lib/posts-form'
import type { Post } from '@/types/post'

interface PostFormEditorProps {
  mode: 'create' | 'edit'
  post?: Post
  categories: Array<{ id: string; label: string }>
}

export function PostFormEditor({ mode, post, categories }: PostFormEditorProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [formValue, setFormValue] = useState<PostFormValue>(
    mode === 'edit' && post ? postToFormValue(post) : emptyPostFormValue
  )

  function updateForm<K extends keyof PostFormValue>(key: K, next: PostFormValue[K]) {
    setFormValue((prev) => ({ ...prev, [key]: next }))
  }

  function submitForm() {
    startTransition(async () => {
      const payload = {
        ...formValue,
        published_at: formValue.published ? new Date().toISOString() : '',
      }

      const result =
        mode === 'edit' && post?.id
          ? await updatePostAction(post.id, payload)
          : await createPostAction(payload)

      if (!result.success) {
        toast.error(result.error ?? 'تعذر حفظ المقال')
        return
      }

      toast.success(mode === 'edit' ? 'تم تحديث المقال' : 'تم إنشاء المقال')
      router.push('/dashboard/posts')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center gap-2 text-sm text-(--fcps-gray-text) transition-colors hover:text-(--fcps-primary)"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى المقالات
      </Link>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-(--fcps-dark)">
            {mode === 'create' ? 'إضافة مقال جديد' : 'تعديل المقال'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'أدخل بيانات المقال ثم احفظه كمنشور أو مسودة.'
              : 'حدّث بيانات المقال ثم احفظ التعديلات.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm
            mode={mode}
            value={formValue}
            categories={categories}
            pending={pending}
            onChange={updateForm}
            onSubmit={submitForm}
            onCancel={() => router.push('/dashboard/posts')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
