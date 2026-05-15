import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { getFormCategories } from '@/lib/posts-form'
import { postsService } from '@/lib/services/posts.service'

export default async function NewPostPage() {
  const posts = await postsService.getPosts()
  const categories = getFormCategories(posts)

  return <PostFormEditor mode="create" categories={categories} />
}
