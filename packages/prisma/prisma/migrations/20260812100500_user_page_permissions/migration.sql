-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pagesRestricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowedPages" TEXT[] DEFAULT ARRAY[]::TEXT[];
