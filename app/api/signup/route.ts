import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        name: sanitizeText(body.name),
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password)
      },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid signup request." }, { status: 400 });
  }
}
