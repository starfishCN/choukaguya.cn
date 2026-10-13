"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";

export default function Upload() {
  const r = useRouter();
  const { t } = useI18n();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; postCount: number }[]>([]);
  const [err, setErr] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.status === 401) { r.push("/login"); return; }
    if (!res.ok) { setErr("上传失败：" + ((await res.json()).error ?? res.status)); return; }
    const d = await res.json();
    setImages((prev) => [...prev, ...(d.urls ?? [])]);
  };

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
        images,
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
        <Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>← {t.backToPlaza}</Link>
      </p>
      <div className="ck-panel p-7">
        <h1 className="ck-title mb-5 text-lg font-bold">{t.uploadTitle}</h1>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="title" required placeholder={t.fieldTitle} className="ck-input" />
          <select name="type" className="ck-input">
            <option value="IMAGE">{t.typeImage}</option>
            <option value="TEXT">{t.typeText}</option>
            <option value="VIDEO">{t.typeVideo}</option>
            <option value="MUSIC">{t.typeMusic}</option>
          </select>
          <div className="flex flex-col gap-2">
            <input type="file" accept="image/*" multiple
              onChange={(e) => uploadFiles(e.target.files)}
              className="ck-input" />
            {uploading && <p className="text-xs" style={{ color: "var(--ck-accent)" }}>{t.uploading}</p>}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((u) => (
                  <div key={u} className="relative">
                    <img src={u} alt="" className="h-20 w-20 rounded object-cover"
                      style={{ border: "1px solid var(--ck-line)" }} />
                    <button type="button" onClick={() => setImages(images.filter((x) => x !== u))}
                      className="absolute -right-1 -top-1 rounded-full px-1 text-xs"
                      style={{ background: "var(--ck-danger)", color: "#fff" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input name="description" placeholder={t.fieldDesc} className="ck-input" />
          <input name="sourceUrl" placeholder={t.fieldSource} className="ck-input" />
          <input name="authorName" placeholder={t.fieldAuthor} className="ck-input" />

          <div className="relative">
            <input
              value={tagInput}
              onChange={(e) => onTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput.trim()); } }}
              placeholder={t.tagPlaceholder}
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
          <button className="ck-btn mt-1">{t.publish}</button>
        </form>
      </div>
    </main>
  );
}