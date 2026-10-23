import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { FingerCount, GyroKind, GyroMode } from "@prisma/client";
import { prisma } from "./prisma";
import { imageExtension } from "./publish-code";

const fingers: Record<string, FingerCount> = { "2": "TWO", "3": "THREE", "4": "FOUR" };
const gyros: Record<string, GyroKind> = { Gyro: "GYRO", "Non-Gyro": "NON_GYRO" };
const gyroModes: Record<string, GyroMode> = { "Scope On": "SCOPE_ON", "Always On": "ALWAYS_ON" };

type UpdateInput = {
  game: string;
  phone: string;
  code: string;
  fingers: string;
  gyro: string;
  gyroMode: string;
  player: string;
  playStyle: string;
  ram: string;
  fps: string;
  rank: string;
  kills: string;
  wins: string;
  kd: string;
  season: string;
  tip: string;
  proof: Buffer | null;
  proofType: string;
  photo: Buffer | null;
  photoType: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function whole(value: string) {
  if (!value) return { value: null };
  if (!/^\d+$/.test(value)) return { error: "Use numbers for kills and wins." };
  return { value: Number(value) };
}

export async function updateOwnedCode(userId: string, id: string, input: UpdateInput) {
  const current = await prisma.sensitivitySubmission.findFirst({
    where: { id, status: "LIVE" },
    select: { id: true, ownerId: true, gameId: true, phoneSlug: true, nameSlug: true, proofPath: true, profileImagePath: true },
  });
  if (!current) return { error: "This code is not on the gallery." };
  if (current.ownerId !== userId) return { error: "You can only edit your own code." };

  const phone = input.phone.trim().slice(0, 80);
  const code = input.code.trim().slice(0, 80);
  const gameName = input.game.trim().slice(0, 80);
  const finger = fingers[input.fingers];
  const gyro = gyros[input.gyro];
  if (!phone || code.length < 6 || !finger || !gyro) return { error: "Game, phone, code, fingers, and gyro stay required." };
  const game = await prisma.game.findFirst({ where: { name: gameName, enabled: true }, select: { id: true, slug: true } });
  if (!game) return { error: "Choose a game." };
  const gyroMode = gyro === "GYRO" ? gyroModes[input.gyroMode] ?? null : null;
  const kills = whole(input.kills.trim());
  const wins = whole(input.wins.trim());
  if ("error" in kills || "error" in wins) return { error: "Kills and wins should be numbers." };
  const kdText = input.kd.trim();
  if (kdText && !/^\d+(\.\d{1,2})?$/.test(kdText)) return { error: "KD should be a number." };

  const phoneSlug = slug(phone);
  const taken = await prisma.submissionSlug.findFirst({
    where: { gameId: game.id, phoneSlug, nameSlug: current.nameSlug, NOT: { submissionId: id } },
    select: { id: true },
  });
  if (taken) return { error: "That phone already has a page for this code." };

  let proofPath = current.proofPath;
  let profileImagePath = current.profileImagePath;
  if (input.proof) {
    const ext = imageExtension(input.proof, input.proofType);
    if (!ext || input.proof.length > 8 * 1024 * 1024) return { error: "Use a JPEG, PNG, or WebP under 8 MB." };
    proofPath = `/proofs/${id}.${ext}`;
    await mkdir(path.join(process.cwd(), "public", "proofs"), { recursive: true });
    await writeFile(path.join(process.cwd(), "public", "proofs", `${id}.${ext}`), input.proof);
  }
  if (input.photo) {
    const ext = imageExtension(input.photo, input.photoType);
    if (!ext || input.photo.length > 8 * 1024 * 1024) return { error: "Use a JPEG, PNG, or WebP under 8 MB." };
    profileImagePath = `/profiles/${id}.${ext}`;
    await mkdir(path.join(process.cwd(), "public", "profiles"), { recursive: true });
    await writeFile(path.join(process.cwd(), "public", "profiles", `${id}.${ext}`), input.photo);
  }

  await prisma.sensitivitySubmission.update({
    where: { id },
    data: {
      gameId: game.id,
      phone,
      phoneSlug,
      code,
      fingers: finger,
      gyro,
      gyroMode,
      profileName: input.player.trim().slice(0, 80) || null,
      playStyle: input.playStyle.trim().slice(0, 80) || null,
      ram: input.ram.trim().slice(0, 40) || null,
      fps: input.fps.trim().slice(0, 20) || null,
      rank: input.rank.trim().slice(0, 40) || null,
      kills: kills.value,
      wins: wins.value,
      kd: kdText || null,
      seasonNote: input.season.trim().slice(0, 160) || null,
      tip: input.tip.trim().slice(0, 160) || null,
      proofPath,
      profileImagePath,
    },
  });
  await prisma.submissionSlug.updateMany({
    where: { submissionId: id, isCurrent: true },
    data: { gameId: game.id, phoneSlug },
  });
  const detailsPath = proofPath.startsWith("/proofs/") ? `/sensitivity-codes/${game.slug}/${phoneSlug}/${current.nameSlug}` : `/codes/${id}`;
  return { detailsPath };
}
