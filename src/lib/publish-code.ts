import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { FingerCount, GyroKind } from "@prisma/client";
import { prisma } from "./prisma";

type PublishInput = {
  ownerId: string;
  game: string;
  phone: string;
  code: string;
  fingers: string;
  gyro: string;
  proof: Buffer;
  proofType: string;
};

const fingers: Record<string, FingerCount> = { "2": "TWO", "3": "THREE", "4": "FOUR" };
const gyros: Record<string, GyroKind> = { Gyro: "GYRO", "Non-Gyro": "NON_GYRO" };

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

export function imageExtension(bytes: Buffer, type: string) {
  if (type === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (type === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

function pickName(taken: Set<string>, gyro: string, finger: string) {
  const gyroSlug = gyro === "Gyro" ? "gyro" : "non-gyro";
  const options = ["player", `player-${gyroSlug}`, `player-${finger}`];
  for (let number = 2; number <= 30; number += 1) options.push(`player-${number}`);
  return options.find((item) => !taken.has(item)) ?? null;
}

export async function publishCode(input: PublishInput) {
  const phone = input.phone.trim().slice(0, 80);
  const code = input.code.trim().slice(0, 80);
  const gameName = input.game.trim().slice(0, 80);
  if (!gameName) return { error: "Choose a game." };
  if (!phone) return { error: "Enter the phone model." };
  if (code.length < 6) return { error: "Enter the sensitivity code." };
  if (!fingers[input.fingers] || !gyros[input.gyro]) return { error: "Choose fingers and gyro." };
  if (input.proof.length < 32 || input.proof.length > 8 * 1024 * 1024) return { error: "Add a JPEG, PNG, or WebP screenshot under 8 MB." };
  const ext = imageExtension(input.proof, input.proofType);
  if (!ext) return { error: "Add a JPEG, PNG, or WebP screenshot under 8 MB." };

  const game = await prisma.game.findFirst({ where: { name: gameName, enabled: true }, select: { id: true, slug: true } });
  if (!game) return { error: "Choose a game." };
  const phoneSlug = slug(phone);
  const used = await prisma.submissionSlug.findMany({
    where: { gameId: game.id, phoneSlug },
    select: { nameSlug: true },
  });
  const nameSlug = pickName(new Set(used.map((row) => row.nameSlug)), input.gyro, input.fingers);
  if (!nameSlug) return { error: "This phone already has too many codes." };

  const id = randomUUID();
  const proofPath = `/proofs/${id}.${ext}`;
  await prisma.sensitivitySubmission.create({
    data: {
      id,
      gameId: game.id,
      ownerId: input.ownerId,
      code,
      proofPath,
      phone,
      phoneSlug,
      fingers: fingers[input.fingers],
      gyro: gyros[input.gyro],
      status: "LIVE",
      nameSlug,
      slugs: { create: { gameId: game.id, phoneSlug, nameSlug, isCurrent: true } },
    },
  });
  try {
    const folder = path.join(process.cwd(), "public", "proofs");
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, `${id}.${ext}`), input.proof);
  } catch {
    await prisma.sensitivitySubmission.delete({ where: { id } });
    return { error: "Could not save the screenshot." };
  }
  return { id, detailsPath: `/sensitivity-codes/${game.slug}/${phoneSlug}/${nameSlug}` };
}

export async function listOwnerCodes(userId: string) {
  const rows = await prisma.sensitivitySubmission.findMany({
    where: { ownerId: userId, status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, phone: true, phoneSlug: true, nameSlug: true, proofPath: true, game: { select: { name: true, slug: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    game: row.game.name,
    phone: row.phone,
    detailsPath: row.proofPath.startsWith("/proofs/") ? `/sensitivity-codes/${row.game.slug}/${row.phoneSlug}/${row.nameSlug}` : null,
  }));
}
