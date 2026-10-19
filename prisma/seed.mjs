import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const games = [
  { slug: "bgmi", name: "BGMI", sortOrder: 1 },
  { slug: "bgmi-lite", name: "BGMI Lite", sortOrder: 2 },
  { slug: "pubg-mobile", name: "PUBG Mobile", sortOrder: 3 },
  { slug: "pubg-mobile-lite", name: "PUBG Mobile Lite", sortOrder: 4 },
];

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
  ["galaxy-a55", "BGMI Lite", "Samsung Galaxy A55", "Mehul Shah", "NON_GYRO", "TWO", "8 GB", "Crown", "Sniper", "2201-9088-4412-7730-1654-9021", 86, 14, "2026-10-04"],
  ["nord-ce4", "PUBG Mobile", "OnePlus Nord CE4", "Sana Qureshi", "GYRO", "THREE", "8 GB", "Conqueror", "Entry Fragger", "6610-2284-9055-1147-3380-7726", 154, 11, "2026-10-02"],
  ["poco-x6", "PUBG Mobile Lite", "Poco X6", "Kabir Das", "NON_GYRO", "FOUR", "12 GB", null, "Support", "1904-5528-6671-2309-8840-1156", 41, 6, "2026-09-29"],
  ["realme-gt", "BGMI", "Realme GT 6", "Neha Iyer", "GYRO", "FOUR", "12 GB", "Ace Master", "IGL", "8044-1190-2765-6638-4412-9087", 97, 8, "2026-09-26"],
  ["redmi-note", "BGMI Lite", "Redmi Note 13", "Arjun Nair", "GYRO", "TWO", "8 GB", "Diamond", "Rusher", "3350-7712-4489-2206-9154-6601", 63, 17, "2026-09-22"],
  ["samsung-m35", "PUBG Mobile", "Samsung Galaxy M35", "Ishaan Rao", "NON_GYRO", "THREE", "6 GB", "Crown", "Fragger", "5528-3401-7786-1194-2260-8843", 72, 5, "2026-09-18"],
  ["iqoo-neo", "BGMI", "iQOO Neo 9", "Vikram Sethi", "GYRO", "THREE", "12 GB", null, "Camper", "9182-4460-3307-2251-7704-6619", 39, 4, "2026-09-14"],
];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

const gameSlugs = {
  BGMI: "bgmi",
  "BGMI Lite": "bgmi-lite",
  "PUBG Mobile": "pubg-mobile",
  "PUBG Mobile Lite": "pubg-mobile-lite",
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

const saved = await prisma.game.findMany({ orderBy: { sortOrder: "asc" } });
const codes = await prisma.sensitivitySubmission.count();
console.log(saved.map((game) => game.slug).join(", "), `codes=${codes}`);

await prisma.$disconnect();
