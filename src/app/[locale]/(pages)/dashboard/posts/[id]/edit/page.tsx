import { notFound } from 'next/navigation'
import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { categoriesService } from '@/lib/services/categories.service'
import { postsService } from '@/lib/services/posts.service'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, dbCategories] = await Promise.all([
    postsService.getPostById(id),
    categoriesService.getAllCategories(),
  ])

  if (!post) notFound()

  const categories = dbCategories.map((c) => ({ id: c.id, label: c.label_ar }))

  return <PostFormEditor mode="edit" post={post} categories={categories} />
}
