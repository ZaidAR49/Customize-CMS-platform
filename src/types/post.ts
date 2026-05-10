export type PostType = 'news' | 'activity' | 'program' | 'center'

export interface Post {
  id:          string
  slug:        string
  title:       string
  excerpt:     string
  content:     string
  coverImage:  string
  type:        PostType
  likes:       number
  publishedAt: string
  author: {
    name:      string
    avatarUrl: string
  }
}
