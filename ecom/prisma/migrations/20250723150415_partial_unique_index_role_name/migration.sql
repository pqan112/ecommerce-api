-- DropIndex
DROP INDEX "Role_name_key";

CREATE UNIQUE INDEX Role_name_unique
ON "Role" (name)
WHERE "deletedAt" IS NULL;
