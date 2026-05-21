'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type PostFormValue, emptyPostFormValue } from '@/lib/posts-form'
import type { Post } from '@/types/post'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { Switch } from "@/components/ui/switch";
import { ReadOnlyField } from '@/components/dashboard/ReadOnlyField';
import { PostImageGallery } from '@/components/dashboard/PostImageGallery';
import { importFacebookPost } from '@/actions/apify.action'
import { toast } from 'sonner'
import { DownloadCloud, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

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
  const [slugEnTouched, setSlugEnTouched] = useState(mode === 'edit')
  const [isHtml, setIsHtml] = useState(false)
  const [facebookUrl, setFacebookUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  function handleClear() {
    setShowConfirmClear(true)
  }

  function executeClear() {
    Object.entries(emptyPostFormValue).forEach(([key, val]) => {
      onChange(key as keyof PostFormValue, val)
    })
    toast.success('تم تفريغ الحقول بنجاح')
  }

  useEffect(() => {
    setSlugTouched(mode === 'edit')
    setSlugEnTouched(mode === 'edit')
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

  function handleTitleEnChange(nextTitleEn: string) {
    onChange('title_en', nextTitleEn)
    if (mode === 'create' && !slugEnTouched) {
      const nextSlugEn = nextTitleEn
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      onChange('slug_en', nextSlugEn)
    }
  }

  async function handleFacebookImport() {
    const url = facebookUrl.trim()
    if (!url) return

    // URL validation
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch (e) {
      toast.error('يرجى إدخال رابط صحيح (URL)')
      return
    }

    // Facebook domain validation
    const hostname = parsedUrl.hostname.toLowerCase()
    const isFacebook = hostname.includes('facebook.com') || hostname.includes('fb.com') || hostname.includes('fb.watch')
    if (!isFacebook) {
      toast.error('يرجى إدخال رابط منشور فيسبوك صالح')
      return
    }

    setIsImporting(true)
    try {
      const result = await importFacebookPost(url)
      if (result.success && result.post) {
        const post = result.post
        const isArabic = post.isArabic

        // Helper to build a slug from a title string
        function toSlug(text: string) {
          return text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
        }

        if (isArabic) {
          // --- Arabic post: fill Arabic fields only, clear English fields ---
          const text = post.descripcion || ''
          const firstLine = text.split('\n')[0].trim()
          const cleanTitle = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
          const cleanExcerpt = text.length > 150 ? text.substring(0, 150) + '...' : text

          onChange('title', cleanTitle)
          if (mode === 'create') onChange('slug', toSlug(cleanTitle))
          onChange('excerpt', cleanExcerpt)
          onChange('descripcion', text)

          // Clear English fields
          onChange('title_en', '')
          onChange('slug_en', '')
          onChange('excerpt_en', '')
          onChange('descripcion_en', '')
        } else {
          // --- English post: fill English fields only, clear Arabic fields ---
          const text = post.descripcion_en || ''
          const firstLine = text.split('\n')[0].trim()
          const cleanTitleEn = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
          const cleanExcerptEn = text.length > 150 ? text.substring(0, 150) + '...' : text

          onChange('title_en', cleanTitleEn)
          if (mode === 'create') onChange('slug_en', toSlug(cleanTitleEn))
          onChange('excerpt_en', cleanExcerptEn)
          onChange('descripcion_en', text)

          // Clear Arabic fields
          onChange('title', '')
          onChange('slug', '')
          onChange('excerpt', '')
          onChange('descripcion', '')
        }

        // Cover image
        if (post.cover_image) {
          onChange('cover_image', post.cover_image)
        }

        // Gallery images — populate from imported images array
        if (Array.isArray(post.images) && post.images.length > 0) {
          onChange('gallery', post.images)
        }

        if (post.type) {
          onChange('type', post.type as Post['type'])
        }
        if (post.published !== undefined) {
          onChange('published', post.published)
        }

        toast.success('تم استيراد بيانات المنشور بنجاح!')
        setFacebookUrl('')
      } else {
        toast.error(result.error || 'فشل استيراد المنشور. يرجى التحقق من الرابط.')
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء الاتصال بـ Apify')
    } finally {
      setIsImporting(false)
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
      {/* Import from Facebook Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            <FacebookIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">الاستيراد من فيسبوك</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">أدخل رابط منشور فيسبوك لاستخراج المحتوى والصورة تلقائياً</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="https://www.facebook.com/username/posts/123456789"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            disabled={isImporting || pending}
            className="flex-1 border-slate-200 focus-visible:ring-blue-500"
          />
          <Button
            type="button"
            onClick={handleFacebookImport}
            disabled={isImporting || pending || !facebookUrl.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2 h-8"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الاستيراد...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4" />
                استيراد المحتوى
              </>
            )}
          </Button>
        </div>
      </div>
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
              onChange={(e) => handleTitleEnChange(e.target.value)}
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-slug">الرابط بالعربية (Slug AR)</Label>
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
            <Label htmlFor="post-slug-en">الرابط بالإنجليزية (Slug EN)</Label>
            <Input
              id="post-slug-en"
              value={value.slug_en || ''}
              onChange={(e) => {
                setSlugEnTouched(true)
                onChange('slug_en', e.target.value.trim())
              }}
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
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
          <Label htmlFor="post-tags-input">الوسوم (Tags)</Label>
          <p className="text-xs text-gray-500">
            أدخل الوسوم للمقال. اضغط على زر Enter أو أضف فاصلة (، أو ,) لإضافة الوسم.
          </p>
          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
            {/* Tag Pills */}
            {(value.tags || []).map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-100/60 px-2.5 py-0.5 text-xs font-medium text-blue-600 animate-in fade-in zoom-in-95 duration-150"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextTags = (value.tags || []).filter((_, i) => i !== idx)
                    onChange('tags', nextTags)
                  }}
                  disabled={pending}
                  className="rounded-full p-0.5 hover:bg-blue-100/80 text-blue-500 hover:text-blue-700 transition-colors"
                  aria-label={`إزالة الوسم ${tag}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            ))}
            
            {/* Tag Input Field */}
            <input
              id="post-tags-input"
              type="text"
              placeholder={(value.tags || []).length === 0 ? "مثال: نشاطات، أيتام، إنجازات..." : "إضافة وسم..."}
              disabled={pending}
              className="flex-1 min-w-[120px] bg-transparent text-sm outline-none border-none py-0.5 px-1 placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const target = e.currentTarget
                  const val = target.value.trim().replace(/[،,]/g, '')
                  if (val && !(value.tags || []).includes(val)) {
                    onChange('tags', [...(value.tags || []), val])
                    target.value = ''
                  }
                }
              }}
              onInput={(e) => {
                const target = e.currentTarget
                const val = target.value
                if (val.endsWith(',') || val.endsWith('،')) {
                  const tag = val.slice(0, -1).trim()
                  if (tag && !(value.tags || []).includes(tag)) {
                    onChange('tags', [...(value.tags || []), tag])
                  }
                  target.value = ''
                }
              }}
              onBlur={(e) => {
                const target = e.currentTarget
                const val = target.value.trim().replace(/[،,]/g, '')
                if (val && !(value.tags || []).includes(val)) {
                  onChange('tags', [...(value.tags || []), val])
                  target.value = ''
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-excerpt-ar">الملخص (بالعربية)</Label>
            <Textarea
              id="post-excerpt-ar"
              value={value.excerpt}
              onChange={(e) => onChange('excerpt', e.target.value)}
              disabled={pending}
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="post-excerpt-en">الملخص (بالإنجليزية)</Label>
            <Textarea
              id="post-excerpt-en"
              value={value.excerpt_en || ''}
              onChange={(e) => onChange('excerpt_en', e.target.value)}
              disabled={pending}
              rows={4}
              dir="ltr"
              className="text-left"
            />
          </div>
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

        <div className="grid gap-2 border-t pt-6 mt-4">
          <Label className="text-base font-bold text-slate-800">صور المقال ومعرض الوسائط (الحد الأقصى 20 صورة)</Label>
          <PostImageGallery
            coverImage={value.cover_image}
            gallery={value.gallery || []}
            onChange={onChange}
            disabled={pending}
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

      <div className="flex flex-wrap gap-2 border-t pt-6">
        <Button
          type="submit"
          className="bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white"
          disabled={pending || !value.title.trim() || !value.slug.trim()}
        >
          {pending ? 'جاري الحفظ...' : mode === 'create' ? 'إنشاء المقال' : 'حفظ التعديلات'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={pending}
          className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          مسح البيانات
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          إلغاء
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirmClear}
        onOpenChange={setShowConfirmClear}
        title="تأكيد مسح البيانات"
        description="هل أنت متأكد من مسح جميع الحقول؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="مسح الكل"
        onConfirm={executeClear}
      />
    </form>
  )
}
