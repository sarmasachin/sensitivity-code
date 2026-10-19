import { connection } from "next/server";
import { listCodes } from "@/lib/codes";

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
