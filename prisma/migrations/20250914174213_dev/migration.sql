/*
  Warnings:

  - Added the required column `numberOfPages` to the `translation_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."translation_requests" ADD COLUMN     "numberOfPages" TEXT NOT NULL DEFAULT '1';
UPDATE "public"."translation_requests" SET "numberOfPages" = '1' WHERE "numberOfPages" IS NULL;
ALTER TABLE "public"."translation_requests" ALTER COLUMN "numberOfPages" DROP DEFAULT;
