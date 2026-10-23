import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { findCode } from "@/lib/codes";
import { updateOwnedCode } from "@/lib/update-code";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  await connection();
  const { id } = await context.params;
  const code = await findCode(id);
  if (!code) return Response.json({ code: null }, { status: 404 });
  return Response.json({ code });
}

export async function POST(request: Request, context: Context) {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in with the email that owns this code." }, { status: 401 });
  const form = await request.formData();
  const proof = form.get("proof");
  const photo = form.get("photo");
  const { id } = await context.params;
  try {
    const result = await updateOwnedCode(user.id, id, {
      game: String(form.get("game") ?? ""),
      phone: String(form.get("phone") ?? ""),
      code: String(form.get("code") ?? ""),
      fingers: String(form.get("fingers") ?? ""),
      gyro: String(form.get("gyro") ?? ""),
      gyroMode: String(form.get("gyroMode") ?? ""),
      player: String(form.get("player") ?? ""),
      playStyle: String(form.get("playStyle") ?? ""),
      ram: String(form.get("ram") ?? ""),
      fps: String(form.get("fps") ?? ""),
      rank: String(form.get("rank") ?? ""),
      kills: String(form.get("kills") ?? ""),
      wins: String(form.get("wins") ?? ""),
      kd: String(form.get("kd") ?? ""),
      season: String(form.get("season") ?? ""),
      tip: String(form.get("tip") ?? ""),
      proof: proof instanceof Blob ? Buffer.from(await proof.arrayBuffer()) : null,
      proofType: proof instanceof Blob ? proof.type : "",
      photo: photo instanceof Blob ? Buffer.from(await photo.arrayBuffer()) : null,
      photoType: photo instanceof Blob ? photo.type : "",
    });
    if ("error" in result) return Response.json(result, { status: 400 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Could not save these details." }, { status: 500 });
  }
}
