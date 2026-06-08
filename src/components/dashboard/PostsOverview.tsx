'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { PostsTable } from '@/components/dashboard/PostsTable'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deletePostAction } from '@/actions/posts.actions'
import type { Post } from '@/types/post'
import { FileText, Layers3, Tags, ChevronDown, Plus, Bot, ArrowUpDown } from 'lucide-react'
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton'
import { SearchBar } from '@/components/shared/SearchBar'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

interface PostsOverviewProps {
  posts: Post[]
}

export function PostsOverview({ posts }: PostsOverviewProps) {
  const t = useTranslations('dashboardPosts')
  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeTag, setActiveTag] = useState<string>('all')
  const [activeBot, setActiveBot] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => post.type !== 'center')
  }, [posts])

  const availableCategories = useMemo(() => {
    const categories = new Map<string, string>()
    for (const post of visiblePosts) {
      if (!post.category || !post.categoryId) continue
      categories.set(post.category, post.categoryLabel ?? post.category)
    }
    return Array.from(categories.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, locale === 'ar' ? 'ar' : 'en'))
  }, [visiblePosts, locale])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    for (const post of visiblePosts) {
      for (const tag of post.tags ?? []) tags.add(tag)
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b, locale === 'ar' ? 'ar' : 'en'))
  }, [visiblePosts, locale])

  const filteredPosts = useMemo(() => {
    return visiblePosts.filter((post) => {
      const categoryMatch = activeCategory === 'all' || post.category === activeCategory
      const tagMatch = activeTag === 'all' || (post.tags ?? []).includes(activeTag)
      const botMatch = activeBot === 'all' || (activeBot === 'yes' ? post.isBotGenerated : !post.isBotGenerated)
      const matchesSearch =
        !searchQuery.trim() ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && tagMatch && botMatch && matchesSearch
    })
  }, [activeCategory, activeTag, activeBot, searchQuery, visiblePosts])

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [filteredPosts, sortBy])

  const hasActiveFilters =
    activeCategory !== 'all' || activeTag !== 'all' || activeBot !== 'all' || searchQuery.trim() !== '' || sortBy !== 'newest'

  function clearFilters() {
    setActiveCategory('all')
    setSearchQuery('')
    setActiveTag('all')
    setActiveBot('all')
    setSortBy('newest')
  }

  const stats = [
    { label: t('totalPosts'), value: visiblePosts.length, icon: FileText, color: 'bg-blue-500' },
    { label: t('categories'), value: availableCategories.length, icon: Layers3, color: 'bg-(--fcps-primary)' },
    { label: t('tags'), value: availableTags.length, icon: Tags, color: 'bg-amber-500' },
  ]

  function deletePost(post: Post) {
    setPostToDelete(post)
  }

  function confirmDelete() {
    if (!postToDelete?.id) return

    setPendingDeleteId(postToDelete.id)
    startTransition(async () => {
      const result = await deletePostAction(postToDelete.id as string)
      if (!result.success) {
        toast.error(result.error ?? t('errorDelete'))
        setPendingDeleteId(null)
        setPostToDelete(null)
        return
      }
      toast.success(t('successDelete'))
      setPendingDeleteId(null)
      setPostToDelete(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`flex items-center ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
        <Link
          href={`/${locale}/dashboard/posts/new`}
          className={cn(
            buttonVariants(),
            'bg-(--fcps-primary) hover:bg-(--fcps-primary-dark) text-white'
          )}
        >
          <Plus className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {t('newPost')}
        </Link>
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
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-(--fcps-dark)">{t('filterTitle')}</h3>
            <ClearFiltersButton onClear={clearFilters} disabled={!hasActiveFilters} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                {t('filterByCategory')}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  {activeCategory === 'all'
                    ? t('allCategories')
                    : (availableCategories.find((category) => category.key === activeCategory)?.label ?? activeCategory)}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuRadioGroup
                    value={activeCategory}
                    onValueChange={setActiveCategory}
                  >
                    <DropdownMenuRadioItem value="all">{t('allCategories')}</DropdownMenuRadioItem>
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
                {t('filterByTag')}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  {activeTag === 'all' ? t('allTags') : activeTag}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                    <DropdownMenuRadioGroup value={activeTag} onValueChange={setActiveTag}>
                      <DropdownMenuRadioItem value="all">{t('allTags')}</DropdownMenuRadioItem>
                      {availableTags.map((tag) => (
                        <DropdownMenuRadioItem key={tag} value={tag}>
                          {tag}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                {locale === 'ar' ? 'الترتيب' : 'Sort Order'}
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full justify-between border-(--fcps-primary)/20 bg-white text-(--fcps-dark) hover:bg-(--fcps-bg-soft)'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-(--fcps-gray-text)" />
                    {sortBy === 'newest'
                      ? (locale === 'ar' ? 'من الأحدث إلى الأقدم' : 'Newest to Oldest')
                      : (locale === 'ar' ? 'من الأقدم إلى الأحدث' : 'Oldest to Newest')}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => setSortBy(val as 'newest' | 'oldest')}>
                    <DropdownMenuRadioItem value="newest">
                      {locale === 'ar' ? 'من الأحدث إلى الأقدم' : 'Newest to Oldest'}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      {locale === 'ar' ? 'من الأقدم إلى الأحدث' : 'Oldest to Newest'}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-(--fcps-dark)">
                {t('searchLabel')}
              </label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchLabel')}
              />
            </div>
            <div className="flex items-center h-10 self-start md:self-end">
              <label className="flex items-center gap-2 cursor-pointer select-none rounded-md border border-(--fcps-primary)/20 bg-white px-4 py-2 hover:bg-(--fcps-bg-soft) transition-colors h-10">
                <input
                  type="checkbox"
                  checked={activeBot === 'yes'}
                  onChange={(e) => setActiveBot(e.target.checked ? 'yes' : 'all')}
                  className="h-4 w-4 rounded border-gray-300 text-(--fcps-primary) focus:ring-(--fcps-primary) cursor-pointer accent-(--fcps-primary)"
                />
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-(--fcps-dark)">
                  {locale === 'ar' ? 'منشأ بواسطة بوت' : 'Created By Bot'}
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <PostsTable posts={sortedPosts} onDelete={deletePost} pendingDeleteId={pendingDeleteId} editUrlPrefix={`/${locale}/dashboard/posts`} />

      <Dialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent className="sm:max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={locale === 'ar' ? 'text-right' : 'text-left'}>{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription className={locale === 'ar' ? 'text-right' : 'text-left'}>
              {t.rich('confirmDeleteDesc', {
                title: <strong>{postToDelete?.title}</strong> as any
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`gap-2 sm:justify-start ${locale === 'ar' ? '' : 'sm:justify-end'}`}>
            <Button type="button" variant="outline" onClick={() => setPostToDelete(null)} disabled={pendingDeleteId !== null}>
              {t('cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={pendingDeleteId !== null}>
              {pendingDeleteId !== null ? t('deleting') : t('finalDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

