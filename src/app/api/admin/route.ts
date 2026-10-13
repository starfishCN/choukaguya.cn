import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

async function requireAdmin() {
  const uid = await getSessionUser();
  if (!uid) return null;
  const u = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } });
  return u?.role === "ADMIN" || u?.role === "OWNER" ? uid : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: { select: { name: true } },
      post: { select: { id: true, title: true, images: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const pendingPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, title: true, images: true, createdAt: true, author: { select: { name: true } } },
  });
  return NextResponse.json({ reports, posts: pendingPosts });
}

// 处理举报：action=resolve|dismiss，可选 deletePost
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { reportId, action, deletePost } = await req.json();
  if (!reportId || (action !== "resolve" && action !== "dismiss"))
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  const report = await prisma.report.update({
    where: { id: reportId },
    data: { status: action === "resolve" ? "RESOLVED" : "DISMISSED" },
  });
  if (deletePost) await prisma.post.delete({ where: { id: report.postId } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

// 删除作品
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await prisma.post.delete({ where: { id: postId } }).catch(() => {});
  return NextResponse.json({ ok: true });
}