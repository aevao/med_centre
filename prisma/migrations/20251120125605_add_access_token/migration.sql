-- AlterTable
ALTER TABLE "Request" ADD COLUMN "accessToken" TEXT;
UPDATE "Request" SET "accessToken" = lower(hex(randomblob(16))) WHERE "accessToken" IS NULL;
