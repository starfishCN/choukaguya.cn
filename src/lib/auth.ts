import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
  (await cookies()).set("ck_session", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60*60*24*30 });
}

export async function getSessionUser(): Promise<string | null> {
  const token = (await cookies()).get("ck_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.uid as string) ?? null;
  } catch { return null; }
}
