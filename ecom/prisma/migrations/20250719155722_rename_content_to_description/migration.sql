/*
  Warnings:

  - You are about to drop the column `content` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission"
RENAME COLUMN "content" TO "description";
