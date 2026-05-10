import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

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
        const { count: adminCount, error: countError } = await supabaseAdmin
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin')

        if (countError) throw countError

        const noAdminsExist = adminCount === 0

        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id, role')
          .eq('email', user.email!)
          .single()

        if (existingUser) {
          if (noAdminsExist && existingUser.role !== 'admin') {
            await supabaseAdmin.from('users').update({ role: 'admin', name: user.name!, avatar_url: user.image }).eq('id', existingUser.id)
            return true
          }
          if (existingUser.role === 'admin' || existingUser.role === 'editor') {
            return true
          }
          return '/unauthorized'
        } else {
          if (noAdminsExist) {
            const { error } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email!,
                name: user.name!,
                avatar_url: user.image,
                role: 'admin'
              })
            if (error) console.error('Supabase insert error:', error.message)
            return true
          } else {
            const { error } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email!,
                name: user.name!,
                avatar_url: user.image,
                role: 'viewer'
              })
            if (error) console.error('Supabase insert error:', error.message)
            return '/unauthorized'
          }
        }
      } catch (e) {
        console.error('Auth signIn error:', e)
        return false
      }
    },
    async jwt({ token }) {
      try {
        const { data } = await supabaseAdmin
          .from('users')
          .select('id, role')
          .eq('email', token.email!)
          .single()
        if (data) {
          token.sub = data.id
          token.role = data.role
        }
      } catch (e) {
        // Supabase not configured yet — fallback
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = (token.role as string) || 'viewer'
      }
      return session
    },
  },
  pages: { 
    signIn: '/auth/signin',
    error: '/unauthorized'
  },
}
