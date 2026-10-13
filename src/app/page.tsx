"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";
import LangSwitch from "@/components/LangSwitch";
import ThemeSwitch from "@/components/ThemeSwitch";
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
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/posts?q=${encodeURIComponent(q)}&sort=${sort}&type=${type}`);
    const d = await r.json();
    setPosts(d.posts ?? []);
  }, [q, sort, type]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.user));
  }, []);

  const logout = async () => {
    await fetch("/api/me", { method: "DELETE" });
    setMe(null);
  };

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
      <header className="ck-site-header">
        <div className="ck-brand-row">
          <div className="flex min-w-0 items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
            <defs>
              <radialGradient id="moonGrad" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#f7ffff" />
                <stop offset="60%" stopColor="var(--ck-accent)" />
                <stop offset="100%" stopColor="var(--ck-brand)" />
              </radialGradient>
            </defs>
            <circle cx="17" cy="17" r="13" fill="url(#moonGrad)" opacity="0.95" />
            <circle cx="22" cy="13" r="2.4" fill="var(--ck-gold)" opacity="0.65" />
            <circle cx="12" cy="21" r="1.6" fill="var(--ck-gold)" opacity="0.5" />
            <circle cx="17" cy="17" r="16" fill="none" stroke="var(--ck-accent)" strokeOpacity=".5" strokeWidth="1" />
          </svg>
          <div>
            <h1 className="ck-title text-xl font-bold">{t.siteTitle}</h1>
            <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>{t.siteSub}</p>
          </div>
          </div>
        </div>
        <div className="ck-header-controls">
          <ThemeSwitch />
          <LangSwitch />
          <nav className="ck-nav">
            <Link href="/wiki" className="ck-btn-ghost">{t.navWiki}</Link>
            <Link href="/about" className="ck-btn-ghost">{t.navAbout}</Link>
            <Link href="/upload" className="ck-btn-ghost">{t.navUpload}</Link>
            {me ? (
              <>
                {(me.role === "ADMIN" || me.role === "OWNER") && <Link href="/admin" className="ck-btn-ghost">{t.navAdmin}</Link>}
                <span className="text-sm" style={{ color: "var(--ck-text-dim)" }}>{me.name}</span>
                <button className="ck-btn-ghost" onClick={logout}>{t.navLogout}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="ck-btn-ghost">{t.navLogin}</Link>
                <Link href="/register" className="ck-btn">{t.navRegister}</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="ck-hero mb-6">
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