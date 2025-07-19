/*
  Warnings:

  - You are about to drop the column `description` on the `Permission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permission"
RENAME COLUMN "description" TO "content";
