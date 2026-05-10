import { PostsTable } from '@/components/dashboard/PostsTable'
import { Button } from '@/components/ui/button'
import { posts } from '@/data/posts'
import { Plus } from 'lucide-react'

export default function DashboardPostsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fcps-dark)]">إدارة المقالات</h2>
        <Button className="bg-[var(--fcps-primary)] hover:bg-[var(--fcps-primary-dark)] text-white">
          <Plus className="h-4 w-4 ml-2" />
          مقال جديد
        </Button>
      </div>
      <PostsTable posts={posts} />
    </div>
  )
}
