import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

export async function requireAdmin() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === env.ADMIN_EMAIL;
  return { session, isAdmin };
}
