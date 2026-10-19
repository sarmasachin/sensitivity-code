-- Trigram search so phone, code, and player text do not scan the whole table.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "SensitivitySubmission_phone_trgm"
ON "SensitivitySubmission" USING gin ("phone" gin_trgm_ops);

CREATE INDEX "SensitivitySubmission_code_trgm"
ON "SensitivitySubmission" USING gin ("code" gin_trgm_ops);

CREATE INDEX "SensitivitySubmission_profileName_trgm"
ON "SensitivitySubmission" USING gin ("profileName" gin_trgm_ops);

CREATE INDEX "SensitivitySubmission_gameId_status_fingers_idx"
ON "SensitivitySubmission" ("gameId", "status", "fingers");

-- Gallery only reads live rows.
CREATE INDEX "SensitivitySubmission_live_latest"
ON "SensitivitySubmission" ("gameId", "createdAt" DESC)
WHERE "status" = 'LIVE';

CREATE INDEX "SensitivitySubmission_live_working"
ON "SensitivitySubmission" ("gameId", "workingCount" DESC)
WHERE "status" = 'LIVE';

ALTER TABLE "SubmissionSlug"
ADD CONSTRAINT "SubmissionSlug_gameId_fkey"
FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
