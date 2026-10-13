import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true, favorites: true } },
    },
  });
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-4xl p-4">
      <p className="py-2 text-sm"><Link href="/" className="underline">← 返回广场</Link></p>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          {post.images.map((src) => (
            <img key={src} src={src} alt={post.title} className="mb-2 w-full rounded" />
          ))}
        </div>
        <aside className="w-full md:w-72">
          <h1 className="text-lg font-bold">{post.title}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {post.authorName ?? post.author.name}
            {post.authorized && <span className="ml-2 rounded bg-green-800 px-1 text-xs">已授权</span>}
          </p>
          {post.description && <p className="mt-2 text-sm">{post.description}</p>}
          {post.sourceUrl && (
            <p className="mt-2 text-sm">出处：<a className="underline" href={post.sourceUrl}>{post.sourceUrl}</a></p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Link key={tag.id} href={`/?q=${encodeURIComponent(tag.name)}`}
                className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600">
                {tag.name}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-400">赞 {post._count.likes} · 收藏 {post._count.favorites}</p>

          <section className="mt-6">
            <h2 className="font-bold">评论（{post.comments.length}）</h2>
            {post.comments.map((c) => (
              <div key={c.id} className="mt-2 rounded bg-gray-800 p-2 text-sm">
                <span className="font-medium">{c.author.name}</span>
                <p className="mt-1">{c.content}</p>
              </div>
            ))}
            {post.comments.length === 0 && <p className="mt-2 text-sm text-gray-500">还没有评论。</p>}
          </section>
        </aside>
      </div>
    </main>
  );
}