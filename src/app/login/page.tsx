"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";
import SiteHeader from "@/components/SiteHeader";

export default function Login() {
  const r = useRouter();
  const { t } = useI18n();
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
    });
    if (res.ok) r.push("/");
    else setErr(t.loginFail);
  };
  return (
    <main className="ck-shell relative z-10 pb-16">
      <SiteHeader />
      <div className="ck-auth-box ck-panel p-7">
        <h1 className="ck-title mb-1 text-lg font-bold">{t.loginTitle}</h1>
        <p className="mb-5 text-xs" style={{ color: "var(--ck-text-dim)" }}>{t.loginWelcome}</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="email" type="email" required placeholder={t.email} className="ck-input" />
          <input name="password" type="password" required placeholder={t.password} className="ck-input" />
          {err && <p className="text-sm" style={{ color: "var(--ck-danger)" }}>{err}</p>}
          <button className="ck-btn mt-1">{t.loginTitle}</button>
        </form>
        <p className="mt-6 text-xs" style={{ color: "var(--ck-text-dim)" }}>
          {t.noAccount}<Link href="/register" className="underline" style={{ color: "var(--ck-accent)" }}>{t.navRegister}</Link>
          {" · "}<Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>{t.backToPlaza}</Link>
        </p>
      </div>
    </main>
  );
}