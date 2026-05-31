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
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations(type === 'program' ? 'dashboardPrograms' : 'dashboardCenters')
  const locale = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [formValue, setFormValue] = useState<SimplePostFormValue>(
    mode === 'edit' && post 
      ? { title: post.title, title_en: post.title_en ?? '', slug: post.slug, descripcion: post.descripcion, descripcion_en: post.descripcion_en ?? '' }
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
        title_en: formValue.title_en,
        slug: slug,
        descripcion: formValue.descripcion,
        descripcion_en: formValue.descripcion_en,
        type: type,
        published: true,
      }

      const result =
        mode === 'edit' && post?.id
          ? await updatePostAction(post.id, payload)
          : await createPostAction(payload)

      if (!result.success) {
        toast.error(result.error ?? t('error'))
        return
      }

      toast.success(mode === 'edit' ? t('successUpdate') : t('successCreate'))
      router.push(`/${locale}${returnUrl}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Link
        href={`/${locale}${returnUrl}`}
        className="inline-flex items-center gap-2 text-sm text-(--fcps-gray-text) transition-colors hover:text-(--fcps-primary)"
      >
        <ArrowRight className={`h-4 w-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
        {returnLabel}
      </Link>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className={`text-2xl text-(--fcps-dark) ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{title}</CardTitle>
          <CardDescription className={locale === 'ar' ? 'text-right' : 'text-left'}>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SimplePostForm
            mode={mode}
            value={formValue}
            pending={pending}
            onChange={updateForm}
            onSubmit={submitForm}
            onCancel={() => router.push(`/${locale}${returnUrl}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

