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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [suggestions, setSuggestions] = useState<{ name: string; postCount: number }[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/posts?q=${encodeURIComponent(q)}&sort=${sort}`);
    const d = await r.json();
    setPosts(d.posts ?? []);
  }, [q, sort]);

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
    <main className="mx-auto max-w-5xl p-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold">超时空辉夜姬同人收集站</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/upload" className="underline">投稿</Link>
          <Link href="/login" className="underline">登录</Link>
          <Link href="/register" className="underline">注册</Link>
        </nav>
      </header>

      <div className="relative mb-4 flex gap-2">
        <input
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="搜索 tag（空格分隔，-tag 排除）"
          value={q}
          onChange={(e) => onSearchInput(e.target.value)}
        />
        <select className="rounded border px-2 text-black" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">最新</option>
          <option value="hot">最热</option>
        </select>
        {suggestions.length > 0 && (
          <ul className="absolute top-11 left-0 z-10 w-full rounded border bg-white text-black shadow">
            {suggestions.map((s) => (
              <li key={s.name}>
                <button className="flex w-full justify-between px-3 py-1 hover:bg-gray-100" onClick={() => pick(s.name)}>
                  <span>{s.name}</span><span className="text-gray-400">{s.postCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} className="rounded border p-2 hover:shadow">
            <div className="aspect-square overflow-hidden rounded bg-gray-800">
              {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
            </div>
            <div className="mt-1 truncate text-sm font-medium">{p.title}</div>
            <div className="text-xs text-gray-400">{p.authorName ?? p.author.name} · 评论{p._count.comments} · 赞{p._count.likes}</div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="py-16 text-center text-gray-500">还没有作品。来投第一张吧。</p>}

      <footer className="py-8 text-center text-xs text-gray-500">
        本站为非官方粉丝同人站，与官方无关。相关角色与作品著作权归原权利人所有。
      </footer>
    </main>
  );
}