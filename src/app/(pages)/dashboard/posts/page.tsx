import { PostsOverview } from '@/components/dashboard/PostsOverview'
import { postsService } from '@/lib/services/posts.service'

export default async function DashboardPostsPage() {
  const posts = await postsService.getPosts()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--fcps-dark)">إدارة المقالات</h2>
      </div>
      <PostsOverview posts={posts} />
    </div>
  )
}
