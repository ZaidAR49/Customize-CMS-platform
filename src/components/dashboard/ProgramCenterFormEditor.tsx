'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createPostAction, updatePostAction } from '@/actions/posts.actions'
import type { Post } from '@/types/post'
import { SimplePostForm, type SimplePostFormValue, emptySimplePostFormValue } from './SimplePostForm'

interface ProgramCenterFormEditorProps {
  mode: 'create' | 'edit'
  post?: Post
  type: 'program' | 'center'
  title: string
  description: string
  returnUrl: string
  returnLabel: string
}

export function ProgramCenterFormEditor({ 
  mode, 
  post, 
  type,
  title,
  description,
  returnUrl,
  returnLabel
}: ProgramCenterFormEditorProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [formValue, setFormValue] = useState<SimplePostFormValue>(
    mode === 'edit' && post 
      ? { title: post.title, slug: post.slug, descripcion: post.descripcion }
      : emptySimplePostFormValue
  )

  function updateForm<K extends keyof SimplePostFormValue>(key: K, next: SimplePostFormValue[K]) {
    setFormValue((prev) => ({ ...prev, [key]: next }))
  }

  function submitForm() {
    startTransition(async () => {
      const slug = formValue.slug.trim() || formValue.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      
      const payload = {
        title: formValue.title,
        slug: slug,
        descripcion: formValue.descripcion,
        type: type,
        published: true,
      }

      const result =
        mode === 'edit' && post?.id
          ? await updatePostAction(post.id, payload)
          : await createPostAction(payload)

      if (!result.success) {
        toast.error(result.error ?? 'تعذر الحفظ')
        return
      }

      toast.success(mode === 'edit' ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح')
      router.push(returnUrl)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Link
        href={returnUrl}
        className="inline-flex items-center gap-2 text-sm text-(--fcps-gray-text) transition-colors hover:text-(--fcps-primary)"
      >
        <ArrowRight className="h-4 w-4" />
        {returnLabel}
      </Link>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-(--fcps-dark)">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SimplePostForm
            mode={mode}
            value={formValue}
            pending={pending}
            onChange={updateForm}
            onSubmit={submitForm}
            onCancel={() => router.push(returnUrl)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
