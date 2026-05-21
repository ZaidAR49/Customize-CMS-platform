'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const STORAGE_KEY = 'fcps-comment-draft'

interface PostCommentFormProps {
  postId: string
}

interface SavedDraft {
  name: string
  email: string
  website: string
}

export function PostCommentForm({ postId }: PostCommentFormProps) {
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [remember, setRemember] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as SavedDraft
      setName(draft.name ?? '')
      setEmail(draft.email ?? '')
      setWebsite(draft.website ?? '')
      setRemember(true)
    } catch {
      /* ignore */
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!postId) return

    setPending(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: name.trim(),
          author_email: email.trim(),
          body: body.trim(),
        }),
      })

      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) {
        toast.error(data.error ?? 'تعذّر إرسال التعليق')
        return
      }

      if (remember) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: name.trim(), email: email.trim(), website: website.trim() })
        )
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }

      setBody('')
      toast.success('تم إرسال تعليقك وسيُعرض بعد المراجعة')
    } catch {
      toast.error('تعذّر إرسال التعليق')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="border-t border-[#e8e8e8] pt-8">
      <h3 className="mb-6 text-xl font-bold text-[#1a1a1a]">اترك تعليقاً</h3>

      <p className="mb-6 text-sm text-[#777777]">
        لن يتم نشر عنوان بريدك الإلكتروني. الحقول الإلزامية مشار إليها بـ{' '}
        <span className="text-red-500">*</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="comment-body">
            التعليق <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={6}
            disabled={pending}
            className="resize-y"
            placeholder="اكتب تعليقك هنا..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="comment-name">
              الاسم <span className="text-red-500">*</span>
            </Label>
            <Input
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment-email">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </Label>
            <Input
              id="comment-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={pending}
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-[#666666]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-1"
            disabled={pending}
          />
          <span>احفظ اسمي، بريدي الإلكتروني، والموقع الإلكتروني في هذا المتصفح</span>
        </label>

        <div className="flex justify-start gap-2">
          <Button
            type="submit"
            disabled={pending}
            className="bg-[#0073aa] px-8 hover:bg-[#005580]"
          >
            {pending ? 'جاري الإرسال...' : 'إرسال التعليق'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من مسح جميع الحقول؟')) {
                setBody('')
                setName('')
                setEmail('')
                setWebsite('')
              }
            }}
            disabled={pending}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            مسح
          </Button>
        </div>
      </form>
    </div>
  )
}
