import type { Post } from '@/types/post'

export interface PostFormValue {
  slug: string
  title: string
  category_id: string
  excerpt: string
  content: string
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
    category_id: post.categoryId ?? '',
    excerpt: post.excerpt ?? '',
    content: post.content ?? '',
    cover_image: post.coverImage ?? '',
    type: post.type,
    published: post.published,
  }
}

export const emptyPostFormValue: PostFormValue = {
  slug: '',
  title: '',
  category_id: '',
  excerpt: '',
  content: '',
  cover_image: '',
  type: 'news',
  published: false,
}
