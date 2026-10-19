import { connection } from "next/server";
import { findCode } from "@/lib/codes";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  await connection();
  const { id } = await context.params;
  const code = await findCode(id);
  if (!code) return Response.json({ code: null }, { status: 404 });
  return Response.json({ code });
}
