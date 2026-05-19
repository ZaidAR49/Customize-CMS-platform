import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { categoriesService } from '@/lib/services/categories.service'

export default async function NewPostPage() {
  const dbCategories = await categoriesService.getAllCategories()
  const categories = dbCategories.map((c) => ({ id: c.id, label: c.label_ar }))

  return <PostFormEditor mode="create" categories={categories} />
}
