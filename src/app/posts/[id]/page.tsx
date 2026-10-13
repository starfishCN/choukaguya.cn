import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostInteractive from "./PostInteractive";

export const dynamic = "force-dynamic";

const CATEGORY_STYLE: Record<string, string> = {
  CHARACTER: "ck-tag-pink",
  WORK: "ck-tag-gold",
  ARTIST: "ck-tag",
  GENERAL: "ck-tag",
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, favorites: true } },
    },
  });
  if (!post) notFound();

  return (
    <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
      <p className="mb-4 text-sm">
        <Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>← 返回广场</Link>
      </p>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          {post.images.map((src) => (
            <img key={src} src={src} alt={post.title}
              className="mb-3 w-full rounded-xl border" style={{ borderColor: "var(--ck-line)" }} />
          ))}
        </div>
        <aside className="w-full md:w-80">
          <div className="ck-panel p-5">
            <h1 className="ck-title text-lg font-bold">{post.title}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--ck-text-dim)" }}>
              {post.authorName ?? post.author.name}
              {post.authorized && <span className="ck-tag ck-tag-gold ml-2">已授权</span>}
            </p>
            {post.description && <p className="mt-3 text-sm leading-relaxed">{post.description}</p>}
            {post.sourceUrl && (
              <p className="mt-3 text-sm" style={{ color: "var(--ck-text-dim)" }}>
                出处：<a className="underline break-all" style={{ color: "var(--ck-accent)" }} href={post.sourceUrl}>{post.sourceUrl}</a>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/?q=${encodeURIComponent(tag.name)}`}
                  className={`ck-tag ${CATEGORY_STYLE[tag.category] ?? "ck-tag"}`}>
                  {tag.name}
                </Link>
              ))}
            </div>

            <PostInteractive
              postId={post.id}
              initialLikes={post._count.likes}
              initialFavs={post._count.favorites}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}