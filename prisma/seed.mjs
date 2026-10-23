import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { namesByGame } from "./player-names.mjs";

const prisma = new PrismaClient();

const games = [
  { slug: "bgmi", name: "BGMI", sortOrder: 1 },
  { slug: "bgmi-air", name: "BGMI Air", sortOrder: 2 },
  { slug: "pubg-mobile", name: "PUBG Mobile", sortOrder: 3 },
  { slug: "pubg-mobile-flash", name: "PUBG Mobile Flash", sortOrder: 4 },
];

const renames = [
  { from: "bgmi-lite", to: { slug: "bgmi-air", name: "BGMI Air", sortOrder: 2 } },
  { from: "pubg-mobile-lite", to: { slug: "pubg-mobile-flash", name: "PUBG Mobile Flash", sortOrder: 4 } },
];
for (const rename of renames) {
  const existing = await prisma.game.findUnique({ where: { slug: rename.from } });
  if (existing) {
    await prisma.game.update({ where: { slug: rename.from }, data: { ...rename.to, enabled: true } });
  }
}

for (const game of games) {
  await prisma.game.upsert({
    where: { slug: game.slug },
    update: { name: game.name, sortOrder: game.sortOrder, enabled: true },
    create: { ...game, enabled: true },
  });
}

const owner = await prisma.user.upsert({
  where: { emailHash: createHash("sha256").update("seed-gallery@localhost").digest("hex") },
  update: {},
  create: {
    id: "seed-gallery-owner",
    emailHash: createHash("sha256").update("seed-gallery@localhost").digest("hex"),
    maskedEmail: "s***@localhost",
  },
});

const sampleCodes = [
  ["iqoo-z10", "BGMI", "iQOO Z10", "A. Rahman", "GYRO", "FOUR", "8 GB", "Ace", "Assaulter", "7436-2841-1934-5520-8812-4408", 128, 9, "2026-10-06"],
  ["galaxy-a55", "BGMI Air", "Samsung Galaxy A55", "Mehul Shah", "NON_GYRO", "TWO", "8 GB", "Crown", "Sniper", "2201-9088-4412-7730-1654-9021", 86, 14, "2026-10-04"],
  ["nord-ce4", "PUBG Mobile", "OnePlus Nord CE4", "Rafael Costa", "GYRO", "THREE", "8 GB", "Conqueror", "Entry Fragger", "6610-2284-9055-1147-3380-7726", 154, 11, "2026-10-02"],
  ["poco-x6", "PUBG Mobile Flash", "Poco X6", "Yuki Nakamura", "NON_GYRO", "FOUR", "12 GB", null, "Support", "1904-5528-6671-2309-8840-1156", 41, 6, "2026-09-29"],
  ["realme-gt", "BGMI", "Realme GT 6", "Neha Iyer", "GYRO", "FOUR", "12 GB", "Ace Master", "IGL", "8044-1190-2765-6638-4412-9087", 97, 8, "2026-09-26"],
  ["redmi-note", "BGMI Air", "Redmi Note 13", "Arjun Nair", "GYRO", "TWO", "8 GB", "Diamond", "Rusher", "3350-7712-4489-2206-9154-6601", 63, 17, "2026-09-22"],
  ["samsung-m35", "PUBG Mobile", "Samsung Galaxy M35", "Ines Moreau", "NON_GYRO", "THREE", "6 GB", "Crown", "Fragger", "5528-3401-7786-1194-2260-8843", 72, 5, "2026-09-18"],
  ["iqoo-neo", "BGMI", "iQOO Neo 9", "Vikram Sethi", "GYRO", "THREE", "12 GB", null, "Camper", "9182-4460-3307-2251-7704-6619", 39, 4, "2026-09-14"],
];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

const gameSlugs = {
  BGMI: "bgmi",
  "BGMI Air": "bgmi-air",
  "PUBG Mobile": "pubg-mobile",
  "PUBG Mobile Flash": "pubg-mobile-flash",
};

for (const row of sampleCodes) {
  const [id, gameName, phone, player, gyro, fingers, ram, rank, playStyle, code, working, notWorking, day] = row;
  const game = await prisma.game.findUniqueOrThrow({ where: { slug: gameSlugs[gameName] } });
  const phoneSlug = slug(phone);
  const nameSlug = slug(player);
  const createdAt = new Date(`${day}T00:00:00.000Z`);
  await prisma.sensitivitySubmission.upsert({
    where: { id },
    update: {
      workingCount: working,
      notWorkingCount: notWorking,
      profileName: player,
      phone,
      code,
    },
    create: {
      id,
      gameId: game.id,
      ownerId: owner.id,
      code,
      proofPath: `seed/${id}`,
      phone,
      phoneSlug,
      fingers,
      gyro,
      status: "LIVE",
      workingCount: working,
      notWorkingCount: notWorking,
      nameSlug,
      ram,
      rank,
      playStyle,
      profileName: player,
      createdAt,
    },
  });
  await prisma.submissionSlug.upsert({
    where: { gameId_phoneSlug_nameSlug: { gameId: game.id, phoneSlug, nameSlug } },
    update: { isCurrent: true, submissionId: id },
    create: { submissionId: id, gameId: game.id, phoneSlug, nameSlug, isCurrent: true },
  });
}

