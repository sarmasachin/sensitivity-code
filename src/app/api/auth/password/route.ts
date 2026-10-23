import { connection } from "next/server";
import { openSession, withSession } from "@/lib/auth-session";
import { signInWithPassword } from "@/lib/account-auth";

export async function POST(request: Request) {
  await connection();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const result = await signInWithPassword(String(body?.email ?? ""), String(body?.password ?? ""));
  if (result.status === "invalid") return Response.json({ error: "Enter the email you want on this gallery." }, { status: 400 });
  if (result.status === "short" || result.status === "miss") return Response.json(result, { status: 400 });
  return withSession(result.userId, await openSession(result.userId), result);
}
