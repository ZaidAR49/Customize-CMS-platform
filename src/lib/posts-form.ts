import type { Post } from '@/types/post'

export interface PostFormValue {
  slug: string
  title: string
  title_en: string
  category_id: string
  excerpt: string
  descripcion: string
  descripcion_en: string
  cover_image: string
  type: Post['type']
  published: boolean
}

export function getFormCategories(posts: Post[]): Array<{ id: string; label: string }> {
  return posts
    .filter((post) => post.categoryId && post.categoryLabel)
    .map((post) => ({ id: post.categoryId as string, label: post.categoryLabel as string }))
    .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
    .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
}

export function postToFormValue(post: Post): PostFormValue {
  return {
    slug: post.slug,
    title: post.title,
    title_en: post.title_en ?? '',
    category_id: post.categoryId ?? '',
    excerpt: post.excerpt ?? '',
    descripcion: post.descripcion ?? '',
    descripcion_en: post.descripcion_en ?? '',
    cover_image: post.coverImage ?? '',
    type: post.type,
    published: post.published,
  }
}

export const emptyPostFormValue: PostFormValue = {
  slug: '',
  title: '',
  title_en: '',
  category_id: '',
  excerpt: '',
  descripcion: '',
  descripcion_en: '',
  cover_image: '',
  type: 'news',
  published: false,
}
