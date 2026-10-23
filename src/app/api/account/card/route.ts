import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { readIdCard, writeIdCard, type CardFields } from "@/lib/id-card-store";

export async function GET() {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ card: null }, { status: 401 });
  return Response.json({ card: await readIdCard(user.id) });
}

export async function POST(request: Request) {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in to save this card." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as CardFields | null;
  const card = await writeIdCard(user.id, body ?? { title: "", name: "", player: "", region: "", rank: "", kd: "" });
  return Response.json({ card });
}
