import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      author: { select: { name: true } },
      replies: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { postId, content, parentId } = await req.json();
  if (!postId || !content?.trim()) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: {
      content: content.trim().slice(0, 2000),
      post: { connect: { id: postId } },
      author: { connect: { id: uid } },
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ id: comment.id, author: comment.author.name, content: comment.content, createdAt: comment.createdAt });
}
