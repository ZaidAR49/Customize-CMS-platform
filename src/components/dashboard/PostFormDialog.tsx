'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Post } from '@/types/post'

export interface PostFormValue {
  slug: string
  title: string
  category_id: string
  excerpt: string
  content: string
  cover_image: string
  type: Post['type']
  published: boolean
}

interface PostFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  value: PostFormValue
  categories: Array<{ id: string; label: string }>
  pending: boolean
  onChange: <K extends keyof PostFormValue>(key: K, next: PostFormValue[K]) => void
  onSubmit: () => void
}

const typeOptions: Array<{ value: Post['type']; label: string }> = [
  { value: 'news', label: 'أخبار' },
  { value: 'activity', label: 'نشاطات' },
  { value: 'program', label: 'برامج' },
  { value: 'center', label: 'مراكز' },
]

export function PostFormDialog({
  open,
  onOpenChange,
  mode,
  value,
  categories,
  pending,
  onChange,
  onSubmit,
}: PostFormDialogProps) {
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')

  useEffect(() => {
    setSlugTouched(mode === 'edit')
  }, [mode, open])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة مقال جديد' : 'تعديل المقال'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'أدخل بيانات المقال ثم احفظه كمنشور أو مسودة.'
              : 'حدّث بيانات المقال ثم احفظ التعديلات.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="post-title">العنوان</Label>
            <Input
              id="post-title"
              value={value.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={pending}
              dir="auto"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="post-slug">الرابط (Slug)</Label>
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
              <Label htmlFor="post-type">النوع</Label>
              <select
                id="post-type"
                value={value.type}
                onChange={(e) => onChange('type', e.target.value as Post['type'])}
                disabled={pending}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-category">التصنيف</Label>
            <select
              id="post-category"
              value={value.category_id}
              onChange={(e) => onChange('category_id', e.target.value)}
              disabled={pending}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">بدون تصنيف</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-cover">رابط الصورة</Label>
            <Input
              id="post-cover"
              value={value.cover_image}
              onChange={(e) => onChange('cover_image', e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-excerpt">ملخص</Label>
            <Textarea
              id="post-excerpt"
              value={value.excerpt}
              onChange={(e) => onChange('excerpt', e.target.value)}
              disabled={pending}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-content">المحتوى</Label>
            <Textarea
              id="post-content"
              value={value.content}
              onChange={(e) => onChange('content', e.target.value)}
              disabled={pending}
              rows={8}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.published}
              onChange={(e) => onChange('published', e.target.checked)}
              disabled={pending}
            />
            <span>نشر المقال</span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" onClick={onSubmit} disabled={pending || !value.title.trim() || !value.slug.trim()}>
            {pending ? 'جاري الحفظ...' : mode === 'create' ? 'إنشاء المقال' : 'حفظ التعديلات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
