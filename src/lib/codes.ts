import { Prisma } from "@prisma/client";
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

function toCode(row: CodeRow): SensitivityCode {
  const published = row.createdAt.toISOString().slice(0, 10);
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
  };
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
         s."createdAt" AS "createdAt"
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
    LIMIT 60
  `);
  return rows.map(toCode);
}

export async function findCode(id: string) {
  const rows = await prisma.$queryRaw<CodeRow[]>(Prisma.sql`
    ${Prisma.raw(codeSelect)}
    WHERE s.id = ${id} AND s.status = 'LIVE'
    LIMIT 1
  `);
  return rows[0] ? toCode(rows[0]) : null;
}

export async function listGameNames() {
  const games = await prisma.game.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: { name: true },
  });
  return games.map((game) => game.name);
}
