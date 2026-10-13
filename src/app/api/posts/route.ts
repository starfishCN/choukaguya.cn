import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "new";
  const type = searchParams.get("type");
  const include = q.trim().split(/\s+/).filter((t) => t && !t.startsWith("-"));
  const exclude = q.trim().split(/\s+/).filter((t) => t.startsWith("-")).map((t) => t.slice(1));
  const posts = await prisma.post.findMany({
    where: {
      ...(type ? { type: type as "IMAGE" | "TEXT" | "VIDEO" | "MUSIC" } : {}),
      AND: [
        ...include.map((t) => ({
          tags: { some: { tag: { name: { contains: t, mode: "insensitive" as const } } } },
        })),
        ...exclude.map((t) => ({
          NOT: { tags: { some: { tag: { name: { contains: t, mode: "insensitive" as const } } } } },
        })),
      ],
    },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: sort === "hot" ? { likes: { _count: "desc" } } : { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { title, description, type, images, sourceUrl, authorName, tags } = await req.json();
  if (!title || !images?.length) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const tagNames: string[] = (tags ?? []).map((t: string) => t.trim()).filter(Boolean);
  const post = await prisma.post.create({
    data: {
      title,
      description,
      type: type ?? "IMAGE",
      images,
      sourceUrl,
      authorName,
      author: { connect: { id: uid } },
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: { postCount: { increment: 1 } },
              create: { name, postCount: 1 },
            });
            return { tag: { connect: { id: tag.id } } };
          })
        ),
      },
    },
  });
  return NextResponse.json({ id: post.id });
}