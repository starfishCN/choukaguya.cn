"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-lg font-bold">登录</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="邮箱" className="rounded border px-3 py-2 text-black" />
        <input name="password" type="password" required placeholder="密码" className="rounded border px-3 py-2 text-black" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="rounded bg-indigo-600 py-2 text-white">登录</button>
      </form>
    </main>
  );
}