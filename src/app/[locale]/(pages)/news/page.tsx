import { PostGrid } from '@/components/news/PostGrid'
import { postsService } from '@/lib/services/posts.service'
import { categoriesService } from '@/lib/services/categories.service'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'الأخبار والنشاطات' }

export default async function NewsPage() {
  const [allPosts, dbCategories] = await Promise.all([
    postsService.getPosts(undefined, true),
    categoriesService.getAllCategories(),
  ])
  const posts = allPosts.filter((post) => post.type === 'news' || post.type === 'activity')
  const categories = dbCategories.map((c) => ({ key: c.key, label: c.label_ar }))

  return (
    <div className="container py-16">
      <div className="mb-8 mt-16">
        <h1 className="text-3xl font-bold text-(--fcps-primary-dark)">الأخبار والنشاطات</h1>
        <p className="mt-2 text-(--fcps-gray-text)">تابع آخر أخبارنا ونشاطاتنا وبرامجنا</p>
        <div className="mt-3 h-1 w-16 rounded-full bg-(--fcps-primary-light)" />
      </div>
      <PostGrid posts={posts} dbCategories={categories} />
    </div>
  )
}
