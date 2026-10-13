"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
    <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-3 py-6">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
            <defs>
              <radialGradient id="moonGrad" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff8e0" />
                <stop offset="55%" stopColor="#ffe48f" />
                <stop offset="100%" stopColor="#cbc4f8" />
              </radialGradient>
            </defs>
            <circle cx="17" cy="17" r="13" fill="url(#moonGrad)" opacity="0.95" />
            <circle cx="22" cy="13" r="2.4" fill="#e4dcb8" opacity="0.5" />
            <circle cx="12" cy="21" r="1.6" fill="#e4dcb8" opacity="0.45" />
            <circle cx="17" cy="17" r="16" fill="none" stroke="rgba(203,196,248,.45)" strokeWidth="1" />
          </svg>
          <div>
            <h1 className="ck-title text-xl font-bold">超时空辉夜姬同人收集站</h1>
            <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>CHOUKAGUYA · 非官方粉丝同人站</p>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/upload" className="ck-btn-ghost">投稿</Link>
          <Link href="/login" className="ck-btn-ghost">登录</Link>
          <Link href="/register" className="ck-btn">注册</Link>
        </nav>
      </header>

      <div className="ck-panel relative mb-6 flex flex-wrap gap-2 p-3">
        <input
          className="ck-input flex-1"
          style={{ minWidth: 200 }}
          placeholder="搜索 tag（空格分隔，-tag 排除）"
          value={q}
          onChange={(e) => onSearchInput(e.target.value)}
        />
        <select className="ck-input" style={{ width: 120 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="IMAGE">同人图</option>
          <option value="TEXT">同人文</option>
          <option value="VIDEO">视频</option>
          <option value="MUSIC">音乐</option>
        </select>
        <select className="ck-input" style={{ width: 110 }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">最新</option>
          <option value="hot">最热</option>
        </select>
        {suggestions.length > 0 && (
          <ul className="ck-suggest absolute top-full left-3 right-3 z-20 mt-1">
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {posts.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="ck-card overflow-hidden">
            <div className="aspect-square overflow-hidden" style={{ background: "rgba(13,18,32,.6)" }}>
              {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--ck-text-dim)" }}>
                {p.authorName ?? p.author.name} · 评论 {p._count.comments} · 赞 {p._count.likes}
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
        <p className="py-20 text-center" style={{ color: "var(--ck-text-dim)" }}>还没有作品。来投第一张吧。</p>
      )}

      <footer className="mt-12 border-t pt-6 text-center text-xs" style={{ borderColor: "var(--ck-line)", color: "var(--ck-text-dim)" }}>
        本站为非官方粉丝同人站，与官方无关。相关角色与作品著作权归原权利人所有。
      </footer>
    </main>
  );
}