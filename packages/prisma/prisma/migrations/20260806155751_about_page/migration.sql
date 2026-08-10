-- CreateTable
CREATE TABLE "AboutPage" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "introFr" TEXT NOT NULL,
    "introEn" TEXT NOT NULL,
    "bodyFr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "heroImageId" TEXT,
    "seoTitleFr" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionFr" TEXT,
    "seoDescriptionEn" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AboutPage" ADD CONSTRAINT "AboutPage_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
