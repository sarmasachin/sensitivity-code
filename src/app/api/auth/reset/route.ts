import { connection } from "next/server";
import { resetAccountPassword } from "@/lib/account-auth";
import { openSession, withSession } from "@/lib/auth-session";

export async function POST(request: Request) {
  await connection();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const result = await resetAccountPassword(String(body?.email ?? ""), String(body?.password ?? ""));
  if (result.status !== "saved") return Response.json(result, { status: 400 });
  return withSession(result.userId, await openSession(result.userId), result);
}
