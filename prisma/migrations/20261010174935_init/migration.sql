-- CreateEnum
CREATE TYPE "SessionKind" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'EDIT', 'ADMIN_LOGIN');

-- CreateEnum
CREATE TYPE "GyroKind" AS ENUM ('GYRO', 'NON_GYRO');

-- CreateEnum
CREATE TYPE "FingerCount" AS ENUM ('TWO', 'THREE', 'FOUR');

-- CreateEnum
CREATE TYPE "GyroMode" AS ENUM ('SCOPE_ON', 'ALWAYS_ON');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('LIVE', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "VoteValue" AS ENUM ('WORKING', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FAKE_SCREENSHOT', 'WRONG_CODE', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "LandingStatus" AS ENUM ('SUGGESTED', 'SKIPPED', 'PUBLISHED', 'REJECTED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "LandingSource" AS ENUM ('SYSTEM', 'ADMIN_MANUAL');

-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('VIEW', 'MODERATE', 'GAMES', 'REPORTS', 'LANDINGS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "maskedEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "SessionKind" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOtp" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestIp" TEXT,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRateLimit" (
    "id" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "iconPath" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitivitySubmission" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "proofPath" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneSlug" TEXT NOT NULL,
    "fingers" "FingerCount" NOT NULL,
    "gyro" "GyroKind" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'LIVE',
    "workingCount" INTEGER NOT NULL DEFAULT 0,
    "notWorkingCount" INTEGER NOT NULL DEFAULT 0,
    "nameSlug" TEXT NOT NULL,
    "gyroMode" "GyroMode",
    "fps" TEXT,
    "ram" TEXT,
    "playStyle" TEXT,
    "tip" TEXT,
    "profileName" TEXT,
    "profileImagePath" TEXT,
    "rank" TEXT,
    "kills" INTEGER,
    "wins" INTEGER,
    "kd" DECIMAL(6,2),
    "seasonNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensitivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionSlug" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "phoneSlug" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionSlug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitivityCodeVote" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" "VoteValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensitivityCodeVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitivityCodeReport" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "note" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SensitivityCodeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitivityCodeBookmark" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensitivityCodeBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhonePref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneSlug" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPhonePref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitivityLandingPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gameId" TEXT,
    "phoneSlug" TEXT,
    "gyro" "GyroKind",
    "fingers" "FingerCount",
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "LandingStatus" NOT NULL,
    "source" "LandingSource" NOT NULL,
    "codeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "SensitivityLandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "AdminPermission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "User"("emailHash");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_kind_idx" ON "Session"("userId", "kind");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "EmailOtp_emailHash_purpose_createdAt_idx" ON "EmailOtp"("emailHash", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "EmailOtp_requestIp_createdAt_idx" ON "EmailOtp"("requestIp", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OtpRateLimit_bucketKey_key" ON "OtpRateLimit"("bucketKey");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "Game_enabled_sortOrder_idx" ON "Game"("enabled", "sortOrder");

-- CreateIndex
CREATE INDEX "SensitivitySubmission_gameId_status_createdAt_idx" ON "SensitivitySubmission"("gameId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SensitivitySubmission_gameId_phoneSlug_status_idx" ON "SensitivitySubmission"("gameId", "phoneSlug", "status");

-- CreateIndex
CREATE INDEX "SensitivitySubmission_gyro_status_idx" ON "SensitivitySubmission"("gyro", "status");

-- CreateIndex
CREATE INDEX "SensitivitySubmission_status_notWorkingCount_idx" ON "SensitivitySubmission"("status", "notWorkingCount");

-- CreateIndex
CREATE INDEX "SensitivitySubmission_ownerId_idx" ON "SensitivitySubmission"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "SensitivitySubmission_gameId_phoneSlug_nameSlug_key" ON "SensitivitySubmission"("gameId", "phoneSlug", "nameSlug");

-- CreateIndex
CREATE INDEX "SubmissionSlug_submissionId_isCurrent_idx" ON "SubmissionSlug"("submissionId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionSlug_gameId_phoneSlug_nameSlug_key" ON "SubmissionSlug"("gameId", "phoneSlug", "nameSlug");

-- CreateIndex
CREATE INDEX "SensitivityCodeVote_submissionId_value_idx" ON "SensitivityCodeVote"("submissionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "SensitivityCodeVote_submissionId_userId_key" ON "SensitivityCodeVote"("submissionId", "userId");

-- CreateIndex
CREATE INDEX "SensitivityCodeReport_status_createdAt_idx" ON "SensitivityCodeReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SensitivityCodeReport_submissionId_idx" ON "SensitivityCodeReport"("submissionId");

-- CreateIndex
CREATE INDEX "SensitivityCodeReport_userId_idx" ON "SensitivityCodeReport"("userId");

-- CreateIndex
CREATE INDEX "SensitivityCodeBookmark_userId_idx" ON "SensitivityCodeBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SensitivityCodeBookmark_submissionId_userId_key" ON "SensitivityCodeBookmark"("submissionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPhonePref_userId_key" ON "UserPhonePref"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SensitivityLandingPage_slug_key" ON "SensitivityLandingPage"("slug");

-- CreateIndex
CREATE INDEX "SensitivityLandingPage_status_source_idx" ON "SensitivityLandingPage"("status", "source");

-- CreateIndex
CREATE INDEX "SensitivityLandingPage_gameId_phoneSlug_idx" ON "SensitivityLandingPage"("gameId", "phoneSlug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminGrant_userId_permission_key" ON "AdminGrant"("userId", "permission");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivitySubmission" ADD CONSTRAINT "SensitivitySubmission_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivitySubmission" ADD CONSTRAINT "SensitivitySubmission_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionSlug" ADD CONSTRAINT "SubmissionSlug_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SensitivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeVote" ADD CONSTRAINT "SensitivityCodeVote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SensitivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeVote" ADD CONSTRAINT "SensitivityCodeVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeReport" ADD CONSTRAINT "SensitivityCodeReport_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SensitivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeReport" ADD CONSTRAINT "SensitivityCodeReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeBookmark" ADD CONSTRAINT "SensitivityCodeBookmark_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SensitivitySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityCodeBookmark" ADD CONSTRAINT "SensitivityCodeBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhonePref" ADD CONSTRAINT "UserPhonePref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitivityLandingPage" ADD CONSTRAINT "SensitivityLandingPage_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminGrant" ADD CONSTRAINT "AdminGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
