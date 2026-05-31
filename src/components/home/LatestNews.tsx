import Link from 'next/link'
import type { Post } from '@/types/post'
import { PostCard } from '@/components/news/PostCard'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface LatestNewsProps {
  posts: Post[]
}

export async function LatestNews({ posts }: LatestNewsProps) {
  const t = await getTranslations('homePage.latestNews')

  return (
    <section className="py-20 bg-(--fcps-gray-light)">
      <div className="container">
        <SectionTitle
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-(--fcps-primary) px-6 py-3 text-sm font-bold text-white transition-all hover:bg-(--fcps-primary-dark) hover:scale-105 shadow-lg"
          >
            {t('viewAllNews')}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
