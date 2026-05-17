'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface SimplePostFormValue {
  title: string
  slug: string
  descripcion: string
}

export const emptySimplePostFormValue: SimplePostFormValue = {
  title: '',
  slug: '',
  descripcion: '',
}

interface SimplePostFormProps {
  mode: 'create' | 'edit'
  value: SimplePostFormValue
  pending: boolean
  onChange: <K extends keyof SimplePostFormValue>(key: K, next: SimplePostFormValue[K]) => void
  onSubmit: () => void
  onCancel: () => void
}

export function SimplePostForm({
  mode,
  value,
  pending,
  onChange,
  onSubmit,
  onCancel,
}: SimplePostFormProps) {
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  useEffect(() => {
    setSlugTouched(mode === 'edit')
  }, [mode])

  function handleTitleChange(nextTitle: string) {
    onChange('title', nextTitle)
    if (mode === 'create' && !slugTouched) {
      const nextSlug = nextTitle
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      onChange('slug', nextSlug)
    }
  }

  return (
    <form
      dir="rtl"
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="post-title">العنوان</Label>
          <Input
            id="post-title"
            value={value.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={pending}
            dir="auto"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-slug">الرابط (Slug) - اختياري</Label>
          <Input
            id="post-slug"
            value={value.slug}
            onChange={(e) => {
              setSlugTouched(true)
              onChange('slug', e.target.value.trim())
            }}
            disabled={pending}
            dir="ltr"
            className="text-left"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-descripcion">الوصف</Label>
          <Textarea
            id="post-descripcion"
            value={value.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
            disabled={pending}
            rows={6}
            required
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button
          type="submit"
          className="bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white"
          disabled={pending || !value.title.trim() || !value.descripcion.trim()}
        >
          {pending ? 'جاري الحفظ...' : mode === 'create' ? 'إنشاء' : 'حفظ التعديلات'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
