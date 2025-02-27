/*
  Warnings:

  - You are about to drop the column `categories` on the `user_problems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_problems" DROP COLUMN "categories";

-- DropEnum
DROP TYPE "ProblemCategory";
