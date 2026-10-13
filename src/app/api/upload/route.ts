import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(req: Request) {
  const uid = await getSessionUser();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "no files" }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];

  for (const file of files) {
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: `file too large: ${file.name}` }, { status: 413 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: `unsupported type: ${file.type}` }, { status: 415 });
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}