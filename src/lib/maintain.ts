import { prisma } from "./prisma";

let sweptAt = 0;

export async function sweepExpired() {
  const now = Date.now();
  if (now - sweptAt < 10 * 60 * 1000) return;
  sweptAt = now;
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  await prisma.emailOtp.deleteMany({ where: { expiresAt: { lt: dayAgo } } });
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
}
