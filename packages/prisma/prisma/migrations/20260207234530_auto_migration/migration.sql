/*
  Warnings:

  - The values [INFO,WARNING,SUCCESS,ERROR] on the enum `AnnouncementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "BlogLocale" AS ENUM ('fr', 'en');

-- AlterEnum
BEGIN;
CREATE TYPE "AnnouncementType_new" AS ENUM ('info', 'warning', 'promo', 'success', 'error');
ALTER TABLE "public"."Announcement" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Announcement" ALTER COLUMN "type" TYPE "AnnouncementType_new" USING ("type"::text::"AnnouncementType_new");
ALTER TYPE "AnnouncementType" RENAME TO "AnnouncementType_old";
ALTER TYPE "AnnouncementType_new" RENAME TO "AnnouncementType";
DROP TYPE "public"."AnnouncementType_old";
ALTER TABLE "Announcement" ALTER COLUMN "type" SET DEFAULT 'info';
COMMIT;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "type" SET DEFAULT 'info';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "locale" "BlogLocale" NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
