"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const r = useRouter();
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
    else setErr((await res.json()).error ?? "failed");
  };
  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-lg font-bold">注册</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="邮箱" className="rounded border px-3 py-2 text-black" />
        <input name="name" required placeholder="昵称" className="rounded border px-3 py-2 text-black" />
        <input name="password" type="password" required minLength={8} placeholder="密码（至少 8 位）" className="rounded border px-3 py-2 text-black" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="rounded bg-indigo-600 py-2 text-white">注册</button>
      </form>
    </main>
  );
}