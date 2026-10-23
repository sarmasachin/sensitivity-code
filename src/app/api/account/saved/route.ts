import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { listSavedCodes } from "@/lib/code-actions";

export async function GET() {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ codes: [] }, { status: 401 });
  return Response.json({ codes: await listSavedCodes(user.id) });
}
