import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const pageKey = req.nextUrl.searchParams.get("page");
  if (!pageKey) return NextResponse.json({ error: "missing page" }, { status: 400 });
  const row = await prisma.pageContent.findUnique({ where: { pageKey } });
  return NextResponse.json({ data: row ? JSON.parse(row.data) : null });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: user } });
  if (!me || (me.role !== "ADMIN" && me.role !== "OWNER"))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { pageKey, data } = await req.json();
  if (!pageKey || typeof data !== "object")
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  const row = await prisma.pageContent.upsert({
    where: { pageKey },
    update: { data: JSON.stringify(data) },
    create: { pageKey, data: JSON.stringify(data) },
  });
  return NextResponse.json({ ok: true, id: row.id });
}
