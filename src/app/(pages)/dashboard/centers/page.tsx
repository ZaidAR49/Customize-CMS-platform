import { SimplePostsOverview } from '@/components/dashboard/SimplePostsOverview'
import { postsService } from '@/lib/services/posts.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardCentersPage() {
  const session = await getServerSession(authOptions)
  const isEditor = session?.user?.role === 'admin' || session?.user?.role === 'editor'
  const posts = await postsService.getPosts('center')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">إدارة مراكز الجمعية</h2>
      </div>
      <SimplePostsOverview 
        posts={posts} 
        newUrl="/dashboard/centers/new" 
        newLabel="إضافة مركز جديد" 
        editUrlPrefix="/dashboard/centers"
        isEditor={isEditor}
      />
    </div>
  )
}
