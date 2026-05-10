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
        const { error } = await supabaseAdmin
          .from('users')
          .upsert(
            { email: user.email!, name: user.name!, avatar_url: user.image },
            { onConflict: 'email', ignoreDuplicates: false }
          )
        if (error) console.error('Supabase upsert error:', error.message)
      } catch (e) {
        console.error('Auth signIn error:', e)
      }
      return true
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
  pages: { signIn: '/auth/signin' },
}