const phones = [
  "Samsung Galaxy S24", "Samsung Galaxy S23", "Samsung Galaxy A54", "Samsung Galaxy A35", "Samsung Galaxy A15",
  "Samsung Galaxy M34", "Samsung Galaxy F15", "Samsung Galaxy A34", "Samsung Galaxy A14", "Samsung Galaxy M14",
  "Redmi Note 12", "Redmi Note 12 Pro", "Redmi Note 11", "Redmi 13C", "Redmi 12",
  "Poco X5", "Poco M6 Pro", "Poco F5", "Poco X4 Pro", "Poco M4 Pro",
  "Realme Narzo 60", "Realme 11", "Realme 12 Pro", "Realme C55", "Realme Narzo 50",
  "OnePlus Nord CE3", "OnePlus 12R", "OnePlus Nord 3", "OnePlus Nord CE2", "iQOO Z9",
  "iQOO 12", "iQOO Neo 7", "vivo V29", "vivo T2", "vivo Y28",
  "vivo Y100", "OPPO Reno 11", "OPPO A79", "Motorola G54", "Motorola Edge 40",
  "Nothing Phone 2", "Nothing Phone 2a", "Infinix Note 30", "Infinix Hot 30", "Tecno Camon 20",
  "Tecno Spark 10", "Lava Blaze 2", "Micromax In Note 2", "Google Pixel 7a", "Google Pixel 8",
];
const ranks = ["Ace", "Crown", "Diamond", "Conqueror", "Ace Master"];
const playStyles = ["Sniper", "Rusher", "Assaulter", "Support", "IGL", "Fragger", "Camper", "Entry Fragger"];
const fingerSets = ["TWO", "THREE", "FOUR"];
const gyroSets = ["GYRO", "NON_GYRO"];
const ramSets = ["6 GB", "8 GB", "12 GB"];

function chunk(n) {
  return String(1000 + (Math.abs(n) % 9000)).padStart(4, "0");
}

for (const [gameName, gameSlug] of Object.entries(gameSlugs)) {
  const game = await prisma.game.findUniqueOrThrow({ where: { slug: gameSlug } });
  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    const player = namesByGame[gameSlug][i];
    const id = `seo-${gameSlug}-${i + 1}`;
    const phoneSlug = slug(phone);
    const nameSlug = slug(player);
    const createdAt = new Date(Date.UTC(2026, 7, 1) + i * 86400000);
    const code = [0, 1, 2, 3, 4, 5].map((part) => chunk(i * 31 + part * 17 + gameName.length * 13)).join("-");
    await prisma.sensitivitySubmission.upsert({
      where: { id },
      update: { phone, profileName: player, nameSlug, code, status: "LIVE" },
      create: {
        id,
        gameId: game.id,
        ownerId: owner.id,
        code,
        proofPath: `seed/${id}`,
        phone,
        phoneSlug,
        fingers: fingerSets[i % fingerSets.length],
        gyro: gyroSets[i % gyroSets.length],
        status: "LIVE",
        workingCount: 20 + (i % 50),
        notWorkingCount: i % 4,
        nameSlug,
        ram: ramSets[i % ramSets.length],
        rank: ranks[i % ranks.length],
        playStyle: playStyles[i % playStyles.length],
        profileName: player,
        createdAt,
      },
    });
    await prisma.submissionSlug.updateMany({ where: { submissionId: id }, data: { isCurrent: false } });
    await prisma.submissionSlug.upsert({
      where: { gameId_phoneSlug_nameSlug: { gameId: game.id, phoneSlug, nameSlug } },
      update: { isCurrent: true, submissionId: id },
      create: { submissionId: id, gameId: game.id, phoneSlug, nameSlug, isCurrent: true },
    });
  }
}

const saved = await prisma.game.findMany({ orderBy: { sortOrder: "asc" } });
const codes = await prisma.sensitivitySubmission.count();
console.log(saved.map((game) => game.slug).join(", "), `codes=${codes}`);

await prisma.$disconnect();
