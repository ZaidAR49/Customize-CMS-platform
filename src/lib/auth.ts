import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getUserByEmailAction, getAllUsersAction, createUserAction } from '@/actions/users.actions'

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
        const res = await getUserByEmailAction(user.email!);
        console.log("existingUser", res)
        if (res) return true;

        // If user doesn't exist, check if they are the first one
        const { data: allUsers } = await getAllUsersAction();
        const isFirst = !allUsers || allUsers.length === 0;

        if (isFirst) {
          await createUserAction({
            id: "", // Or generate a nanoid/uuid here
            email: user.email!,
            name: user.name!,
            avatarUrl: user.image ?? "",
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          return true;
        }

        return '/unauthorized';
      } catch (error) {
        console.error("SignIn Error:", error);
        return '/unauthorized';
      }
    },

    async jwt({ token }) {
      const { data: dbUser } = await getUserByEmailAction(token.email!);
      if (dbUser) {
        token.sub = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/unauthorized'
  },
};
