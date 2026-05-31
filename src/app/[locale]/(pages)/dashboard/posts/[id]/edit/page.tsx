import { notFound } from 'next/navigation'
import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { categoriesService } from '@/lib/services/categories.service'
import { postsService } from '@/lib/services/posts.service'
import { getTranslations } from 'next-intl/server'

interface EditPostPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: EditPostPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPosts' })
  return { title: t('editPost') }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id, locale } = await params
  const [post, dbCategories] = await Promise.all([
    postsService.getPostById(id),
    categoriesService.getAllCategories(),
  ])

  if (!post) notFound()

  const categories = dbCategories.map((c) => ({
    id: c.id,
    label: locale === 'ar' ? c.label_ar : (c.label_en || c.label_ar)
  }))

  return <PostFormEditor mode="edit" post={post} categories={categories} />
}

