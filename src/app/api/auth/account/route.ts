import { connection } from "next/server";
import { passwordAccountExists } from "@/lib/account-auth";

export async function GET(request: Request) {
  await connection();
  const email = new URL(request.url).searchParams.get("email") ?? "";
  return Response.json({ exists: await passwordAccountExists(email) });
}
