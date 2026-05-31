import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // We leave this empty here; we'll add Credentials in the main auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    }
    // Note: I removed your `authorized` callback from here because your custom 
    // middleware.ts is already handling all your route protection perfectly!
  }
} satisfies NextAuthConfig;
