"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/I18nProvider";

export default function Register() {
  const r = useRouter();
  const { t } = useI18n();
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: f.get("email"), name: f.get("name"), password: f.get("password") }),
    });
    if (res.ok) r.push("/");
    else setErr((await res.json()).error ?? t.registerFail);
  };
  return (
    <main className="relative z-10 mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="ck-panel p-7">
        <h1 className="ck-title mb-1 text-lg font-bold">{t.registerTitle}</h1>
        <p className="mb-5 text-xs" style={{ color: "var(--ck-text-dim)" }}>{t.registerWelcome}</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="email" type="email" required placeholder={t.email} className="ck-input" />
          <input name="name" required placeholder={t.nickname} className="ck-input" />
          <input name="password" type="password" required minLength={8} placeholder={t.passwordRule} className="ck-input" />
          {err && <p className="text-sm" style={{ color: "var(--ck-danger)" }}>{err}</p>}
          <button className="ck-btn mt-1">{t.registerTitle}</button>
        </form>
        <p className="mt-6 text-xs" style={{ color: "var(--ck-text-dim)" }}>
          {t.haveAccount}<Link href="/login" className="underline" style={{ color: "var(--ck-accent)" }}>{t.navLogin}</Link>
          {" · "}<Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>{t.backToPlaza}</Link>
        </p>
      </div>
    </main>
  );
}