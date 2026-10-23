import { Prisma } from "@prisma/client";
import { currentUser } from "./auth-session";
import { prisma } from "./prisma";
import { sweepExpired } from "./maintain";
import type { SensitivityCode } from "./code-record";

type CodeRow = {
  id: string;
  game: string;
  phone: string;
  player: string;
  gyro: string;
  fingers: string;
  ram: string;
  rank: string | null;
  playStyle: string;
  code: string;
  working: number;
  notWorking: number;
  createdAt: Date;
  gameSlug: string;
  phoneSlug: string;
  nameSlug: string;
  proofPath: string;
  profilePath: string | null;
  gyroMode: string | null;
  fps: string | null;
  kills: number | null;
  wins: number | null;
  kd: string | number | null;
  season: string | null;
  tip: string | null;
};

function likeTerm(value: string) {
  return `%${value.replace(/[%_\\]/g, "\\$&")}%`;
}

function fingerEnum(value: string | null) {
  if (value === "2" || value === "2F") return "TWO";
  if (value === "3" || value === "3F") return "THREE";
  if (value === "4" || value === "4F") return "FOUR";
  return null;
}

function label(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function publicProof(path: string | null | undefined) {
  return path?.startsWith("/proofs/") ? path : null;
}

function publicProfile(path: string | null | undefined) {
  return path?.startsWith("/profiles/") ? path : null;
}

function gyroModeLabel(value: string | null): SensitivityCode["gyroMode"] {
  if (value === "SCOPE_ON") return "Scope On";
  if (value === "ALWAYS_ON") return "Always On";
  return "";
}

function toCode(row: CodeRow): SensitivityCode {
  const published = row.createdAt.toISOString().slice(0, 10);
  const proofSrc = publicProof(row.proofPath);
  return {
    id: row.id,
    game: row.game,
    phone: row.phone,
    player: row.player,
    gyro: row.gyro === "NON_GYRO" ? "Non-Gyro" : "Gyro",
    fingers: row.fingers === "TWO" ? "2" : row.fingers === "THREE" ? "3" : "4",
    ram: row.ram,
    rank: row.rank,
    playStyle: row.playStyle,
    code: row.code,
    working: Number(row.working),
    notWorking: Number(row.notWorking),
    publishedAt: published,
    publishedLabel: label(row.createdAt),
    detailsPath: proofSrc && row.gameSlug && row.phoneSlug && row.nameSlug ? `/sensitivity-codes/${row.gameSlug}/${row.phoneSlug}/${row.nameSlug}` : null,
    proofSrc,
    profileSrc: publicProfile(row.profilePath),
    gyroMode: gyroModeLabel(row.gyroMode),
    fps: row.fps ?? "",
    kills: row.kills == null ? "" : String(row.kills),
    wins: row.wins == null ? "" : String(row.wins),
    kd: row.kd == null ? "" : String(row.kd),
    season: row.season ?? "",
    tip: row.tip ?? "",
    myVote: null,
    saved: false,
  };
}

async function present(rows: CodeRow[]) {
  const codes = rows.map(toCode);
  let userId: string | null = null;
  try {
    userId = (await currentUser())?.id ?? null;
  } catch {
    userId = null;
  }
  if (!userId || codes.length === 0) return codes;
  const ids = codes.map((code) => code.id);
  const [votes, marks] = await Promise.all([
    prisma.sensitivityCodeVote.findMany({ where: { userId, submissionId: { in: ids } }, select: { submissionId: true, value: true } }),
    prisma.sensitivityCodeBookmark.findMany({ where: { userId, submissionId: { in: ids } }, select: { submissionId: true } }),
  ]);
  const voteById = new Map(votes.map((vote) => [vote.submissionId, vote.value]));
  const savedIds = new Set(marks.map((mark) => mark.submissionId));
  return codes.map((code) => {
    const vote = voteById.get(code.id);
    return { ...code, myVote: vote === "WORKING" ? "working" as const : vote === "NOT_WORKING" ? "broken" as const : null, saved: savedIds.has(code.id) };
  });
}

const codeSelect = `
  SELECT s.id,
         g.name AS game,
         s.phone,
         COALESCE(s."profileName", 'Player') AS player,
         s.gyro::text AS gyro,
         s.fingers::text AS fingers,
         COALESCE(s.ram, '') AS ram,
         s.rank,
         COALESCE(s."playStyle", '') AS "playStyle",
         s.code,
         s."workingCount" AS working,
         s."notWorkingCount" AS "notWorking",
         s."createdAt" AS "createdAt",
         g.slug AS "gameSlug",
         s."phoneSlug" AS "phoneSlug",
         s."nameSlug" AS "nameSlug",
         s."proofPath" AS "proofPath",
         s."profileImagePath" AS "profilePath",
         s."gyroMode"::text AS "gyroMode",
         s.fps,
         s.kills,
         s.wins,
         s.kd::text AS kd,
         s."seasonNote" AS season,
         s.tip
  FROM "SensitivitySubmission" s
  JOIN "Game" g ON g.id = s."gameId"
`;

export async function listCodes(input: {
  game?: string | null;
  q?: string | null;
  gyro?: string | null;
  fingers?: string | null;
  sort?: string | null;
}) {
  await sweepExpired();
  const game = input.game && input.game !== "All" ? input.game.slice(0, 80) : null;
  const gyro = input.gyro === "Gyro" ? "GYRO" : input.gyro === "Non-Gyro" ? "NON_GYRO" : null;
  const fingers = fingerEnum(input.fingers ?? null);
  const q = input.q?.trim().slice(0, 80) || null;
  const like = q ? likeTerm(q) : null;
  const sort = input.sort === "working" ? "working" : "latest";
  const rows = await prisma.$queryRaw<CodeRow[]>(Prisma.sql`
    ${Prisma.raw(codeSelect)}
    WHERE s.status = 'LIVE'
      AND (${game}::text IS NULL OR g.name = ${game})
      AND (${gyro}::text IS NULL OR s.gyro::text = ${gyro})
      AND (${fingers}::text IS NULL OR s.fingers::text = ${fingers})
      AND (
        ${like}::text IS NULL
        OR s.phone ILIKE ${like} ESCAPE '\\'
        OR s.code ILIKE ${like} ESCAPE '\\'
        OR s."profileName" ILIKE ${like} ESCAPE '\\'
      )
    ORDER BY
      CASE WHEN s."notWorkingCount" >= 5 THEN 1 ELSE 0 END,
      CASE WHEN ${sort} = 'working' THEN s."workingCount" ELSE 0 END DESC,
      s."createdAt" DESC
    LIMIT 80
  `);
  return present(rows);
}

export async function findCode(id: string) {
  const rows = await prisma.$queryRaw<CodeRow[]>(Prisma.sql`
    ${Prisma.raw(codeSelect)}
    WHERE s.id = ${id} AND s.status = 'LIVE'
    LIMIT 1
  `);
  const [code] = await present(rows);
  return code ?? null;
}

export async function findPublicCode(game: string, phone: string, name: string) {
  const rows = await prisma.$queryRaw<CodeRow[]>(Prisma.sql`
    ${Prisma.raw(codeSelect)}
    WHERE g.slug = ${game}
      AND s."phoneSlug" = ${phone}
      AND s."nameSlug" = ${name}
      AND s.status = 'LIVE'
      AND s."proofPath" LIKE '/proofs/%'
    LIMIT 1
  `);
  const [code] = await present(rows);
  return code ?? null;
}

export async function listGameNames() {
  const games = await prisma.game.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: { name: true },
  });
  return games.map((game) => game.name);
}
