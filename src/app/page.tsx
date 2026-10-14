"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";
import useEmblaCarousel from "embla-carousel-react";
import fade from "embla-carousel-fade";
import SiteHeader from "@/components/SiteHeader";
import EditableBlocks from "@/components/EditableBlocks";
import SiteVisualEditor from "@/components/SiteVisualEditor";
import SiteFooter from "@/components/SiteFooter";

type Post = {
  id: string;
  title: string;
  images: string[];
  authorName: string | null;
  author: { name: string };
  tags: { tag: { name: string; category: string } }[];
  _count: { comments: number; likes: number };
};

const CATEGORY_STYLE: Record<string, string> = {
  CHARACTER: "ck-tag-pink",
  WORK: "ck-tag-gold",
  ARTIST: "ck-tag",
  GENERAL: "ck-tag",
};

export default function Home() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [type, setType] = useState("IMAGE");
  const [suggestions, setSuggestions] = useState<{ name: string; postCount: number }[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/posts?q=${encodeURIComponent(q)}&sort=${sort}&type=${type}`);
    const d = await r.json();
    setPosts(d.posts ?? []);
  }, [q, sort, type]);

  useEffect(() => { load(); }, [load]);
  const heroImages = ["/official/kv.jpg", "/official/kv2.jpg", "/official/kv3.jpg"];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28 }, [fade()]);
  useEffect(() => {
    if (!emblaApi) return;
    const t = setInterval(() => emblaApi.scrollNext(), 6000);
    emblaApi.on("pointerDown", () => clearInterval(t));
    return () => clearInterval(t);
  }, [emblaApi]);


  const onSearchInput = async (v: string) => {
    setQ(v);
    const last = v.trim().split(/\s+/).pop() ?? "";
    if (last.length > 0) {
      const r = await fetch(`/api/tags?q=${encodeURIComponent(last)}`);
      const d = await r.json();
      setSuggestions(d.tags ?? []);
    } else setSuggestions([]);
  };

  const pick = (name: string) => {
    const parts = q.trim().split(/\s+/);
    parts[parts.length - 1] = name;
    setQ(parts.join(" ") + " ");
    setSuggestions([]);
  };

  return (
    <main className="ck-shell relative z-10 pb-16">
      <SiteHeader />

      <section className="ck-home-hero" aria-label="官方主视觉">
        <div className="ck-home-hero-slides embla" ref={emblaRef}>
          <div className="ck-home-hero-track embla__container">{heroImages.map((src) => (
            <img key={src} src={src} alt="超时空辉夜姬官方主视觉" className="ck-home-hero-image embla__slide" />
          ))}</div>
        </div>
        <EditableBlocks pageKey="home" fallback={{ "intro.kicker": "COSMIC PRINCESS KAGUYA!", "intro.title": "把散落的星光，收进月读。", "intro.sub": "按标签寻找创作，收藏每一份来自月读的回响。", "notice.text": "" }} />
      </section>
      <section className="ck-home-discovery" aria-label="搜索与分类">
        <div className="ck-home-box ck-home-search-box"><div className="ck-home-box-heading"><span>FIND</span><h2>寻找作品</h2></div>
      <div className="ck-filterbar ck-panel relative mb-6">
        <div className="ck-search-wrap">
          <input
            className="ck-input"
            placeholder={t.searchPlaceholder}
            value={q}
            onChange={(e) => onSearchInput(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="ck-suggest absolute top-full left-0 right-0 z-20 mt-1">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button className="flex w-full justify-between px-3 py-2 text-left text-sm" onClick={() => pick(s.name)}>
                    <span>{s.name}</span>
                    <span style={{ color: "var(--ck-text-dim)" }}>{s.postCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ck-filter-controls">
          <select className="ck-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="IMAGE">{t.typeImage}</option>
            <option value="TEXT">{t.typeText}</option>
            <option value="VIDEO">{t.typeVideo}</option>
            <option value="MUSIC">{t.typeMusic}</option>
          </select>
          <select className="ck-input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">{t.sortNew}</option>
            <option value="hot">{t.sortHot}</option>
          </select>
        </div>
      </div></div>
        <div className="ck-home-box ck-home-category-box"><div className="ck-home-box-heading"><span>EXPLORE</span><h2>分类与热门标签</h2></div><div className="ck-home-category-links"><Link href="/wiki">角色</Link><Link href="/wiki">作品类型</Link><Link href="/wiki">创作者</Link><Link href="/wiki">全部标签</Link></div></div>
      </section>
      <EditableBlocks pageKey="home" fallback={{ "latest.kicker": "LATEST WORKS", "latest.title": "最近收录", "latest.note": "按标签寻找同频创作" }} />
      <div id="works" className="ck-home-works grid grid-cols-2 gap-5 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="ck-card overflow-hidden">
            <div className="aspect-square overflow-hidden" style={{ background: "#f7edf1" }}>
              {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--ck-text-dim)" }}>
                {p.authorName ?? p.author.name} · {t.comments} {p._count.comments} · {t.like} {p._count.likes}
              </div>
              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map(({ tag }) => (
                    <span key={tag.name} className={`ck-tag ${CATEGORY_STYLE[tag.category] ?? "ck-tag"}`}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="py-20 text-center" style={{ color: "var(--ck-text-dim)" }}>{t.empty}</p>
      )}

          <SiteFooter />
    </main>
  );
}

