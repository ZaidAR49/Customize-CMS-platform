import { PostFormEditor } from '@/components/dashboard/PostFormEditor'
import { categoriesService } from '@/lib/services/categories.service'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboardPosts' })
  return { title: t('addPost') }
}

export default async function NewPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dbCategories = await categoriesService.getAllCategories()
  const categories = dbCategories.map((c) => ({
    id: c.id,
    label: locale === 'ar' ? c.label_ar : (c.label_en || c.label_ar)
  }))

  return <PostFormEditor mode="create" categories={categories} />
}

