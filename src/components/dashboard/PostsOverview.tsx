'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { PostsTable } from '@/components/dashboard/PostsTable'
import { Button, buttonVariants } from '@/components/ui/button'
import { PostFormDialog, type PostFormValue } from '@/components/dashboard/PostFormDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createPostAction, deletePostAction, updatePostAction } from '@/actions/posts.actions'
import type { Post } from '@/types/post'
import { FileText, Layers3, Tags, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostsOverviewProps {
  posts: Post[]
}

const typeLabels: Record<string, string> = {
  all: 'كل الأنواع',
  news: 'أخبار',
  activity: 'نشاطات',
  program: 'برامج',
  center: 'مراكز',
}

export function PostsOverview({ posts }: PostsOverviewProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeType, setActiveType] = useState<Post['type'] | 'all'>('all')
  const [activeTag, setActiveTag] = useState<string>('all')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [formValue, setFormValue] = useState<PostFormValue>({
    slug: '',
    title: '',
    category_id: '',
    excerpt: '',
    content: '',
    cover_image: '',
    type: 'news',
    published: false,
  })

  const availableCategories = useMemo(() => {
    const categories = new Map<string, string>()
    for (const post of posts) {
      if (!post.category || !post.categoryId) continue
      categories.set(post.category, post.categoryLabel ?? post.category)
    }
    return Array.from(categories.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
  }, [posts])

  const formCategories = useMemo(() => {
    return posts
      .filter((post) => post.categoryId && post.categoryLabel)
      .map((post) => ({ id: post.categoryId as string, label: post.categoryLabel as string }))
      .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
      .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
  }, [posts])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    for (const post of posts) {
      for (const tag of post.tags ?? []) tags.add(tag)
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'ar'))
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const categoryMatch = activeCategory === 'all' || post.category === activeCategory
      const typeMatch = activeType === 'all' || post.type === activeType
      const tagMatch = activeTag === 'all' || (post.tags ?? []).includes(activeTag)
      return categoryMatch && typeMatch && tagMatch
    })
  }, [activeCategory, activeType, activeTag, posts])

  const stats = [
    { label: 'إجمالي المقالات', value: posts.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'التصنيفات', value: availableCategories.length, icon: Layers3, color: 'bg-(--fcps-primary)' },
    { label: 'الوسوم', value: availableTags.length, icon: Tags, color: 'bg-amber-500' },
  ]

  function updateForm<K extends keyof PostFormValue>(key: K, next: PostFormValue[K]) {
    setFormValue((prev) => ({ ...prev, [key]: next }))
  }

  function openCreate() {
    setEditingPost(null)
    setFormValue({
      slug: '',
      title: '',
      category_id: '',
      excerpt: '',
      content: '',
      cover_image: '',
      type: 'news',
      published: false,
    })
    setFormOpen(true)
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setFormValue({
      slug: post.slug,
      title: post.title,
      category_id: post.categoryId ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      cover_image: post.coverImage ?? '',
      type: post.type,
      published: post.published,
    })
    setFormOpen(true)
  }

  function submitForm() {
    startTransition(async () => {
      const payload = {
        ...formValue,
        published_at: formValue.published ? new Date().toISOString() : '',
      }

      const result = editingPost?.id
        ? await updatePostAction(editingPost.id, payload)
        : await createPostAction(payload)

      if (!result.success) {
        toast.error(result.error ?? 'تعذر حفظ المقال')
        return
      }

      toast.success(editingPost ? 'تم تحديث المقال' : 'تم إنشاء المقال')
      setFormOpen(false)
      setEditingPost(null)
      router.refresh()
    })
  }

  function deletePost(post: Post) {
    if (!post.id) return
    const confirmed = window.confirm(`هل أنت متأكد من حذف "${post.title}"؟`)
    if (!confirmed) return

    setPendingDeleteId(post.id)
    startTransition(async () => {
      const result = await deletePostAction(post.id as string)
      if (!result.success) {
        toast.error(result.error ?? 'تعذر حذف المقال')
        setPendingDeleteId(null)
        return
      }
      toast.success('تم حذف المقال')
      setPendingDeleteId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button className="bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 ml-2" />
          مقال جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-(--fcps-gray-text)">{stat.label}</p>
                <p className="text-2xl font-bold text-(--fcps-dark)">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                التصفية حسب التصنيف
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  {activeCategory === 'all'
                    ? 'كل التصنيفات'
                    : (availableCategories.find((category) => category.key === activeCategory)?.label ?? activeCategory)}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuRadioGroup
                    value={activeCategory}
                    onValueChange={setActiveCategory}
                  >
                    <DropdownMenuRadioItem value="all">كل التصنيفات</DropdownMenuRadioItem>
                    {availableCategories.map((category) => (
                      <DropdownMenuRadioItem key={category.key} value={category.key}>
                        {category.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                التصفية حسب نوع المنشور
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  {typeLabels[activeType]}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuRadioGroup
                    value={activeType}
                    onValueChange={(value) => setActiveType(value as Post['type'] | 'all')}
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                التصفية حسب الوسم
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  {activeTag === 'all' ? 'كل الوسوم' : activeTag}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuRadioGroup value={activeTag} onValueChange={setActiveTag}>
                    <DropdownMenuRadioItem value="all">كل الوسوم</DropdownMenuRadioItem>
                    {availableTags.map((tag) => (
                      <DropdownMenuRadioItem key={tag} value={tag}>
                        {tag}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <PostsTable posts={filteredPosts} onEdit={openEdit} onDelete={deletePost} pendingDeleteId={pendingDeleteId} />

      <PostFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editingPost ? 'edit' : 'create'}
        value={formValue}
        categories={formCategories}
        pending={pending}
        onChange={updateForm}
        onSubmit={submitForm}
      />
    </div>
  )
}
