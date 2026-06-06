import { PostsOverview } from '@/components/dashboard/PostsOverview'
import { postsService } from '@/lib/services/posts.service'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPosts' })
  return { title: t('titleManagement') }
}

export default async function DashboardPostsPage() {
  const allPosts = await postsService.getPosts()
  const posts = allPosts.filter((post) => post.type !== 'center')
  const t = await getTranslations('dashboardPosts')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">{t('titleManagement')}</h2>
      </div>
      <PostsOverview posts={posts} />
    </div>
  )
}

