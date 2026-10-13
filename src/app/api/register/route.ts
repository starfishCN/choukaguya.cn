import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  if (!email || !name || !password || password.length < 8)
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "email taken" }, { status: 409 });
  const user = await prisma.user.create({
    data: { email, name, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}