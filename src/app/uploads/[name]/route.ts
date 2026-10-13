import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", avif: "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // 防目录穿越
  if (name.includes("/") || name.includes("..")) return new NextResponse("bad", { status: 400 });
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!MIME[ext]) return new NextResponse("bad type", { status: 400 });
  try {
    const buf = await readFile(path.join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": MIME[ext], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}