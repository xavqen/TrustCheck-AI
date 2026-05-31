import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "./auth.config"; // Import the edge-friendly config

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the lightweight settings
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        
        const user = await prisma.user.findUnique({ 
          where: { email: parsed.data.email.toLowerCase() } 
        });
        
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      }
    })
  ]
});
