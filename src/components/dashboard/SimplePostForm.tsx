'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export interface SimplePostFormValue {
  title: string
  title_en: string
  slug: string
  descripcion: string
  descripcion_en: string
}

export const emptySimplePostFormValue: SimplePostFormValue = {
  title: '',
  title_en: '',
  slug: '',
  descripcion: '',
  descripcion_en: '',
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-title-ar">العنوان (بالعربية)</Label>
            <Input
              id="post-title-ar"
              value={value.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={pending}
              dir="auto"
              required
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
          <div className="flex items-center justify-between pb-2">
            <div>
              <Label htmlFor="post-descripcion">المحتوى (بالعربية)</Label>
              <p className="text-xs text-[#777777] mt-1">
                يدعم HTML مثل <code className="rounded bg-[#f0f0f0] px-1">&lt;h2&gt;عنوان&lt;/h2&gt;</code>
              </p>
            </div>
            <div className="flex items-center space-x-3 flex-row-reverse">
              <Switch
                id="theme-mode-ar"
                checked={isHtml}
                onCheckedChange={setIsHtml}
                className="data-[state=checked]:bg-blue-500 mr-3"
              />
              <Label htmlFor="theme-mode-ar" className="font-medium text-gray-700">
                {isHtml ? "HTML" : "نص"}
              </Label>
            </div>
          </div>

          {isHtml ? (
            <CodeEditor
              id="post-descripcion-ar"
              value={value.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              disabled={pending}
              language="html"
              className="min-h-[320px] font-mono text-sm leading-relaxed rounded-md border"
              placeholder="أدخل كود HTML..."
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
              rows={12}
              className="min-h-[320px] text-base leading-relaxed p-4"
              placeholder="أدخل الوصف..."
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
              rows={12}
              className="min-h-[320px] text-base leading-relaxed p-4 text-left"
              placeholder="Enter description..."
              dir="ltr"
            />
          )}
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
