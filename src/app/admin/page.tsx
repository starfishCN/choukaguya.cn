"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: string;
  reason: string;
  reporter: { name: string };
  post: { id: string; title: string; images: string[] };
};
type Post = {
  id: string;
  title: string;
  images: string[];
  createdAt: string;
  author: { name: string };
};

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [denied, setDenied] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin");
    if (res.status === 403) { setDenied(true); return; }
    const d = await res.json();
    setReports(d.reports ?? []);
    setPosts(d.posts ?? []);
  };
  useEffect(() => { load(); }, []);

  const handle = async (reportId: string, action: "resolve" | "dismiss", deletePost = false) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action, deletePost }),
    });
    load();
  };

  const del = async (postId: string) => {
    if (!confirm("确认删除该作品？")) return;
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    load();
  };

  if (denied)
    return (
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--ck-danger)" }}>无权限。请用管理员账号登录。</p>
        <Link href="/login" className="ck-btn mt-4 inline-flex">去登录</Link>
      </main>
    );

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="ck-title text-xl font-bold">管理后台</h1>
        <Link href="/" className="ck-btn-ghost text-sm">返回前台</Link>
      </header>

      <section className="ck-panel p-5">
        <h2 className="mb-3 font-bold">待处理举报（{reports.length}）</h2>
        {reports.map((r) => (
          <div key={r.id} className="mb-3 flex flex-wrap items-center gap-3 rounded-lg p-3"
            style={{ background: "rgba(13,18,32,.5)", border: "1px solid var(--ck-line)" }}>
            {r.post.images[0] && <img src={r.post.images[0]} alt="" className="h-14 w-14 rounded object-cover" />}
            <div className="flex-1">
              <Link href={`/posts/${r.post.id}`} className="text-sm font-medium underline">{r.post.title}</Link>
              <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>
                举报人 {r.reporter.name}：{r.reason}
              </p>
            </div>
            <button className="ck-btn-ghost text-xs" onClick={() => handle(r.id, "dismiss")}>忽略</button>
            <button className="ck-btn-ghost text-xs" onClick={() => handle(r.id, "resolve")}>标记已处理</button>
            <button className="ck-btn text-xs" style={{ background: "var(--ck-danger)" }}
              onClick={() => handle(r.id, "resolve", true)}>删作品</button>
          </div>
        ))}
        {reports.length === 0 && <p className="text-sm" style={{ color: "var(--ck-text-dim)" }}>暂无待处理举报。</p>}
      </section>

      <section className="ck-panel mt-4 p-5">
        <h2 className="mb-3 font-bold">最新作品（{posts.length}）</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {posts.map((p) => (
            <div key={p.id} className="ck-card overflow-hidden">
              <div className="aspect-square" style={{ background: "rgba(13,18,32,.6)" }}>
                {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="p-2">
                <div className="truncate text-xs font-medium">{p.title}</div>
                <div className="text-xs" style={{ color: "var(--ck-text-dim)" }}>{p.author.name}</div>
                <div className="mt-1 flex gap-2">
                  <Link href={`/posts/${p.id}`} className="text-xs underline" style={{ color: "var(--ck-accent)" }}>查看</Link>
                  <button className="text-xs" style={{ color: "var(--ck-danger)" }} onClick={() => del(p.id)}>删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}