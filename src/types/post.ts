export type PostType = 'news' | 'activity' | 'program' | 'center'

export interface Post {
  id: string | undefined
  slug: string
  title: string
  title_en?: string
  excerpt: string
  excerpt_en?: string
  descripcion: string
  descripcion_en?: string
  coverImage: string
  type: PostType
  categoryId?: string
  category?: string
  categoryLabel?: string
  tags?: string[]
  gallery?: string[]
  likes: number
  published: boolean
  publishedAt: string
  author: {
    name: string
    avatarUrl: string
  }
}
