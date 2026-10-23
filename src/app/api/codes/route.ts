import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";
import { listCodes } from "@/lib/codes";
import { publishCode } from "@/lib/publish-code";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const codes = await listCodes({
    game: url.searchParams.get("game"),
    q: url.searchParams.get("q"),
    gyro: url.searchParams.get("gyro"),
    fingers: url.searchParams.get("finger"),
    sort: url.searchParams.get("sort"),
  });
  return Response.json({ codes });
}

export async function POST(request: Request) {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in before you submit." }, { status: 401 });
  const form = await request.formData();
  const proof = form.get("proof");
  if (!(proof instanceof Blob)) return Response.json({ error: "Add a proof screenshot." }, { status: 400 });
  try {
    const result = await publishCode({
      ownerId: user.id,
      game: String(form.get("game") ?? ""),
      phone: String(form.get("phone") ?? ""),
      code: String(form.get("code") ?? ""),
      fingers: String(form.get("fingers") ?? ""),
      gyro: String(form.get("gyro") ?? ""),
      proof: Buffer.from(await proof.arrayBuffer()),
      proofType: proof.type,
    });
    if ("error" in result) return Response.json(result, { status: 400 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Could not submit this code." }, { status: 500 });
  }
}
