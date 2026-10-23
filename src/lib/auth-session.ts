import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export const sessionCookie = "sensitivity_session";
const month = 30 * 24 * 60 * 60;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: true },
  });
  if (!session || session.kind !== "USER" || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function openSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      tokenHash: tokenHash(token),
      userId,
      kind: "USER",
      expiresAt: new Date(Date.now() + month * 1000),
    },
  });
  return token;
}

export function withSession(userId: string, token: string, body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.cookies.set(sessionCookie, token, cookieOptions(month));
  return response;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie, "", cookieOptions(0));
  return response;
}
