import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("ck_session");
  return NextResponse.json({ ok: true });
}
