import type { Post } from '@/types/post'

export interface PostFormValue {
  slug: string
  slug_en: string
  title: string
  title_en: string
  category_id: string
  excerpt: string
  excerpt_en: string
  descripcion: string
  descripcion_en: string
  cover_image: string
  type: Post['type']
  published: boolean
  tags: string[]
}



export function postToFormValue(post: Post): PostFormValue {
  return {
    slug: post.slug,
    slug_en: post.slug_en ?? '',
    title: post.title,
    title_en: post.title_en ?? '',
    category_id: post.categoryId ?? '',
    excerpt: post.excerpt ?? '',
    excerpt_en: post.excerpt_en ?? '',
    descripcion: post.descripcion ?? '',
    descripcion_en: post.descripcion_en ?? '',
    cover_image: post.coverImage ?? '',
    type: post.type,
    published: post.published,
    tags: Array.isArray(post.tags) ? post.tags : [],
  }
}

export const emptyPostFormValue: PostFormValue = {
  slug_en: '',
  title: '',
  title_en: '',
  category_id: '',
  excerpt: '',
  excerpt_en: '',
  descripcion: '',
  descripcion_en: '',
  cover_image: '',
  type: 'news',
  published: false,
  tags: [],
}
