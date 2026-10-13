"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";
import SiteHeader from "@/components/SiteHeader";
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

      <section className="ck-hero mb-6">
        <div className="ck-moon" aria-hidden />
        <div className="ck-fog" aria-hidden />
        <div className="ck-motes" aria-hidden>
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="ck-hero-content">
          <div className="ck-hero-kicker">A FAN ARCHIVE · TSUKUYOMI</div>
          <h2>把散落的星光，<br />收进月读。</h2>
          <p>超时空辉夜姬同人作品收集广场。按 tag 找图、找文、找音乐，也把你的创作留在这里。</p>
          <div className="mt-4">
            <a href="#works" className="ck-btn">浏览作品</a>
          </div>
        </div>
      </section>

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
      </div>

      <div className="ck-section-heading">
        <div>
          <span className="ck-section-kicker">LATEST WORKS</span>
          <h2 className="ck-section-title">最近收录</h2>
        </div>
        <span className="ck-section-note">按标签寻找同频创作</span>
      </div>
      <div id="works" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {posts.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="ck-card overflow-hidden">
            <div className="aspect-square overflow-hidden" style={{ background: "rgba(13,18,32,.6)" }}>
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