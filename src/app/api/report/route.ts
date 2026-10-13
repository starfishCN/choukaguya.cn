import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { postId, reason } = await req.json();
  if (!postId || !reason?.trim()) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const report = await prisma.report.create({
    data: { reason: reason.trim().slice(0, 500), postId, reporterId: uid },
  });
  return NextResponse.json({ id: report.id });
}