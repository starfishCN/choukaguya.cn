"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";
import LangSwitch from "@/components/LangSwitch";

type Me = { name: string; role: string } | null;

export default function SiteHeader() {
  const { t } = useI18n();
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  const logout = async () => {
    await fetch("/api/me", { method: "DELETE" });
    setMe(null);
  };

  return (
    <header className="ck-site-header">
      <div className="ck-brand-row">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={t.siteTitle}>
          <div>
            <h1 className="ck-title text-xl font-bold">{t.siteTitle}</h1>
            <p className="text-xs" style={{ color: "var(--ck-text-dim)" }}>{t.siteSub}</p>
          </div>
        </Link>
      </div>
      <div className="ck-header-controls">
        <LangSwitch />
        <nav className="ck-nav">
          <Link href="/wiki" className="ck-nav-link">{t.navWiki}</Link>
          <Link href="/about" className="ck-nav-link">{t.navAbout}</Link>
          <Link href="/upload" className="ck-nav-link">{t.navUpload}</Link>
          {me ? (
            <>
              {(me.role === "ADMIN" || me.role === "OWNER") && (
                <>
                  <Link href="/admin" className="ck-nav-link">{t.navAdmin}</Link>
                  <Link href="/edit" className="ck-nav-link">{t.navEdit ?? "编辑页面"}</Link>
                </>
              )}
              <span className="text-sm" style={{ color: "var(--ck-text-dim)" }}>{me.name}</span>
              <button className="ck-nav-link" onClick={logout}>{t.navLogout}</button>
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
  );
}