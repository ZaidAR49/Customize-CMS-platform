import { notFound } from 'next/navigation'
import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { getFormCategories } from '@/lib/posts-form'
import { postsService } from '@/lib/services/posts.service'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, posts] = await Promise.all([
    postsService.getPostById(id),
    postsService.getPosts(),
  ])

  if (!post) notFound()

  const categories = getFormCategories(posts)

  return <PostFormEditor mode="edit" post={post} categories={categories} />
}
