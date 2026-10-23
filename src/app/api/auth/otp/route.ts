import { connection } from "next/server";
import { signInWithOtp } from "@/lib/account-auth";
import { openSession, withSession } from "@/lib/auth-session";

export async function POST(request: Request) {
  await connection();
  const body = (await request.json().catch(() => null)) as { email?: string; code?: string } | null;
  const userId = await signInWithOtp(String(body?.email ?? ""), String(body?.code ?? ""));
  if (!userId) return Response.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  return withSession(userId, await openSession(userId), { ok: true });
}
