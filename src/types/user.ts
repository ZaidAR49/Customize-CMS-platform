export type UserRole = 'admin' | 'editor' | 'viewer'

export interface AppUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
}
