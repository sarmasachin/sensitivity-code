import { connection } from "next/server";
import { currentUser } from "@/lib/auth-session";

export async function GET() {
  await connection();
  const user = await currentUser();
  if (!user) return Response.json({ signedIn: false });
  return Response.json({ signedIn: true, maskedEmail: user.maskedEmail });
}
