"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";

type Character = {
  id: string; slug: string; name: string; nameJa: string | null; nameEn: string | null;
  cv: string | null; profile: string | null; avatarUrl: string | null;
};
type Work = {
  id: string; slug: string; title: string; titleJa: string | null;
  category: "LORE" | "MUSIC" | "OTHER"; body: string | null; externalUrl: string | null;
};

export default function Wiki() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"characters" | "lore" | "music">("characters");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    fetch("/api/wiki").then((r) => r.json()).then((d) => {
      setCharacters(d.characters ?? []);
      setWorks(d.works ?? []);
    });
  }, []);

  const lore = works.filter((w) => w.category === "LORE" || w.category === "OTHER");
  const music = works.filter((w) => w.category === "MUSIC");

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
      <p className="mb-4 text-sm">
        <Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>← {t.backToPlaza}</Link>
      </p>
      <h1 className="ck-title mb-6 text-2xl font-bold">{t.wikiTitle}</h1>

      <div className="mb-6 flex gap-2">
        {([
          ["characters", t.wikiChar],
          ["lore", t.wikiLore],
          ["music", t.wikiMusic],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={tab === k ? "ck-btn" : "ck-btn-ghost"}>
            {label}
          </button>
        ))}
      </div>

      {tab === "characters" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {characters.map((c) => (
            <div key={c.id} className="ck-panel flex gap-4 p-4">
              {c.avatarUrl && (
                <img src={c.avatarUrl} alt={c.name} className="h-24 w-24 shrink-0 rounded-lg object-cover"
                  style={{ border: "1px solid var(--ck-line)" }} />
              )}
              <div>
                <h2 className="font-bold" style={{ color: "var(--ck-brand)" }}>{c.name}</h2>
                {(c.nameJa || c.nameEn) && (
                  <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>
                    {c.nameJa}{c.nameJa && c.nameEn ? " / " : ""}{c.nameEn}
                  </p>
                )}
                {c.cv && <p className="mt-1 text-xs" style={{ color: "var(--ck-gold)" }}>CV {c.cv}</p>}
                {c.profile && <p className="mt-2 text-sm leading-relaxed">{c.profile}</p>}
              </div>
            </div>
          ))}
          {characters.length === 0 && (
            <p className="text-sm" style={{ color: "var(--ck-text-dim)" }}>暂无角色词条。</p>
          )}
        </div>
      )}

      {(tab === "lore" || tab === "music") && (
        <div className="flex flex-col gap-3">
          {(tab === "lore" ? lore : music).map((w) => (
            <div key={w.id} className="ck-panel p-4">
              <div className="flex items-baseline gap-2">
                <h2 className="font-bold">{w.title}</h2>
                {w.titleJa && <span className="text-xs" style={{ color: "var(--ck-text-dim)" }}>{w.titleJa}</span>}
              </div>
              {w.body && <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ck-text-dim)" }}>{w.body}</p>}
              {w.externalUrl && (
                <a href={w.externalUrl} className="mt-2 inline-block text-xs underline" style={{ color: "var(--ck-accent)" }}>
                  {w.category === "MUSIC" ? "试听/详情 →" : "详情 →"}
                </a>
              )}
            </div>
          ))}
          {(tab === "lore" ? lore : music).length === 0 && (
            <p className="text-sm" style={{ color: "var(--ck-text-dim)" }}>暂无条目。</p>
          )}
        </div>
      )}

      <footer className="mt-12 border-t pt-6 text-center text-xs"
        style={{ borderColor: "var(--ck-line)", color: "var(--ck-text-dim)" }}>
        {t.footer}
      </footer>
    </main>
  );
}