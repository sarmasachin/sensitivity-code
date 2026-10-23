import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { listOwnerCodes } from "@/lib/publish-code";

export async function GET() {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ codes: [] }, { status: 401 });
  return Response.json({ codes: await listOwnerCodes(user.id) });
}
