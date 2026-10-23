import type { VoteValue } from "@prisma/client";
import { prisma } from "./prisma";

const voteValue: Record<string, VoteValue> = { working: "WORKING", broken: "NOT_WORKING" };

async function liveCode(id: string) {
  return prisma.sensitivitySubmission.findFirst({ where: { id, status: "LIVE" }, select: { id: true } });
}

export async function castVote(userId: string, id: string, value: string) {
  const vote = voteValue[value];
  if (!vote || !(await liveCode(id))) return null;
  await prisma.sensitivityCodeVote.upsert({
    where: { submissionId_userId: { submissionId: id, userId } },
    update: { value: vote },
    create: { submissionId: id, userId, value: vote },
  });
  const [working, notWorking] = await Promise.all([
    prisma.sensitivityCodeVote.count({ where: { submissionId: id, value: "WORKING" } }),
    prisma.sensitivityCodeVote.count({ where: { submissionId: id, value: "NOT_WORKING" } }),
  ]);
  await prisma.sensitivitySubmission.update({
    where: { id },
    data: { workingCount: working, notWorkingCount: notWorking },
  });
  return { working, notWorking };
}

export async function saveBookmark(userId: string, id: string) {
  if (!(await liveCode(id))) return false;
  await prisma.sensitivityCodeBookmark.upsert({
    where: { submissionId_userId: { submissionId: id, userId } },
    update: {},
    create: { submissionId: id, userId },
  });
  return true;
}

export async function saveReport(userId: string, id: string) {
  if (!(await liveCode(id))) return false;
  const existing = await prisma.sensitivityCodeReport.findFirst({
    where: { submissionId: id, userId, status: "OPEN" },
    select: { id: true },
  });
  if (!existing) {
    await prisma.sensitivityCodeReport.create({
      data: { submissionId: id, userId, reason: "OTHER" },
    });
  }
  return true;
}

export async function listSavedCodes(userId: string) {
  const rows = await prisma.sensitivityCodeBookmark.findMany({
    where: { userId, submission: { status: "LIVE" } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      submission: {
        select: { id: true, phone: true, phoneSlug: true, nameSlug: true, proofPath: true, game: { select: { name: true, slug: true } } },
      },
    },
  });
  return rows.map((row) => ({
    id: row.submission.id,
    game: row.submission.game.name,
    phone: row.submission.phone,
    detailsPath: row.submission.proofPath.startsWith("/proofs/")
      ? `/sensitivity-codes/${row.submission.game.slug}/${row.submission.phoneSlug}/${row.submission.nameSlug}`
      : `/codes/${row.submission.id}`,
  }));
}
