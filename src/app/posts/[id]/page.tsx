import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
    <main className="ck-shell relative z-10 pb-16">
      <SiteHeader />

      <nav className="ck-crumb" aria-label="面包屑">
        <Link href="/">广场</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{post.title}</span>
      </nav>

      <div className="ck-section-heading ck-detail-heading">
        <div>
          <span className="ck-section-kicker">WORK DETAIL</span>
          <h2 className="ck-section-title">{post.title}</h2>
        </div>
      </div>

      <div className="ck-detail-grid">
        <div className="ck-detail-media">
          {post.images.length > 0 ? (
            post.images.map((src, i) => (
              <figure key={src} className="ck-figure">
                <img src={src} alt={`${post.title}（${i + 1}）`} loading={i === 0 ? "eager" : "lazy"} />
              </figure>
            ))
          ) : (
            <p className="ck-empty-note">该作品暂无可预览图像。</p>
          )}
        </div>

        <aside className="ck-detail-aside">
          <div className="ck-panel ck-meta-card">
            <dl className="ck-meta-list">
              <div>
                <dt>作者</dt>
                <dd>
                  {post.authorName ?? post.author.name}
                  {post.authorized && <span className="ck-tag ck-tag-gold ml-2">已授权</span>}
                </dd>
              </div>
              {post.sourceUrl && (
                <div>
                  <dt>出处</dt>
                  <dd>
                    <a className="ck-link break-all" href={post.sourceUrl} target="_blank" rel="noreferrer noopener">
                      {post.sourceUrl}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt>标签</dt>
                <dd className="ck-meta-tags">
                  {post.tags.length > 0 ? (
                    post.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/?q=${encodeURIComponent(tag.name)}`}
                        className={`ck-tag ${CATEGORY_STYLE[tag.category] ?? "ck-tag"}`}
                      >
                        {tag.name}
                      </Link>
                    ))
                  ) : (
                    <span className="ck-meta-none">暂无</span>
                  )}
                </dd>
              </div>
            </dl>

            {post.description && (
              <div className="ck-meta-desc">
                <h3 className="ck-meta-desc-title">作品说明</h3>
                <p>{post.description}</p>
              </div>
            )}

            <PostInteractive
              postId={post.id}
              initialLikes={post._count.likes}
              initialFavs={post._count.favorites}
            />
          </div>
        </aside>
      </div>

      <SiteFooter />
    </main>
  );
}