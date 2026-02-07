/*
  Warnings:

  - The primary key for the `verification_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `verification_token` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `verification_token` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `verification_token` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `verification_token` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `verification_token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `verification_token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,token]` on the table `verification_token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires` to the `verification_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `verification_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "verification_token_identifier_value_key";

-- AlterTable
ALTER TABLE "verification_token" DROP CONSTRAINT "verification_token_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
DROP COLUMN "value",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");
