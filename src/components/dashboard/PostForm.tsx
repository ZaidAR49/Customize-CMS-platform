'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PostFormValue } from '@/lib/posts-form'
import type { Post } from '@/types/post'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { Switch } from "@/components/ui/switch";
import { ReadOnlyField } from '@/components/dashboard/ReadOnlyField';

const typeOptions: Array<{ value: Post['type']; label: string }> = [
  { value: 'news', label: 'أخبار' },
  { value: 'activity', label: 'نشاطات' },
  { value: 'program', label: 'برامج' },
  { value: 'center', label: 'مراكز' },
]

interface PostFormProps {
  mode: 'create' | 'edit'
  value: PostFormValue
  categories: Array<{ id: string; label: string }>
  authorName?: string
  pending: boolean
  onChange: <K extends keyof PostFormValue>(key: K, next: PostFormValue[K]) => void
  onSubmit: () => void
  onCancel: () => void
}

export function PostForm({
  mode,
  value,
  categories,
  authorName,
  pending,
  onChange,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [isHtml, setIsHtml] = useState(false)
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
        {mode === 'edit' && authorName ? (
          <ReadOnlyField id="post-author" label="الكاتب" value={authorName} />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-title-ar">العنوان (بالعربية)</Label>
            <Input
              id="post-title-ar"
              value={value.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={pending}
              dir="auto"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="post-title-en">العنوان (بالإنجليزية)</Label>
            <Input
              id="post-title-en"
              value={value.title_en || ''}
              onChange={(e) => onChange('title_en', e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
          </div>
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
            rows={4}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-descripcion">المحتوى (بالعربية)</Label>
          <p className="text-xs text-[#777777]">
            يدعم HTML مثل <code className="rounded bg-[#f0f0f0] px-1">&lt;h2&gt;عنوان&lt;/h2&gt;</code>{' '}
            أو Markdown مثل <code className="rounded bg-[#f0f0f0] px-1">## عنوان</code>
          </p>
          {/* toggel */}
          <div className="flex items-center space-x-3 pb-2 flex-row-reverse">
            <Switch
              id="theme-mode-ar"
              checked={isHtml}
              onCheckedChange={setIsHtml}
              // This matches the blue color from your image
              className="data-[state=checked]:bg-blue-500 mr-3"
            />
            <Label htmlFor="theme-mode-ar" className="font-medium text-gray-700">
              {isHtml ? "HTML" : "نص"}
            </Label>
          </div>

          {isHtml ? (
            <CodeEditor
              id="post-descripcion-ar"
              value={value.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              disabled={pending}
              rows={20}
              language="html"
              className="min-h-[320px] font-mono text-sm leading-relaxed"
              placeholder="Please enter HTML code."
              dir="ltr"
              style={{
                direction: 'ltr',
                unicodeBidi: 'isolate',
                textAlign: 'left',
                color: "#333333",
                fontSize: 14,
                backgroundColor: "#f5f5f5",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          ) : (
            <Textarea
              id="post-descripcion-ar"
              value={value.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              disabled={pending}
              rows={16}
              className="min-h-[320px] text-base leading-relaxed p-4"
              placeholder="أدخل المحتوى..."
              dir="rtl"
            />
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between pb-2">
            <div>
              <Label htmlFor="post-descripcion-en">المحتوى (بالإنجليزية)</Label>
            </div>
          </div>

          {isHtml ? (
            <CodeEditor
              id="post-descripcion-en"
              value={value.descripcion_en || ''}
              onChange={(e) => onChange('descripcion_en', e.target.value)}
              disabled={pending}
              rows={20}
              language="html"
              className="min-h-[320px] font-mono text-sm leading-relaxed rounded-md border"
              placeholder="Enter HTML code..."
              dir="ltr"
              style={{
                direction: 'ltr',
                unicodeBidi: 'isolate',
                textAlign: 'left',
                color: "#333333",
                fontSize: 14,
                backgroundColor: "#f5f5f5",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          ) : (
            <Textarea
              id="post-descripcion-en"
              value={value.descripcion_en || ''}
              onChange={(e) => onChange('descripcion_en', e.target.value)}
              disabled={pending}
              rows={16}
              className="min-h-[320px] text-base leading-relaxed p-4 text-left"
              placeholder="Enter content..."
              dir="ltr"
            />
          )}
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

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button
          type="submit"
          className="bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white"
          disabled={pending || !value.title.trim() || !value.slug.trim()}
        >
          {pending ? 'جاري الحفظ...' : mode === 'create' ? 'إنشاء المقال' : 'حفظ التعديلات'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
