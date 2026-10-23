import { connection } from "next/server";
import { endSession } from "@/lib/auth-session";

export async function POST() {
  await connection();
  return endSession();
}
