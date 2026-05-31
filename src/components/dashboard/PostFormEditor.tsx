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
import { useTranslations, useLocale } from 'next-intl'

interface PostFormEditorProps {
  mode: 'create' | 'edit'
  post?: Post
  categories: Array<{ id: string; label: string }>
}

export function PostFormEditor({ mode, post, categories }: PostFormEditorProps) {
  const t = useTranslations('dashboardPosts.form')
  const locale = useLocale()
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
        toast.error(result.error ?? t('saveError'))
        return
      }

      toast.success(mode === 'edit' ? t('successUpdate') : t('successCreate'))
      router.push(`/${locale}/dashboard/posts`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Link
        href={`/${locale}/dashboard/posts`}
        className="inline-flex items-center gap-2 text-sm text-(--fcps-gray-text) transition-colors hover:text-(--fcps-primary)"
      >
        <ArrowRight className={`h-4 w-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
        {t('backToPosts')}
      </Link>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className={`text-2xl text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {mode === 'create' ? t('createNewTitle') : t('editTitle')}
          </CardTitle>
          <CardDescription className={locale === 'ar' ? 'text-right' : 'text-left'}>
            {mode === 'create' ? t('createNewDesc') : t('editDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm
            mode={mode}
            value={formValue}
            categories={categories}
            authorName={mode === 'edit' ? post?.author.name : undefined}
            pending={pending}
            onChange={updateForm}
            onSubmit={submitForm}
            onCancel={() => router.push(`/${locale}/dashboard/posts`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

