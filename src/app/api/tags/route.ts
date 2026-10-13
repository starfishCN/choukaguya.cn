import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const tags = await prisma.tag.findMany({
    where: q ? { name: { startsWith: q, mode: "insensitive" } } : {},
    orderBy: { postCount: "desc" },
    take: 10,
    select: { name: true, category: true, postCount: true },
  });
  return NextResponse.json({ tags });
}