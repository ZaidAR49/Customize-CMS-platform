import { PostGrid } from '@/components/news/PostGrid'
import { postsService } from '@/lib/services/posts.service'
import { categoriesService } from '@/lib/services/categories.service'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'newsPage' })
  return { title: t('metaTitle') }
}

export default async function NewsPage() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'newsPage' })
  
  const [allPosts, dbCategories] = await Promise.all([
    postsService.getPosts(undefined, true),
    categoriesService.getAllCategories(),
  ])
  const posts = allPosts.filter((post) => post.type === 'news' || post.type === 'activity')
  const categories = dbCategories.map((c) => ({ 
    key: c.key, 
    label: locale === 'ar' ? c.label_ar : (c.label_en || c.label_ar) 
  }))

  return (
    <div className="container py-16">
      <div className="mb-8 mt-16">
        <h1 className="text-3xl font-bold text-(--fcps-primary-dark)">{t('title')}</h1>
        <p className="mt-2 text-(--fcps-gray-text)">{t('subtitle')}</p>
        <div className="mt-3 h-1 w-16 rounded-full bg-(--fcps-primary-light)" />
      </div>
      <PostGrid posts={posts} dbCategories={categories} />
    </div>
  )
}
