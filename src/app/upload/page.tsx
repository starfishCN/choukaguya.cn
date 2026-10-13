"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-4 text-lg font-bold">投稿</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="title" required placeholder="标题" className="rounded border px-3 py-2 text-black" />
        <select name="type" className="rounded border px-3 py-2 text-black">
          <option value="IMAGE">同人图</option>
          <option value="TEXT">同人文</option>
          <option value="VIDEO">视频</option>
          <option value="MUSIC">音乐</option>
        </select>
        <textarea name="images" required placeholder="图片链接，每行一个" rows={3} className="rounded border px-3 py-2 text-black" />
        <textarea name="description" placeholder="描述（可选）" rows={2} className="rounded border px-3 py-2 text-black" />
        <input name="sourceUrl" placeholder="原作出处链接（收录他人作品时填）" className="rounded border px-3 py-2 text-black" />
        <input name="authorName" placeholder="原作者名（收录他人作品时填）" className="rounded border px-3 py-2 text-black" />

        <div className="relative">
          <input
            value={tagInput}
            onChange={(e) => onTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput.trim()); } }}
            placeholder="输入 tag，回车添加（自动补全）"
            className="w-full rounded border px-3 py-2 text-black"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full rounded border bg-white text-black shadow">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button type="button" className="flex w-full justify-between px-3 py-1 hover:bg-gray-100" onClick={() => addTag(s.name)}>
                    <span>{s.name}</span><span className="text-gray-400">{s.postCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800">
              {t} <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
            </span>
          ))}
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="rounded bg-indigo-600 py-2 text-white">发布</button>
      </form>
    </main>
  );
}