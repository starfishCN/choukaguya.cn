import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireAdmin() {
  const uid = await getSessionUser();
  if (!uid) return false;
  const u = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } });
  return u?.role === "ADMIN" || u?.role === "OWNER";
}

export async function GET() {
  const [characters, works] = await Promise.all([
    prisma.character.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.work.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  ]);
  return NextResponse.json({ characters, works });
}

// 管理：新增/更新角色。body: { type:"character", ... } 或 { type:"work", ... }
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const data = await req.json();
  if (data.type === "character") {
    const { slug, name, nameJa, nameEn, cv, profile, avatarUrl, sortOrder } = data;
    if (!slug || !name) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const c = await prisma.character.upsert({
      where: { slug },
      update: { name, nameJa, nameEn, cv, profile, avatarUrl, sortOrder },
      create: { slug, name, nameJa, nameEn, cv, profile, avatarUrl, sortOrder: sortOrder ?? 0 },
    });
    return NextResponse.json({ id: c.id });
  }
  if (data.type === "work") {
    const { slug, title, titleJa, category, body, coverUrl, externalUrl, sortOrder } = data;
    if (!slug || !title) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const w = await prisma.work.upsert({
      where: { slug },
      update: { title, titleJa, category, body, coverUrl, externalUrl, sortOrder },
      create: { slug, title, titleJa, category: category ?? "LORE", body, coverUrl, externalUrl, sortOrder: sortOrder ?? 0 },
    });
    return NextResponse.json({ id: w.id });
  }
  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { type, id } = await req.json();
  if (type === "character") await prisma.character.delete({ where: { id } }).catch(() => {});
  else if (type === "work") await prisma.work.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}