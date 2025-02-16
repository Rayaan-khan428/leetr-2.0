-- AlterTable
ALTER TABLE "user_problems" ADD COLUMN     "difficultyRating" INTEGER;

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "friendActivitySMS" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "user_problems_solvedAt_idx" ON "user_problems"("solvedAt");

-- CreateIndex
CREATE INDEX "user_problems_userId_difficulty_idx" ON "user_problems"("userId", "difficulty");

-- CreateIndex
CREATE INDEX "users_email_displayName_idx" ON "users"("email", "displayName");
