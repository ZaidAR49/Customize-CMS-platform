export type PostType = 'news' | 'activity' | 'program' | 'center'

export interface Post {
  id: string | undefined
  slug: string
  title: string
  excerpt: string
  content: string
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
