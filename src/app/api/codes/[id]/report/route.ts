import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { saveReport } from "@/lib/code-actions";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to report this code." }, { status: 401 });
  const { id } = await context.params;
  if (!(await saveReport(user.id, id))) return Response.json({ error: "This code is not on the gallery." }, { status: 404 });
  return Response.json({ sent: true });
}
