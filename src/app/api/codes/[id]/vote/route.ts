import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { castVote } from "@/lib/code-actions";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to mark a code." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { value?: string } | null;
  const { id } = await context.params;
  const counts = await castVote(user.id, id, String(body?.value ?? ""));
  if (!counts) return Response.json({ error: "This code is not on the gallery." }, { status: 404 });
  return Response.json(counts);
}
