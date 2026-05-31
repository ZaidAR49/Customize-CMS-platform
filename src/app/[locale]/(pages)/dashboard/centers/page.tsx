import { SimplePostsOverview } from '@/components/dashboard/SimplePostsOverview'
import { postsService } from '@/lib/services/posts.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function DashboardCentersPage() {
  const t = await getTranslations('dashboardCenters')
  const session = await getServerSession(authOptions)
  const isEditor = session?.user?.role === 'admin' || session?.user?.role === 'editor'
  const posts = await postsService.getPosts('center')

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">{t('titleManagement')}</h2>
        <span className="inline-flex items-center justify-center rounded-full bg-(--fcps-primary)/10 px-3 py-1 text-sm font-medium text-(--fcps-primary)">
          {posts.length} {posts.length === 1 ? t('badgeSingle') : t('badgePlural')}
        </span>
      </div>
      <SimplePostsOverview 
        posts={posts} 
        newUrl="/dashboard/centers/new" 
        newLabel={t('addNewCenter')} 
        editUrlPrefix="/dashboard/centers"
        isEditor={isEditor}
      />
    </div>
  )
}

