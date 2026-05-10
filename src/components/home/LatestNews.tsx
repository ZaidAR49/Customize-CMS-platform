import Link from 'next/link'
import type { Post } from '@/types/post'
import { PostCard } from '@/components/news/PostCard'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { ArrowLeft } from 'lucide-react'

interface LatestNewsProps {
  posts: Post[]
}

export function LatestNews({ posts }: LatestNewsProps) {
  return (
    <section className="py-20 bg-[var(--fcps-gray-light)]">
      <div className="container">
        <SectionTitle
          title="آخر الأخبار والنشاطات"
          subtitle="تابع أحدث أخبارنا ونشاطاتنا في خدمة المجتمع"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--fcps-primary)] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--fcps-primary-dark)] hover:scale-105 shadow-lg"
          >
            عرض جميع الأخبار
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
