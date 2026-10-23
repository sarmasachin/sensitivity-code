import { createHash } from "crypto";
import { prisma } from "./prisma";
import { hashPassword, passwordMatches } from "./password";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function maskEmail(email: string) {
  const [name, host] = email.split("@");
  return `${name.slice(0, 1) || "u"}***@${host}`.slice(0, 80);
}

function emailHash(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

export async function passwordAccountExists(email: string) {
  const value = normalizeEmail(email);
  if (!emailPattern.test(value)) return false;
  const user = await prisma.user.findUnique({
    where: { emailHash: emailHash(value) },
    select: { passwordHash: true },
  });
  return Boolean(user?.passwordHash);
}

export async function signInWithPassword(email: string, password: string) {
  const value = normalizeEmail(email);
  if (!emailPattern.test(value)) return { status: "invalid" as const };
  const hash = emailHash(value);
  const user = await prisma.user.findUnique({ where: { emailHash: hash } });
  if (!user?.passwordHash || !user.passwordSalt) {
    if (password.length < 8) return { status: "short" as const };
    const next = hashPassword(password);
    const saved = await prisma.user.upsert({
      where: { emailHash: hash },
      update: { passwordSalt: next.salt, passwordHash: next.hash },
      create: { emailHash: hash, maskedEmail: maskEmail(value), passwordSalt: next.salt, passwordHash: next.hash },
      select: { id: true },
    });
    return { status: "created" as const, userId: saved.id };
  }
  if (!passwordMatches(password, user.passwordSalt, user.passwordHash)) return { status: "miss" as const };
  return { status: "match" as const, userId: user.id };
}

export async function resetAccountPassword(email: string, password: string) {
  const value = normalizeEmail(email);
  if (!emailPattern.test(value)) return { status: "missing" as const };
  if (password.length < 8) return { status: "short" as const };
  const user = await prisma.user.findUnique({ where: { emailHash: emailHash(value) } });
  if (!user?.passwordHash) return { status: "missing" as const };
  const next = hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordSalt: next.salt, passwordHash: next.hash },
  });
  return { status: "saved" as const, userId: user.id };
}

export async function signInWithOtp(email: string, code: string) {
  const value = normalizeEmail(email);
  if (!emailPattern.test(value) || !/^\d{6}$/.test(code)) return null;
  const hash = emailHash(value);
  const user = await prisma.user.upsert({
    where: { emailHash: hash },
    update: {},
    create: { emailHash: hash, maskedEmail: maskEmail(value) },
    select: { id: true },
  });
  return user.id;
}
