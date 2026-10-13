"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Upload() {
  const r = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; postCount: number }[]>([]);
  const [err, setErr] = useState("");

  const onTagInput = async (v: string) => {
    setTagInput(v);
    if (v.trim()) {
      const res = await fetch(`/api/tags?q=${encodeURIComponent(v.trim())}`);
      const d = await res.json();
      setSuggestions(d.tags ?? []);
    } else setSuggestions([]);
  };

  const addTag = (name: string) => {
    if (name && !tags.includes(name)) setTags([...tags, name]);
    setTagInput("");
    setSuggestions([]);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: f.get("title"),
        description: f.get("description"),
        type: f.get("type"),
        images: String(f.get("images") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
        sourceUrl: f.get("sourceUrl") || null,
        authorName: f.get("authorName") || null,
        tags,
      }),
    });
    if (res.ok) r.push(`/posts/${(await res.json()).id}`);
    else if (res.status === 401) r.push("/login");
    else setErr("提交失败");
  };

  return (
    <main className="relative z-10 mx-auto max-w-lg px-4 py-8">
      <p className="mb-4 text-sm">
        <Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>← 返回广场</Link>
      </p>
      <div className="ck-panel p-7">
        <h1 className="ck-title mb-5 text-lg font-bold">投稿</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="title" required placeholder="标题" className="ck-input" />
          <select name="type" className="ck-input">
            <option value="IMAGE">同人图</option>
            <option value="TEXT">同人文</option>
            <option value="VIDEO">视频</option>
            <option value="MUSIC">音乐</option>
          </select>
          <textarea name="images" required placeholder="图片链接，每行一个" rows={3} className="ck-input" />
          <textarea name="description" placeholder="描述（可选）" rows={2} className="ck-input" />
          <input name="sourceUrl" placeholder="原作出处链接（收录他人作品时填）" className="ck-input" />
          <input name="authorName" placeholder="原作者名（收录他人作品时填）" className="ck-input" />

          <div className="relative">
            <input
              value={tagInput}
              onChange={(e) => onTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput.trim()); } }}
              placeholder="输入 tag，回车添加（自动补全）"
              className="ck-input"
            />
            {suggestions.length > 0 && (
              <ul className="ck-suggest absolute z-20 mt-1 w-full">
                {suggestions.map((s) => (
                  <li key={s.name}>
                    <button type="button" className="flex w-full justify-between px-3 py-2 text-left text-sm" onClick={() => addTag(s.name)}>
                      <span>{s.name}</span>
                      <span style={{ color: "var(--ck-text-dim)" }}>{s.postCount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="ck-tag">
                {t}
                <button type="button" className="ml-2" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
              </span>
            ))}
          </div>

          {err && <p className="text-sm" style={{ color: "var(--ck-danger)" }}>{err}</p>}
          <button className="ck-btn mt-1">发布</button>
        </form>
      </div>
    </main>
  );
}