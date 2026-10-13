import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// 点赞 / 收藏 开关。kind=like|favorite
export async function POST(req: Request) {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { postId, kind } = await req.json();
  if (!postId || (kind !== "like" && kind !== "favorite"))
    return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (kind === "like") {
    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: uid, postId } } });
    if (existing) {
      await prisma.like.delete({ where: { userId_postId: { userId: uid, postId } } });
      return NextResponse.json({ active: false, count: await prisma.like.count({ where: { postId } }), kind: "like" });
    }
    await prisma.like.create({ data: { userId: uid, postId } });
    return NextResponse.json({ active: true, count: await prisma.like.count({ where: { postId } }), kind: "like" });
  }

  const existing = await prisma.favorite.findUnique({ where: { userId_postId: { userId: uid, postId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_postId: { userId: uid, postId } } });
    return NextResponse.json({ active: false, count: await prisma.favorite.count({ where: { postId } }), kind: "favorite" });
  }
  await prisma.favorite.create({ data: { userId: uid, postId } });
  return NextResponse.json({ active: true, count: await prisma.favorite.count({ where: { postId } }), kind: "favorite" });
}