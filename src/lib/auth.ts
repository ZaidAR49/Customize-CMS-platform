import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { usersService } from '@/lib/services/users.service'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Use the service layer directly — NOT server actions.
        // Server actions call getServerSession() internally, which
        // would trigger these callbacks again → infinite recursion.
        const existingUser = await usersService.getUserByEmail(user.email!)

        if (existingUser) {
          const nextAvatar = user.image?.trim() || null
          const current = existingUser.avatarUrl?.trim() || null
          if (nextAvatar && !current) {
            await usersService.updateUserAvatar(existingUser.id, nextAvatar)
          }
          return true
        }

        // If user doesn't exist, check if they are the first one
        const allUsers = await usersService.getAllUsers()
        const isFirst = !allUsers || allUsers.length === 0

        if (isFirst) {
          await usersService.createUser({
            email: user.email!,
            name: user.name!,
            avatarUrl: user.image?.trim() || undefined,
            role: 'admin',
          })
          return true
        }

        return '/unauthorized'
      } catch (error) {
        console.error('SignIn Error:', error)
        return '/unauthorized'
      }
    },

    async jwt({ token }) {
      // Use the service layer directly to avoid infinite recursion
      const dbUser = await usersService.getUserByEmail(token.email!)
      if (dbUser) {
        token.sub = dbUser.id
        token.role = dbUser.role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/unauthorized',
  },
}
