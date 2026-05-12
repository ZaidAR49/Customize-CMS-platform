import { posts } from '@/data/posts'
import { PostGrid } from '@/components/news/PostGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'الأخبار والنشاطات' }

export default function NewsPage() {
  return (
    <div className="container py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--fcps-primary-dark)">الأخبار والنشاطات</h1>
        <p className="mt-2 text-(--fcps-gray-text)">تابع آخر أخبارنا ونشاطاتنا وبرامجنا</p>
        <div className="mt-3 h-1 w-16 rounded-full bg-(--fcps-primary-light)" />
      </div>
      <PostGrid posts={posts} />
    </div>
  )
}
