import { prisma } from "./prisma";

export type CardFields = {
  title: string;
  name: string;
  player: string;
  region: string;
  rank: string;
  kd: string;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function readIdCard(userId: string) {
  return prisma.idCard.findUnique({
    where: { userId },
    select: { title: true, name: true, player: true, region: true, rank: true, kd: true },
  });
}

export async function writeIdCard(userId: string, input: CardFields) {
  const data = {
    title: clean(input.title, 40) || "PUBG LICENSE",
    name: clean(input.name, 40),
    player: clean(input.player, 40),
    region: clean(input.region, 40) || "INDIA",
    rank: clean(input.rank, 40),
    kd: clean(input.kd, 20),
  };
  await prisma.idCard.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return data;
}
