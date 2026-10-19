import { connection } from "next/server";
import { listGameNames } from "@/lib/codes";

export async function GET() {
  await connection();
  const games = await listGameNames();
  return Response.json({ games });
}
