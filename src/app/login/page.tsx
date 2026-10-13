"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const r = useRouter();
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
    else setErr("邮箱或密码错误");
  };
  return (
    <main className="relative z-10 mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="ck-panel p-7">
        <h1 className="ck-title mb-1 text-lg font-bold">登录</h1>
        <p className="mb-5 text-xs" style={{ color: "var(--ck-text-dim)" }}>欢迎回到月读空间</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="email" type="email" required placeholder="邮箱" className="ck-input" />
          <input name="password" type="password" required placeholder="密码" className="ck-input" />
          {err && <p className="text-sm" style={{ color: "var(--ck-danger)" }}>{err}</p>}
          <button className="ck-btn mt-1">登录</button>
        </form>
        <p className="mt-6 text-xs" style={{ color: "var(--ck-text-dim)" }}>
          还没有账号？<Link href="/register" className="underline" style={{ color: "var(--ck-accent)" }}>注册</Link>
          {" · "}<Link href="/" className="underline" style={{ color: "var(--ck-accent)" }}>返回广场</Link>
        </p>
      </div>
    </main>
  );
}